import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainNav from './MainNav';
import { getSessionUser } from '../services/session';
import './css/AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

// מעטפת לדפים: תפריט ראשי + כפתור מרחף להמלצות AI (למשתמשים מחוברים בלבד)
export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const loggedIn = Boolean(getSessionUser());

  return (
    <>
      <MainNav />

      {children}

      {loggedIn && pathname !== '/ai-recommendation' && (
        <button
          type="button"
          className="ai-fab"
          onClick={() => navigate('/ai-recommendation')}
          aria-label="מעבר להמלצות AI"
          title="מעבר להמלצות AI"
        >
          ✨
        </button>
      )}
    </>
  );
}
