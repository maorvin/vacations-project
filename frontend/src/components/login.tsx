import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { saveSession } from '../services/session';
import AuthLayout, { Alert, LoadingDots, trackGlow } from './AuthLayout';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const data = await loginUser(credentials);
      
      // שמירת הטוקן, התפקיד והשם המלא (לתצוגה בתפריט)
      saveSession(data.token, data.user);

      setSuccessMessage(`התחברת בהצלחה! שלום ${data.user.first_name}`);

      // גם משתמש וגם מנהל מגיעים לדף החופשות. למנהל יש שם כפתורי עריכה ומחיקה
      setTimeout(() => navigate('/vacations'), 1000);

    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה בעת ההתחברות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout heading="התחברות">
      <h1 className="auth__title">טוב לראות אותך שוב</h1>
      <p className="auth__subtitle">התחברו כדי להמשיך מאיפה שהפסקתם.</p>

      {error && <Alert type="error">{error}</Alert>}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="auth__group">
          <div className="auth__field">
            <input
              id="login_email"
              className="auth__input"
              type="email"
              name="email"
              placeholder=" "
              autoComplete="email"
              dir="ltr"
              value={credentials.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="login_email" className="auth__label">אימייל</label>
          </div>

          <div className="auth__field auth__field--password">
            <input
              id="login_password"
              className="auth__input"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder=" "
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="login_password" className="auth__label">סיסמה</label>
            <button
              type="button"
              className="auth__toggle"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? 'הסתר' : 'הצג'}
            </button>
          </div>
        </div>

        <button type="submit" className="auth__submit" disabled={loading} onMouseMove={trackGlow}>
          {loading ? <LoadingDots /> : 'התחברות'}
        </button>
      </form>

      <div className="auth__divider">או</div>

      <p className="auth__switch">
        אין לך עדיין חשבון? <Link to="/register" className="auth__link">הרשמה</Link>
      </p>
    </AuthLayout>
  );
}