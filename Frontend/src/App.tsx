import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/register';
import Login from './components/login';
import Vacations from './components/vacations';
import AIRecommendation from './components/AIRecommendation'; // 1. ייבוא דף ה-AI
import { ProtectedRoute } from './components/protectedRoutes';
import AIAsk from './components/AIAsk';
import AdminVacations from './components/AdminVacations';
import AdminVacationForm from './components/AdminVacations';
import VacationsReport from './components/VacationsReport';
import About from './components/About';
import { getSessionUser } from './services/session';

// דף הבית: משתמש מחובר עובר לחופשות, אורח לדף ההתחברות
function HomeRedirect() {
  return <Navigate to={getSessionUser() ? '/vacations' : '/login'} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        {/* דף אודות - פתוח גם למשתמשים שאינם רשומים */}
        <Route path="/about" element={<About />} />

        {/* מסך התחברות */}
        <Route path="/login" element={<Login />} />

        {/* מסך הרשמה */}
        <Route path="/register" element={<Register />} />

        {/* מסך החופשות */}
        <Route path="/vacations" element={
          <ProtectedRoute>
            <Vacations />
          </ProtectedRoute>
        }
        />
        

        {/* 2. הוספת מסך ההמלצות של ה-AI תחת ProtectedRoute */}
        <Route path="/ai-recommendation" element={
          <ProtectedRoute>
            <AIRecommendation />
          </ProtectedRoute>
        }
        />
<Route path="/ai-ask" element={<ProtectedRoute><AIAsk /></ProtectedRoute>} />
<Route path="/admin/add-vacation" element={<ProtectedRoute><AdminVacations /></ProtectedRoute>} />
<Route path="/admin/edit-vacation/:id" element={<ProtectedRoute><AdminVacationForm /></ProtectedRoute>} />
<Route path="/admin/report" element={<ProtectedRoute><VacationsReport /></ProtectedRoute>} />

        {/* כתובת ישנה: ניהול החופשות נעשה מתוך דף החופשות */}
        <Route path="/admin/vacations" element={<Navigate to="/vacations" replace />} />

        {/* כל נתיב אחר יחזיר אותנו לדף הבית */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;