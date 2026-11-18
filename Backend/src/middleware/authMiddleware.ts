import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/secrets';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string; // לוודא שיש שדה role בטוקן או בבדיקה
        [key: string]: any;
    };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'אין טוקן אימות, גישה חסומה' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: 'טוקן שגוי או פג תוקף' });
        }
        req.user = user;
        next();
    });
};

// מידלוור חדש שמבודד את בדיקת האדמין
export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'גישה חסומה: נדרשות הרשאות מנהל מערכת בלבד' });
    }
    next();
};