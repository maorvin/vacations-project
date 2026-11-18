import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// מפתח לחתימת טוקנים (JWT).
// אם לא הוגדר, נוצר מפתח אקראי בכל הפעלה: המערכת עובדת, אבל המשתמשים יצטרכו
// להתחבר מחדש אחרי כל הפעלה מחדש של השרת. אין מפתח קבוע בקוד, כדי שאי אפשר יהיה לזייף טוקנים.
function resolveJwtSecret(): string {
    const fromEnv = process.env.JWT_SECRET?.trim();
    if (fromEnv) return fromEnv;

    console.warn(
        '[security] JWT_SECRET is not set. Using a random secret for this run; ' +
        'users will need to log in again after a restart. Set JWT_SECRET in Backend/.env to keep sessions.'
    );
    return crypto.randomBytes(48).toString('hex');
}

export const JWT_SECRET = resolveJwtSecret();

// מפתח ל-Gemini. בלעדיו כל המערכת עובדת חוץ מפיצ'רי ה-AI
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || '';

if (!GEMINI_API_KEY) {
    console.warn('[ai] GEMINI_API_KEY is not set. AI features will return an error until it is added to Backend/.env.');
}
