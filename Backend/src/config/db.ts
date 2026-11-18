import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in the environment variables.');
}

// עובד גם מול PostgreSQL מקומי (בדוקר) וגם מול Neon בענן.
// SSL נדרש רק כשהכתובת מבקשת אותו (למשל Neon עם sslmode=require)
const useSsl = /sslmode=(require|verify-ca|verify-full)/.test(databaseUrl);

const client = postgres(databaseUrl, {
    ssl: useSsl ? 'require' : false,
    max: 10,
    onnotice: () => {}, // השתקת הודעות NOTICE של PostgreSQL בלוג
});

// sql`...`              - שאילתה עם פרמטרים בטוחים (tagged template)
// sql.query(text, [..]) - שאילתה עם $1, $2... (כמו בקוד הקיים ב-authRoute)
export const sql = Object.assign(client, {
    query: async (text: string, params: any[] = []): Promise<any[]> => client.unsafe(text, params),
});
