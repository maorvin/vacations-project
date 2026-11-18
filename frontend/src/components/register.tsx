import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import AuthLayout, { Alert, LoadingDots, trackGlow } from './AuthLayout';



const MIN_PASSWORD = 12;

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const data = await registerUser(formData);
      setSuccessMessage(`ההרשמה בוצעה בהצלחה! שלום ${data.user.first_name}`);
      setFormData({ first_name: '', last_name: '', email: '', password: '' });
      // מעבר לדף ההתחברות אחרי שהמשתמש ראה את הודעת ההצלחה
      setTimeout(() => navigate('/vacations'), 1500);
    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה בעת ההרשמה');
    } finally {
      setLoading(false);
    }
  };

  const passwordOk = formData.password.length >= MIN_PASSWORD;

  return (
    <AuthLayout heading="הרשמה">
      <h1 className="auth__title">ברוכים הבאים ל-Bryce</h1>
      <p className="auth__subtitle">כמה פרטים קטנים ואתם בפנים.</p>

      {error && <Alert type="error">{error}</Alert>}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="auth__group">
          <div className="auth__row">
            <div className="auth__field">
              <input
                id="first_name"
                className="auth__input"
                type="text"
                name="first_name"
                placeholder=" "
                autoComplete="given-name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <label htmlFor="first_name" className="auth__label">שם פרטי</label>
            </div>
            <div className="auth__field">
              <input
                id="last_name"
                className="auth__input"
                type="text"
                name="last_name"
                placeholder=" "
                autoComplete="family-name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
              <label htmlFor="last_name" className="auth__label">שם משפחה</label>
            </div>
          </div>

          <div className="auth__field">
            <input
              id="email"
              className="auth__input"
              type="email"
              name="email"
              placeholder=" "
              autoComplete="email"
              dir="ltr"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="email" className="auth__label">אימייל</label>
          </div>

          <div className="auth__field auth__field--password">
            <input
              id="password"
              className="auth__input"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder=" "
              autoComplete="new-password"
              minLength={MIN_PASSWORD}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="password" className="auth__label">סיסמה</label>
            <button
              type="button"
              className="auth__toggle"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? 'הסתר' : 'הצג'}
            </button>
          </div>
        </div>

        <p className={`auth__hint ${passwordOk ? 'auth__hint--ok' : ''}`}>
          {passwordOk
            ? '✓ הסיסמה באורך תקין'
            : `הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD} תווים (${formData.password.length}/${MIN_PASSWORD})`}
        </p>

        <button type="submit" className="auth__submit" disabled={loading} onMouseMove={trackGlow}>
          {loading ? <LoadingDots /> : 'הסכמה והמשך'}
        </button>

        <p className="auth__legal">
          בלחיצה על "הסכמה והמשך" אני מאשר/ת את תנאי השימוש ומדיניות הפרטיות.
        </p>
      </form>

      <div className="auth__divider">או</div>

      <p className="auth__switch">
        כבר יש לך חשבון? <Link to="/login" className="auth__link">התחברות</Link>
      </p>
    </AuthLayout>
  );
}
