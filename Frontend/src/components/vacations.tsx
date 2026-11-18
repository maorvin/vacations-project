import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../services/session';
import './css/Vacations.css'

interface Vacation {
  vacation_id: number;
  vacation_description?: string;
  description?: string;
  destination: string;
  start_date: string;
  end_date: string;
  price: number;
  image_name?: string;
  image_file_name?: string;
  image_url?: string;
  likes_count: number | string;
  is_liked: boolean;
}

const ITEMS_PER_PAGE = 9;

export default function Vacations() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ניהול פילטרים ועמודים
  const [filter, setFilter] = useState<'all' | 'liked' | 'active' | 'upcoming'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // מצבי ניהול לאדמין (מבלי לשנות את מבנה הדף המקורי)
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const navigate = useNavigate();

  const fetchVacations = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch('http://localhost:5001/api/vacations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        clearSession();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('שגיאה בטעינת הנתונים מהשרת');
      }

      const data = await response.json();
      setVacations(data);
    } catch (err: any) {
      console.error('Failed to fetch vacations', err);
      setError('שגיאה בטעינת החופשות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'admin') {
      setIsAdmin(true);
    }
    fetchVacations();
  }, [navigate]);

  // טיפול בלייק / ביטול לייק
  const handleLikeToggle = async (vacationId: number, isLiked: boolean) => {
    try {
      const token = localStorage.getItem('token') || '';
      const method = isLiked ? 'DELETE' : 'POST';
      
      const response = await fetch(`http://localhost:5001/api/vacations/${vacationId}/like`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // השרת מחזיר את המצב המעודכן: { is_liked, likes_count }
        const data = await response.json();
        setVacations(prev => prev.map(v => {
          const currentId = v.vacation_id || (v as any).id;
          if (currentId === vacationId) {
            return { ...v, is_liked: data.is_liked, likes_count: data.likes_count };
          }
          return v;
        }));
      } else {
        const errData = await response.json();
        console.error('Server returned error on like toggle:', errData);
      }
    } catch (err) {
      console.error('Error toggling like (Network/Catch):', err);
    }
  };

  // מחיקת חופשה (לאדמין)
  const handleDelete = async (vacationId: number) => {
    const isConfirmed = window.confirm('האם אתה בטוח שברצונך למחוק חופשה זו?');
    if (!isConfirmed) return;

    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`http://localhost:5001/api/vacations/${vacationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('שגיאה במחיקת החופשה');

      setVacations(prev => prev.filter(v => (v.vacation_id || (v as any).id) !== vacationId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">טוען חופשות...</div>;
  if (error) return <div className="error">{error}</div>;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  };

  const now = new Date();

  // סינון החופשות לפי הבחירה של המשתמש
  const filteredVacations = vacations.filter(v => {
    const startDate = new Date(v.start_date);
    const endDate = new Date(v.end_date);

    if (filter === 'liked') return v.is_liked;
    if (filter === 'active') return startDate <= now && endDate >= now;
    if (filter === 'upcoming') return startDate > now;
    return true; // 'all'
  });

  // חישוב פאגינציה (9 חופשות לעמוד)
  const totalPages = Math.ceil(filteredVacations.length / ITEMS_PER_PAGE) || 1;
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentVacations = filteredVacations.slice(indexOfFirstItem, indexOfLastItem);

  const handleFilterChange = (newFilter: 'all' | 'liked' | 'active' | 'upcoming') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  return (
    <div className="vacations-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px' }}>
        <h1>רשימת החופשות</h1>

        {/* מתג מנהל שמופיע רק למשתמשים שהם admin, שומר על העיצוב המקורי */}
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8f9fa', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <label style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: isAdminMode ? '#28a745' : '#333' }}>
              <input 
                type="checkbox" 
                checked={isAdminMode} 
                onChange={(e) => setIsAdminMode(e.target.checked)} 
                style={{ marginLeft: '6px', transform: 'scale(1.1)' }}
              />
              מצב ניהול (Admin Mode)
            </label>
          </div>
        )}
      </div>

      {/* כפתור הוספת חופשה חדשה (יוצג רק במצב אדמין דלוק) */}
      {isAdmin && isAdminMode && (
        <div style={{ marginBottom: '20px', width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
          <button 
            onClick={() => navigate('/admin/add-vacation')}
            style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + הוסף חופשה חדשה
          </button>
        </div>
      )}

      {/* כפתורי סינון */}
      <div className="filters-bar">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => handleFilterChange('all')}>כל החופשות</button>
        <button className={filter === 'liked' ? 'active' : ''} onClick={() => handleFilterChange('liked')}>הלייקים שלי ❤️</button>
        <button className={filter === 'active' ? 'active' : ''} onClick={() => handleFilterChange('active')}>חופשות פעילות כרגע</button>
        <button className={filter === 'upcoming' ? 'active' : ''} onClick={() => handleFilterChange('upcoming')}>חופשות שטרם התחילו</button>
      </div>

      {/* גריד כרטיסיות */}
      <div className="vacations-grid">
        {currentVacations.map((vacation) => {
          const vacationId = vacation.vacation_id || (vacation as any).id;
          const imageSrc = vacation.image_name || vacation.image_url || vacation.image_file_name || 'https://images.unsplash.com/photo-1552832230-c0197dd311b5';
          const descText = vacation.vacation_description || vacation.description || '';

          return (
            <div key={vacationId} className="vacation-card">
              <div className="card-image-container">
                <img src={imageSrc} alt={vacation.destination} />
                <h2>{vacation.destination}</h2>
                
                {/* הצגה מותנית: אם אדמין ובדלוק מצב ניהול - נציג עריכה ומחיקה במקום הלייק */}
                {isAdmin && isAdminMode ? (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => navigate(`/admin/edit-vacation/${vacationId}`)}
                      style={{ backgroundColor: '#ffc107', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      ערוך
                    </button>
                    <button 
                      onClick={() => handleDelete(vacationId)}
                      style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      מחק
                    </button>
                  </div>
                ) : (
                  <button 
                    className={`like-btn ${vacation.is_liked ? 'liked' : ''}`}
                    onClick={() => handleLikeToggle(vacationId, vacation.is_liked)}
                  >
                    {vacation.is_liked ? '❤️' : '🤍'} {vacation.likes_count || 0}
                  </button>
                )}
              </div>

              <div className="card-dates">
                📅 {formatDate(vacation.start_date)} - {formatDate(vacation.end_date)}
              </div>

              <div className="card-description">
                <p>{descText}</p>
              </div>

              <div className="card-footer">
                <span className="price">${vacation.price}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* פאגינציה (Pagination) */}
      <div className="pagination">
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        >
          הקודם
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button 
            key={page} 
            className={currentPage === page ? 'active-page' : ''}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}

        <button 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        >
          הבא
        </button>
      </div>
    </div>
  );
}