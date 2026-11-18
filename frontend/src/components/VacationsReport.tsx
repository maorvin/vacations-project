import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Vacation {
  vacation_id: number;
  destination: string;
  likes_count?: number;
  [key: string]: any;
}

export default function VacationsReport() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (!token || role !== 'admin') {
      alert('דף זה נגיש אך ורק למנהל מערכת!');
      navigate('/vacations', { replace: true });
      return;
    }

    const fetchVacationsForReport = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/vacations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('שגיאה בטעינת נתוני הדו"ח מהשרת');

        const data: Vacation[] = await response.json();
        setVacations(data);

        const labels = data.map(v => v.destination);
        const dataValues = data.map(v => Number(v.likes_count) || 0);

        setChartData({
          labels,
          datasets: [
            {
              label: 'כמות Likes',
              data: dataValues,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (err: any) {
        setError(err.message || 'שגיאה בטעינת הדו"ח');
      } finally {
        setLoading(false);
      }
    };

    fetchVacationsForReport();
  }, [navigate]);

  // יצירת קובץ CSV והורדתו למחשב (מותאם לפתיחה תקינה ב-Excel)
  const handleDownloadCSV = () => {
    if (vacations.length === 0) return;

    // שורת כותרות
    const headers = ['Destination', 'Likes'];
    
    // בניית השורות (עטיפת היעד במירכאות למניעת שבירת עמודות אם יש פסיק בשם)
    const rows = vacations.map(v => {
      const safeDestination = `"${String(v.destination).replace(/"/g, '""')}"`;
      const likes = Number(v.likes_count) || 0;
      return `${safeDestination},${likes}`;
    });

    // חיבור התוכן + הוספת BOM (\uFEFF) כדי שאקסל יזהה UTF-8 ועברית בצורה תקינה
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');

    // יצירת קובץ להורדה והפעלת לחיצה אוטומטית
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vacations-report.csv');
    document.body.appendChild(link);
    link.click();
    
    // ניקוי זיכרון
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px' }}>טוען דו"ח חופשות...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Vacations Report - Likes per Destination',
        font: { size: 18 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>דף הצגת דו"ח חופשות</h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleDownloadCSV}
            disabled={vacations.length === 0}
            style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📥 הורדת דוח CSV
          </button>

          <button 
            onClick={() => navigate('/vacations')}
            style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            חזרה לרשימת החופשות
          </button>
        </div>
      </div>

      <p style={{ color: '#555', marginBottom: '20px' }}>
        דף זה נגיש אך ורק למנהל. מוצג להלן גרף העמודות המציג את כמות ה-Likes האמיתית לכל יעד חופשה.
      </p>

      {chartData && <Bar data={chartData} options={options} />}
    </div>
  );
}