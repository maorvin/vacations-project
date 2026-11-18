import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import {sql} from './config/db';
import authRoutes from './routes/authRoute'; 
import vacationsRoutes from './routes/vacationRoute';
import aiRouter from './routes/ai'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
  res.send('Server is up and running! 🚀');
});

// בדיקת חיבור בסיסית למסד הנתונים
app.get('/api/test-db', async (_req, res) => {
  try {
    const [row] = await sql`SELECT NOW()`;
    res.json({ success: true, time: row.now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use('/api', authRoutes);
app.use('/api/vacations', vacationsRoutes);
app.use('/api/ai', aiRouter);

app.listen(PORT, (err?: Error) => {
  if (err) {
    console.error(`Failed to start server on port ${PORT}:`, err.message);
    process.exit(1);
  }
  console.log(`Server is running on port ${PORT}`);
});



