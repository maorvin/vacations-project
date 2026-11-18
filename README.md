# מערכת לניהול חופשות

אתר שבו משתמשים רשומים צופים בחופשות, מסמנים לייק לחופשות שהם אוהבים ומקבלים המלצות טיול מבינה מלאכותית.
מנהל המערכת מוסיף, עורך ומוחק חופשות, וצופה בדוח לייקים שאפשר להוריד כקובץ CSV.

**קישור לפרויקט ב-GitHub:** https://github.com/maorvin/vacations-project

## הרצה עם Docker

צריך רק [Docker](https://www.docker.com/products/docker-desktop/). מתיקיית הפרויקט:

```bash
docker compose up -d --build
```

| שירות | כתובת |
|---|---|
| האתר | http://localhost:3000 |
| השרת (API) | http://localhost:5001 |
| מסד הנתונים (PostgreSQL) | `localhost:5432`, משתמש, סיסמה ושם מסד: `vacations` |

בהפעלה הראשונה מסד הנתונים נוצר אוטומטית עם הטבלאות ועם נתוני התחלה, מתוך [database/init](database/init).

### משתמשי דמו

| תפקיד | אימייל | סיסמה |
|---|---|---|
| מנהל | `admin@demo.com` | `Admin123456!` |
| משתמש | `user@demo.com` | `User123456!!` |

אפשר גם להירשם כמשתמש חדש מדף ההרשמה.

### פקודות שימושיות

```bash
docker compose logs -f backend   # לוגים של השרת
docker compose down              # עצירה (הנתונים נשמרים)
docker compose down -v           # עצירה ומחיקת הנתונים (בהפעלה הבאה ייטענו שוב נתוני ההתחלה)
```

## מפתחות (אופציונלי)

המערכת עולה גם בלי קובץ מפתחות. כדי להפעיל את פיצ'רי ה-AI ולשמור על התחברות גם אחרי הפעלה מחדש של השרת:

```bash
cp backend/.env.example backend/.env
```

ולמלא בקובץ `backend/.env`:

- `GEMINI_API_KEY`: מפתח ל-Gemini, מ-https://aistudio.google.com/apikey. בלעדיו כל המערכת עובדת חוץ מהמלצות ה-AI והשאלות על החופשות.
- `JWT_SECRET`: מחרוזת אקראית ארוכה. בלעדיו השרת יוצר מפתח אקראי בכל הפעלה, והמשתמשים יצטרכו להתחבר מחדש אחרי כל הפעלה מחדש.

הקובץ `.env` לא נשמר ב-git ולא נכנס לאימג' של Docker.

## יכולות

**אורח (לא מחובר):** הרשמה, התחברות ודף אודות.

**משתמש רשום:**
- צפייה בחופשות לפי תאריך התחלה, 9 חופשות בכל עמוד
- סימון והסרת לייק
- סינון: הלייקים שלי, חופשות פעילות כרגע, חופשות שטרם התחילו
- המלצות טיול מ-AI לכל יעד
- שאלות בשפה חופשית על נתוני החופשות (MCP)

**מנהל:**
- הוספה, עריכה ומחיקה של חופשות (במצב ניהול בדף החופשות)
- דוח לייקים לכל יעד בגרף, והורדה כקובץ CSV

## טכנולוגיות

| שכבה | טכנולוגיות |
|---|---|
| צד לקוח | React, TypeScript, Vite, React Router, Chart.js |
| צד שרת | Node.js, Express, TypeScript, JWT, bcrypt |
| מסד נתונים | PostgreSQL |
| AI | Google Gemini |
| הרצה | Docker, Docker Compose, nginx |

## מבנה הפרויקט

```
├── docker-compose.yml       הרצת כל המערכת
├── database/init/           יצירת הטבלאות ונתוני התחלה
├── backend/                 שרת Express + TypeScript
│   └── src/
│       ├── config/          חיבור למסד הנתונים ומפתחות
│       ├── middleware/      אימות משתמש ובדיקת הרשאות מנהל
│       └── routes/          הרשמה והתחברות, חופשות ולייקים, AI
└── frontend/                אתר React
    └── src/
        ├── components/      דפים ורכיבים
        └── services/        קריאות לשרת וניהול המשתמש המחובר
```

## הרצה מקומית בלי Docker (לפיתוח)

צריך Node.js 22 ומסד PostgreSQL. ב-`backend/.env` מגדירים את `DATABASE_URL` לכתובת המסד.

```bash
cd backend && npm install && npm run dev     # שרת על פורט 5001
cd frontend && npm install && npm run dev    # אתר על http://localhost:5173
```

## מפתח

**מאור וינוקור**, מתכנת Full Stack בג׳ון ברייס
[GitHub](https://github.com/maorvin) · maor.vinokur@gmail.com
