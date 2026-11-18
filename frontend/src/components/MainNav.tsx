import { NavLink, useNavigate } from 'react-router-dom';
import { clearSession, getFullName, getSessionUser } from '../services/session';
import './css/AppLayout.css';

// תפריט ראשי שמשתנה לפי סוג המשתמש:
// אורח - הרשמה, התחברות ואודות
// משתמש רשום - חופשות (לייקים + סינון), אודות, שם מלא, התנתקות
// מנהל - בנוסף: דוחות (כולל הורדת CSV). הוספה/עריכה/מחיקה נעשות ממצב הניהול בדף החופשות
export default function MainNav() {
  const navigate = useNavigate();
  const user = getSessionUser();
  const isAdmin = user?.role === 'admin';
  const fullName = getFullName(user);

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="app-nav" aria-label="תפריט ראשי">
      <div className="app-nav__links">
        {!user && (
          <>
            <NavLink to="/login">התחברות</NavLink>
            <NavLink to="/register">הרשמה</NavLink>
          </>
        )}

        {user && (
          <>
            <NavLink to="/vacations" end>חופשות</NavLink>
            {isAdmin && <NavLink to="/admin/report">📊 דוחות</NavLink>}
            <NavLink to="/ai-recommendation">המלצות AI</NavLink>
            <NavLink to="/ai-ask">שאלות על החופשות (MCP)</NavLink>
          </>
        )}

        <NavLink to="/about">אודות</NavLink>
      </div>

      {user && (
        <div className="app-nav__user">
          <span className="app-nav__name" title={fullName}>
            <span className="app-nav__avatar" aria-hidden="true">
              {(user.first_name[0] || '👤').toUpperCase()}
            </span>
            <span className="app-nav__name-text">{fullName || 'משתמש מחובר'}</span>
            {isAdmin && <span className="app-nav__role">מנהל</span>}
          </span>
          <button type="button" className="app-nav__logout" onClick={handleLogout}>
            התנתקות
          </button>
        </div>
      )}
    </nav>
  );
}
