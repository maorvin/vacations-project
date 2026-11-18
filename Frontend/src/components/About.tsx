import { Link } from 'react-router-dom';
import AppLayout from './AppLayout';
import { getSessionUser } from '../services/session';
import './css/About.css';

const DEVELOPER = {
  name: 'מאור וינוקור',
  role: 'מתכנת Full Stack בג׳ון ברייס',
  email: 'maor.vinokur@gmail.com',
  github: 'https://github.com/maorvin',
};

const FEATURES = [
  { icon: '🏝️', title: 'צפייה בחופשות', text: 'כל החופשות במקום אחד, מסודרות לפי תאריך, 9 בכל עמוד.' },
  { icon: '❤️', title: 'לייקים וסינון', text: 'סימון חופשות אהובות וסינון לפי לייקים, חופשות פעילות או עתידיות.' },
  { icon: '🛠️', title: 'ניהול חופשות', text: 'מנהל המערכת יכול להוסיף, לערוך ולמחוק חופשות.' },
  { icon: '📊', title: 'דוחות', text: 'גרף לייקים לכל יעד והורדת הנתונים כקובץ CSV.' },
  { icon: '✨', title: 'המלצות AI', text: 'המלצות טיול מותאמות ליעד בעזרת בינה מלאכותית.' },
  { icon: '💬', title: 'שאלות על הנתונים (MCP)', text: 'שאלו בשפה חופשית על החופשות וקבלו תשובה מבוססת נתונים.' },
];

const TECH = ['React', 'TypeScript', 'Vite', 'Node.js', 'Express', 'PostgreSQL (Neon)', 'JWT', 'Gemini AI', 'Chart.js'];

export default function About() {
  const loggedIn = Boolean(getSessionUser());

  return (
    <AppLayout>
      <main className="about">
        <section className="about__hero">
          <span className="about__eyebrow">אודות המערכת</span>
          <h1 className="about__title">מערכת לניהול חופשות</h1>
          <p className="about__lead">
            אתר שבו משתמשים רשומים צופים בחופשות, מסמנים את האהובות עליהם ומקבלים המלצות טיול,
            ומנהל המערכת מנהל את החופשות ועוקב אחרי הפופולריות שלהן בדוחות.
          </p>
          {!loggedIn && (
            <div className="about__cta">
              <Link to="/register" className="about__btn about__btn--primary">הרשמה</Link>
              <Link to="/login" className="about__btn">התחברות</Link>
            </div>
          )}
        </section>

        <section className="about__section">
          <h2 className="about__h2">מה אפשר לעשות במערכת</h2>
          <div className="about__features">
            {FEATURES.map((f) => (
              <article key={f.title} className="about__feature">
                <span className="about__feature-icon" aria-hidden="true">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about__section">
          <h2 className="about__h2">טכנולוגיות</h2>
          <ul className="about__tech">
            {TECH.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="about__section">
          <h2 className="about__h2">על המתכנת/ת</h2>
          <article className="about__dev">
            <div className="about__dev-avatar" aria-hidden="true">
              {DEVELOPER.name.trim()[0] || '👩‍💻'}
            </div>
            <div className="about__dev-body">
              <h3 className="about__dev-name">{DEVELOPER.name}</h3>
              <p className="about__dev-role">{DEVELOPER.role}</p>
              <ul className="about__dev-links">
                <li><a href={`mailto:${DEVELOPER.email}`}>✉️ {DEVELOPER.email}</a></li>
                <li><a href={DEVELOPER.github} target="_blank" rel="noreferrer">GitHub</a></li>
              </ul>
            </div>
          </article>
        </section>
      </main>
    </AppLayout>
  );
}
