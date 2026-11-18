import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AIAsk() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // וידוא שהמשתמש מחובר (Logged-in) בכניסה לעמוד - כמו שדורשת המטלה
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        setError('');
        setAnswer('');

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch('http://localhost:5001/api/ai/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'שגיאה בתקשורת עם השרת');
            }

            setAnswer(data.answer);
        } catch (err: any) {
            setError(err.message || 'אירעה שגיאה. נסה שוב.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '650px', margin: '40px auto', padding: '25px', fontFamily: 'Arial, sans-serif', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#0095ff', marginBottom: '20px', textAlign: 'center' }}>Ask me anything about our vacations</h2>
            
            <form onSubmit={handleAsk} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>question</label>
                    <textarea 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={4}
                        placeholder="שאל שאלה על החופשות (למשל: כמה חופשות קיימות כרגע?, מהו ממוצע המחירי?)"
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', resize: 'vertical' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        backgroundColor: loading ? '#b0e0ff' : '#0095ff', 
                        color: 'white', 
                        padding: '12px', 
                        border: 'none', 
                        borderRadius: '6px', 
                        fontWeight: 'bold', 
                        fontSize: '16px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    {loading ? 'חושב...' : 'Ask'}
                </button>
            </form>

            {error && <p style={{ color: '#d9534f', marginTop: '15px', fontWeight: 'bold' }}>{error}</p>}
            
            {answer && (
                <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '6px', border: '1px solid #bce8f1' }}>
                    <strong style={{ color: '#31708f' }}>תשובה מהמערכת:</strong>
                    <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap', color: '#333', lineHeight: '1.5' }}>{answer}</p>
                </div>
            )}
        </div>
    );
}