// ניהול פרטי המשתמש המחובר במקום אחד (נשמר ב-localStorage)

export interface SessionUser {
  first_name: string;
  last_name: string;
  role: string;
}

const USER_KEY = 'user';

export function saveSession(token: string, user: SessionUser) {
  localStorage.setItem('token', token);
  // 'role' נשמר גם בנפרד כי דפים קיימים קוראים אותו ישירות
  localStorage.setItem('role', user.role);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ first_name: user.first_name, last_name: user.last_name, role: user.role })
  );
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem(USER_KEY);
}

// מחזיר את המשתמש המחובר, או null לאורח
export function getSessionUser(): SessionUser | null {
  if (!localStorage.getItem('token')) return null;
  let stored: Partial<SessionUser> = {};
  try {
    stored = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
  } catch {
    stored = {};
  }
  return {
    first_name: stored.first_name || '',
    last_name: stored.last_name || '',
    role: stored.role || localStorage.getItem('role') || 'user',
  };
}

export function getFullName(user: SessionUser | null) {
  if (!user) return '';
  return `${user.first_name} ${user.last_name}`.trim();
}
