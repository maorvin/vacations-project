import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../config/secrets';
import { sql } from '../config/db'; // ודא שהנתיב לחיבור ה-DB תואם את המבנה אצלך בבקטנד

const router = Router();
// הלקוח נוצר רק כשיש מפתח, כדי שהשרת יעלה גם בלי GEMINI_API_KEY
const ai = GEMINI_API_KEY
    ? new GoogleGenAI({
          apiKey: GEMINI_API_KEY,
          // בלי זה ה-SDK מנסה שוב ושוב על אותו מודל עמוס, והבקשה יכולה להיתקע דקות
          httpOptions: { timeout: 30000, retryOptions: { attempts: 1 } },
      })
    : null;

class AiNotConfiguredError extends Error {}

// סדר המודלים לניסיון: אם הראשון עמוס (503), נגמרה לו המכסה (429) או לא ענה בזמן (504),
// עוברים לבא בתור. מודלי ה-lite עמוסים הרבה פחות ולכן הם הגיבוי.
const MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
const RETRYABLE_STATUSES = [429, 500, 503, 504];

async function generateWithFallback(prompt: string): Promise<string> {
    if (!ai) throw new AiNotConfiguredError();
    let lastError: any = null;
    for (const model of MODELS) {
        try {
            const response = await ai.models.generateContent({ model, contents: prompt });
            return response.text ?? '';
        } catch (err: any) {
            console.warn(`Gemini model ${model} failed (${err.status ?? err.name}):`, err.message?.slice(0, 200));
            lastError = err;
            const retryable = RETRYABLE_STATUSES.includes(err.status) || err.name === 'AbortError' || err.name === 'TimeoutError';
            if (!retryable) break;
        }
    }
    throw lastError ?? new Error('AI generation failed');
}

function sendAiError(res: Response, err: any, fallbackMessage: string) {
    if (err instanceof AiNotConfiguredError) {
        return res.status(503).json({ error: 'פיצ\'רי ה-AI לא מוגדרים בשרת (חסר GEMINI_API_KEY ב-backend/.env).' });
    }
    if (err?.status === 429) {
        return res.status(429).json({ error: 'נגמרה המכסה של מפתח ה-AI. נסה שוב מאוחר יותר.' });
    }
    if (RETRYABLE_STATUSES.includes(err?.status) || err?.name === 'AbortError' || err?.name === 'TimeoutError') {
        return res.status(503).json({ error: 'שירות ה-AI עמוס כרגע. נסה שוב בעוד כמה דקות.' });
    }
    return res.status(500).json({ error: fallbackMessage });
}

// --- ראוט להמלצות על יעד ---
router.post('/recommendation', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const { destination } = req.body;
        
        if (!destination) {
            return res.status(400).json({ error: 'יש לספק יעד לנסיעה' });
        }

        const prompt = `Give me travel recommendations for ${destination}. Provide a brief overview and key highlights with titles and descriptions.`;

        const text = await generateWithFallback(prompt);
        return res.status(200).json({ recommendation: text });
    } catch (err: any) {
        console.error('Detailed Error generating AI recommendation:', err);
        return sendAiError(res, err, 'שגיאה ביצירת ההמלצה מה-AI');
    }
});

// --- ראוט לשאלות על נתוני החופשות (MCP / Data Q&A) ---
router.post('/ask', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const { question } = req.body;
        
        if (!question) {
            return res.status(400).json({ error: 'יש לספק שאלה' });
        }

        const vacations = await sql`SELECT * FROM vacations`;

        const prompt = `
You are an AI assistant for a vacation management system. 
Here is the current list of vacations in our database (in JSON format):
${JSON.stringify(vacations, null, 2)}

User Question: "${question}"

Please answer the user's question accurately based *only* on the provided vacation data. 
If the question asks for counts, averages, or specific destinations, calculate or extract it from the data. 
Answer in a clear, polite, and direct manner (in the language the user asked, or Hebrew if applicable).
`;

        const text = await generateWithFallback(prompt);
        return res.status(200).json({ answer: text });
    } catch (err: any) {
        console.error('Error handling AI ask request:', err);
        return sendAiError(res, err, 'שגיאה בעיבוד השאלה מול ה-AI');
    }
});

export default router;