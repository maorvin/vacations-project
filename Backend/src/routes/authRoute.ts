import { Router, Request, Response } from 'express';
import { sql } from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/secrets';

const router = Router();

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role: string;
}

// ==========================
// REGISTER ROUTE
// ==========================
router.post('/register', async (req: Request, res: Response) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'all fields are required' });
        }
    
        if (password.length < 12) { 
            return res.status(400).json({ error: 'password must be at least 12 characters long' });
        }

        const existingUser = await sql.query('SELECT * from users WHERE email = $1', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email is already taken' });
        }
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const newUser = await sql.query(
            `INSERT INTO users (first_name, last_name, email, password, role)
             VALUES ($1, $2, $3, $4, 'user')
             RETURNING user_id, first_name, last_name, email, role`,
            [first_name, last_name, email, hashedPassword]
        );
        
        return res.status(201).json({
            message: 'User registered successfully',
            user: newUser[0]
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================
// LOGIN ROUTE
// ==========================
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        if (!password || !email) {
            return res.status(400).json({ error: "email and password are required" });
        }

        const userResult = await sql.query('SELECT * from users WHERE email = $1', [email]);
        
        if (userResult.length === 0) {
            return res.status(400).json({ error: "user not exists" });
        }

        const user: User = userResult[0] as User;
        
        const isPasswordValid = await bcrypt.compare(password,user.password || '')
        if(!isPasswordValid){
            return res.status(401).json({error:"Invalid email or password"})
        }
        const token = jwt.sign(
            {user_id: user.user_id, role: user.role},
            JWT_SECRET,
            {expiresIn: '2h'}
        )
        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;