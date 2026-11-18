import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './css/Auth.css';

type Props = {
  heading: string;
  children: React.ReactNode;
};

export default function AuthLayout({ heading, children }: Props) {
  return (
    <div className="auth" dir="rtl">
      <header className="auth__topbar">
        <Link to="/" className="auth__logo" aria-label="Bryce">
          <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path d="M16 1.5c-1.6 0-2.9.9-3.8 2.7L3.4 22.4c-1.6 3.4.6 7.6 4.6 7.6 2.4 0 4.6-1.4 8-5 3.4 3.6 5.6 5 8 5 4 0 6.2-4.2 4.6-7.6L19.8 4.2C18.9 2.4 17.6 1.5 16 1.5zm0 20.8c-1.9-2.5-3.2-4.6-3.2-6.4 0-1.9 1.4-3.1 3.2-3.1s3.2 1.2 3.2 3.1c0 1.8-1.3 3.9-3.2 6.4z" />
          </svg>
          bryce
        </Link>

        {/* תפריט לאורחים: הרשמה, התחברות ואודות בלבד */}
        <nav className="auth__nav" aria-label="תפריט ראשי">
          <NavLink to="/login">התחברות</NavLink>
          <NavLink to="/register">הרשמה</NavLink>
          <NavLink to="/about">אודות</NavLink>
        </nav>
      </header>

      <main className="auth__main">
        <section className="auth__card">
          <div className="auth__header">{heading}</div>
          <div className="auth__body">{children}</div>
        </section>
      </main>
    </div>
  );
}

export function trackGlow(e: React.MouseEvent<HTMLButtonElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
  e.currentTarget.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
}

export function LoadingDots() {
  return (
    <span className="auth__dots" aria-label="טוען">
      <span />
      <span />
      <span />
    </span>
  );
}

export function Alert({ type, children }: { type: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <div className={`auth__alert auth__alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="auth__alert-icon" aria-hidden="true">
        {type === 'error' ? '!' : '✓'}
      </span>
      <span>{children}</span>
    </div>
  );
}
