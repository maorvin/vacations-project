import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../services/session';
import './css/AIRecommendation.css';

export default function AIRecommendation() {
  const [destination, setDestination] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // בדיקה האם המשתמש מחובר (Logged-in) בעת טעינת העמוד
  useEffect(() => {
    const token = localStorage.getItem('token');
    const allKeys = Object.keys(localStorage);
    
    console.log('All keys in localStorage:', allKeys);
    console.log('Value of "token":', token);

    if (!token) {
      alert('אין טוקן ב-localStorage! לכן הועברת ללוגין.'); // יקפיץ הודעה בדיוק כשזה קורה
      navigate('/login');
    }
  }, [navigate]);

  const handleGetRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setLoading(true);
    setError('');
    setRecommendation('');

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch('http://localhost:5001/api/ai/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ destination })
      });

      if (response.status === 401 || response.status === 403) {
        clearSession();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'אירעה שגיאה בטעינת ההמלצות. נסה שוב.');
      }

      setRecommendation(data.recommendation);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'אירעה שגיאה בטעינת ההמלצות. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-container">
      <h1>AI Recommendation</h1>

      <form onSubmit={handleGetRecommendation} className="ai-form">
        <label htmlFor="destination">destination</label>
        <input 
          id="destination"
          type="text" 
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Rhodes"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'מייצר המלצה...' : 'Get Recommendation'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {recommendation && (
        <div className="ai-results">
          <h2>🌍 AI Recommendation for {destination}</h2>
          <div className="recommendation-content">
            <p>{recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}