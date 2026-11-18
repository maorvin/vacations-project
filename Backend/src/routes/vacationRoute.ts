import { Router, Response } from 'express';
import { verifyToken, verifyAdmin, AuthRequest } from '../middleware/authMiddleware';
import { sql } from '../config/db';

const router = Router();

// 1. שליפת כל החופשות (לכל משתמש מחובר)
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        // לכל חופשה: כמה לייקים יש לה, והאם המשתמש המחובר סימן לייק
        const userId = req.user?.user_id ?? null;
        const vacations = await sql`
            SELECT v.*,
                   COUNT(l.user_id)::int AS likes_count,
                   COALESCE(BOOL_OR(l.user_id = ${userId}), false) AS is_liked
            FROM vacations v
            LEFT JOIN likes l ON l.vacation_id = v.vacation_id
            GROUP BY v.vacation_id
            ORDER BY v.start_date ASC
        `;
        return res.status(200).json(vacations);
    } catch (err: any) {
        console.error('Error fetching vacations:', err);
        return res.status(500).json({ error: 'שגיאה בשליפת החופשות' });
    }
});

// בדיקת תקינות משותפת להוספה ולעריכה. מקבל גם את שמות השדות הישנים (description / image_name)
function parseVacationBody(body: any): { data?: any; error?: string } {
    const destination = String(body.destination ?? '').trim();
    const description = String(body.vacation_description ?? body.description ?? '').trim();
    const image = String(body.image_file_name ?? body.image_name ?? '').trim();
    const price = Number(body.price);
    const { start_date, end_date } = body;

    if (!destination || !description || !start_date || !end_date || body.price === undefined || body.price === '') {
        return { error: 'יש למלא את כל שדות החובה' };
    }
    if (!Number.isFinite(price) || price < 0 || price > 10000) {
        return { error: 'המחיר חייב להיות בין 0 ל-10,000' };
    }
    if (Number.isNaN(Date.parse(start_date)) || Number.isNaN(Date.parse(end_date))) {
        return { error: 'תאריך לא תקין' };
    }
    if (new Date(end_date) < new Date(start_date)) {
        return { error: 'תאריך הסיום לא יכול להיות לפני תאריך ההתחלה' };
    }
    return { data: { destination, description, image, price: Math.round(price), start_date, end_date } };
}

// שליפת חופשה בודדת (לטופס העריכה)
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const rows = await sql`SELECT * FROM vacations WHERE vacation_id = ${req.params.id}`;
        if (rows.length === 0) {
            return res.status(404).json({ error: 'החופשה לא נמצאה' });
        }
        return res.status(200).json(rows[0]);
    } catch (err: any) {
        console.error('Error fetching vacation:', err);
        return res.status(500).json({ error: 'שגיאה בשליפת החופשה' });
    }
});

// 2. הוספת חופשה חדשה (מוגן על ידי verifyToken וגם verifyAdmin)
router.post('/', verifyToken, verifyAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { data, error } = parseVacationBody(req.body);
        if (error) {
            return res.status(400).json({ error });
        }

        // vacation_id נוצר אוטומטית במסד (identity), לכן לא שולחים אותו
        const newVacation = await sql`
            INSERT INTO vacations (destination, vacation_description, price, image_file_name, start_date, end_date)
            VALUES (${data.destination}, ${data.description}, ${data.price}, ${data.image}, ${data.start_date}, ${data.end_date})
            RETURNING *
        `;

        return res.status(201).json(newVacation[0]);
    } catch (err: any) {
        console.error('Error adding vacation:', err);
        return res.status(500).json({ error: 'שגיאה בהוספת החופשה' });
    }
});

// עריכת חופשה קיימת (מוגן על ידי verifyToken וגם verifyAdmin)
router.put('/:id', verifyToken, verifyAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { data, error } = parseVacationBody(req.body);
        if (error) {
            return res.status(400).json({ error });
        }

        const updated = await sql`
            UPDATE vacations SET
                destination = ${data.destination},
                vacation_description = ${data.description},
                price = ${data.price},
                image_file_name = ${data.image},
                start_date = ${data.start_date},
                end_date = ${data.end_date}
            WHERE vacation_id = ${req.params.id}
            RETURNING *
        `;

        if (updated.length === 0) {
            return res.status(404).json({ error: 'החופשה לא נמצאה' });
        }
        return res.status(200).json(updated[0]);
    } catch (err: any) {
        console.error('Error updating vacation:', err);
        return res.status(500).json({ error: 'שגיאה בעדכון החופשה' });
    }
});

// סימון לייק לחופשה (כל משתמש מחובר)
router.post('/:id/like', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.user_id;
        const vacationId = Number(req.params.id);
        if (!userId || !Number.isInteger(vacationId)) {
            return res.status(400).json({ error: 'בקשה לא תקינה' });
        }

        const exists = await sql`SELECT 1 FROM vacations WHERE vacation_id = ${vacationId}`;
        if (exists.length === 0) {
            return res.status(404).json({ error: 'החופשה לא נמצאה' });
        }

        // ON CONFLICT: לחיצה כפולה לא תיצור שגיאה או לייק כפול
        await sql`
            INSERT INTO likes (user_id, vacation_id) VALUES (${userId}, ${vacationId})
            ON CONFLICT (user_id, vacation_id) DO NOTHING
        `;
        const [{ likes_count }] = await sql`SELECT COUNT(*)::int AS likes_count FROM likes WHERE vacation_id = ${vacationId}`;
        return res.status(200).json({ is_liked: true, likes_count });
    } catch (err: any) {
        console.error('Error adding like:', err);
        return res.status(500).json({ error: 'שגיאה בשמירת הלייק' });
    }
});

// ביטול לייק
router.delete('/:id/like', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.user_id;
        const vacationId = Number(req.params.id);
        if (!userId || !Number.isInteger(vacationId)) {
            return res.status(400).json({ error: 'בקשה לא תקינה' });
        }

        await sql`DELETE FROM likes WHERE user_id = ${userId} AND vacation_id = ${vacationId}`;
        const [{ likes_count }] = await sql`SELECT COUNT(*)::int AS likes_count FROM likes WHERE vacation_id = ${vacationId}`;
        return res.status(200).json({ is_liked: false, likes_count });
    } catch (err: any) {
        console.error('Error removing like:', err);
        return res.status(500).json({ error: 'שגיאה בביטול הלייק' });
    }
});

// 3. מחיקת חופשה לפי מזהה (מוגן על ידי verifyToken וגם verifyAdmin)
router.delete('/:id', verifyToken, verifyAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // שינוי מ-WHERE id = ${id} ל-WHERE vacation_id = ${id}
        const deleted = await sql`
            DELETE FROM vacations WHERE vacation_id = ${id} RETURNING vacation_id
        `;

        if (deleted.length === 0) {
            return res.status(404).json({ error: 'החופשה לא נמצאה' });
        }

        return res.status(200).json({ message: 'החופשה נמחקה בהצלחה' });
    } catch (err: any) {
        console.error('Error deleting vacation:', err);
        return res.status(500).json({ error: 'שגיאה במחיקת החופשה' });
    }
});

export default router;