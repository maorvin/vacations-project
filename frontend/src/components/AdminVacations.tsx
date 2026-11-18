import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clearSession } from '../services/session';
import './css/Vacations.css';
import './css/AdminVacationForm.css';

const API_URL = 'http://localhost:5001/api/vacations';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
const MAX_DESCRIPTION = 500;
const MAX_PRICE = 10000;

interface FormState {
  destination: string;
  description: string;
  price: string;
  image: string;
  start_date: string;
  end_date: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  destination: '',
  description: '',
  price: '',
  image: '',
  start_date: '',
  end_date: '',
};

const todayISO = () => new Date().toISOString().slice(0, 10);

// ממיר תאריך מהשרת (UTC) לתאריך מקומי בפורמט של שדה date, בלי להזיז יום
const toDateInput = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDate = (iso: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${Number(d)}.${Number(m)}.${y}`;
};

function validate(form: FormState, isEditMode: boolean): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.destination.trim()) errors.destination = 'צריך לכתוב את שם היעד';
  if (!form.description.trim()) errors.description = 'צריך לכתוב תיאור קצר';
  else if (form.description.length > MAX_DESCRIPTION) errors.description = `עד ${MAX_DESCRIPTION} תווים`;

  if (form.price === '') errors.price = 'צריך להזין מחיר';
  else {
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) errors.price = 'המחיר לא יכול להיות שלילי';
    else if (price > MAX_PRICE) errors.price = `המחיר המקסימלי הוא $${MAX_PRICE.toLocaleString()}`;
  }

  if (!form.start_date) errors.start_date = 'צריך לבחור תאריך התחלה';
  else if (!isEditMode && form.start_date < todayISO()) errors.start_date = 'אי אפשר להוסיף חופשה שמתחילה בעבר';

  if (!form.end_date) errors.end_date = 'צריך לבחור תאריך סיום';
  else if (form.start_date && form.end_date < form.start_date) errors.end_date = 'תאריך הסיום לפני תאריך ההתחלה';

  if (form.image && !/^https?:\/\/\S+$/i.test(form.image.trim())) errors.image = 'הקישור צריך להתחיל ב-http:// או https://';
  return errors;
}

export default function AdminVacationForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState<FormState>(EMPTY_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [loadingVacation, setLoadingVacation] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [serverError, setServerError] = useState('');
  const [imageBroken, setImageBroken] = useState(false);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  });

  const handleAuthFailure = (status: number) => {
    if (status === 401) {
      clearSession();
      navigate('/login');
      return true;
    }
    return false;
  };

  // רק מנהל יכול להגיע לדף הזה
  useEffect(() => {
    if (localStorage.getItem('role') !== 'admin') navigate('/vacations', { replace: true });
  }, [navigate]);

  // במצב עריכה: טעינת החופשה הקיימת
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
        if (handleAuthFailure(res.status)) return;
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'שגיאה בטעינת החופשה');
        if (cancelled) return;

        const loaded: FormState = {
          destination: data.destination ?? '',
          description: data.vacation_description ?? data.description ?? '',
          price: data.price != null ? String(data.price) : '',
          image: data.image_file_name ?? data.image_name ?? '',
          start_date: toDateInput(data.start_date),
          end_date: toDateInput(data.end_date),
        };
        setForm(loaded);
        setInitialForm(loaded);
      } catch (err: any) {
        if (!cancelled) setServerError(err.message || 'שגיאה בטעינת החופשה');
      } finally {
        if (!cancelled) setLoadingVacation(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, isEditMode]);

  const errors = useMemo(() => validate(form, isEditMode), [form, isEditMode]);
  const hasErrors = Object.keys(errors).length > 0;
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const nights = useMemo(() => {
    if (!form.start_date || !form.end_date || form.end_date < form.start_date) return null;
    const ms = new Date(form.end_date).getTime() - new Date(form.start_date).getTime();
    return Math.round(ms / 86400000);
  }, [form.start_date, form.end_date]);

  const showError = (field: keyof FormState) => (touched[field] || submitAttempted) && errors[field];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'image') setImageBroken(false);
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const goBack = () => {
    if (isDirty && !window.confirm('יש שינויים שלא נשמרו. לצאת בכל זאת?')) return;
    navigate('/vacations');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setServerError('');
    if (hasErrors) return;

    setSaving(true);
    try {
      const res = await fetch(isEditMode ? `${API_URL}/${id}` : API_URL, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          destination: form.destination.trim(),
          vacation_description: form.description.trim(),
          price: Number(form.price),
          image_file_name: form.image.trim(),
          start_date: form.start_date,
          end_date: form.end_date,
        }),
      });
      if (handleAuthFailure(res.status)) return;

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error('שגיאת שרת פנימית או שהנתיב לא זמין');
      }

      if (!res.ok) throw new Error(data.error || 'שגיאה בשמירת החופשה');
      navigate('/vacations');
    } catch (err: any) {
      setServerError(err.message || 'שגיאה בשמירת החופשה');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setServerError('');
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (handleAuthFailure(res.status)) return;

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error('שגיאת שרת פנימית או שהנתיב לא זמין');
      }

      if (!res.ok) throw new Error(data.error || 'שגיאה במחיקת החופשה');
      navigate('/vacations');
    } catch (err: any) {
      setServerError(err.message || 'שגיאה במחיקת החופשה');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const previewImage = form.image.trim() && !imageBroken && !errors.image ? form.image.trim() : FALLBACK_IMAGE;

  if (loadingVacation) {
    return (
      <div className="avf-page">
        <div className="avf-skeleton" aria-busy="true" aria-label="טוען את פרטי החופשה">
          <div className="avf-skeleton__line avf-skeleton__line--title" />
          <div className="avf-skeleton__line" />
          <div className="avf-skeleton__line" />
          <div className="avf-skeleton__line avf-skeleton__line--short" />
        </div>
      </div>
    );
  }

  return (
    <div className="avf-page">
      <header className="avf-header">
        <button type="button" className="avf-back" onClick={goBack}>
          → חזרה לחופשות
        </button>
        <span className={`avf-badge ${isEditMode ? 'avf-badge--edit' : 'avf-badge--new'}`}>
          {isEditMode ? 'עריכה' : 'חופשה חדשה'}
        </span>
        <h1 className="avf-title">
          {isEditMode ? `עריכת החופשה ל${initialForm.destination || '...'}` : 'הוספת חופשה חדשה'}
        </h1>
        <p className="avf-subtitle">
          {isEditMode
            ? 'השינויים יופיעו לכל המשתמשים מיד אחרי השמירה.'
            : 'מלאו את הפרטים, והתצוגה המקדימה תראה איך הכרטיס ייראה ברשימה.'}
        </p>
      </header>

      {serverError && (
        <div className="avf-alert" role="alert">
          <span aria-hidden="true">⚠️</span> {serverError}
        </div>
      )}

      <div className="avf-layout">
        <form className="avf-form" onSubmit={handleSubmit} noValidate>
          <section className="avf-section">
            <h2 className="avf-section__title">
              <span className="avf-section__num">1</span> פרטי היעד
            </h2>

            <div className={`avf-field ${showError('destination') ? 'avf-field--error' : ''}`}>
              <label htmlFor="destination">יעד</label>
              <input
                id="destination"
                name="destination"
                type="text"
                placeholder="למשל: רומא"
                value={form.destination}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={60}
                autoFocus={!isEditMode}
              />
              {showError('destination') && <span className="avf-error">{errors.destination}</span>}
            </div>

            <div className={`avf-field ${showError('description') ? 'avf-field--error' : ''}`}>
              <div className="avf-label-row">
                <label htmlFor="description">תיאור</label>
                <span className={`avf-counter ${form.description.length > MAX_DESCRIPTION ? 'avf-counter--over' : ''}`}>
                  {form.description.length}/{MAX_DESCRIPTION}
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="מה מחכה למטיילים? אטרקציות, אוכל, אווירה..."
                value={form.description}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {showError('description') && <span className="avf-error">{errors.description}</span>}
            </div>
          </section>

          <section className="avf-section">
            <h2 className="avf-section__title">
              <span className="avf-section__num">2</span> תאריכים ומחיר
            </h2>

            <div className="avf-row">
              <div className={`avf-field ${showError('start_date') ? 'avf-field--error' : ''}`}>
                <label htmlFor="start_date">תאריך התחלה</label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  min={isEditMode ? undefined : todayISO()}
                  value={form.start_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {showError('start_date') && <span className="avf-error">{errors.start_date}</span>}
              </div>

              <div className={`avf-field ${showError('end_date') ? 'avf-field--error' : ''}`}>
                <label htmlFor="end_date">תאריך סיום</label>
                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  min={form.start_date || (isEditMode ? undefined : todayISO())}
                  value={form.end_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {showError('end_date') && <span className="avf-error">{errors.end_date}</span>}
              </div>
            </div>

            {nights !== null && (
              <p className="avf-hint">
                🌙 {nights === 0 ? 'חופשה של יום אחד' : `${nights} לילות`}
              </p>
            )}

            <div className={`avf-field avf-field--price ${showError('price') ? 'avf-field--error' : ''}`}>
              <label htmlFor="price">מחיר לאדם</label>
              <div className="avf-input-affix">
                <span className="avf-input-affix__symbol" aria-hidden="true">$</span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_PRICE}
                  placeholder="0"
                  value={form.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  dir="ltr"
                />
              </div>
              {showError('price') && <span className="avf-error">{errors.price}</span>}
            </div>
          </section>

          <section className="avf-section">
            <h2 className="avf-section__title">
              <span className="avf-section__num">3</span> תמונה
            </h2>

            <div className={`avf-field ${showError('image') ? 'avf-field--error' : ''}`}>
              <label htmlFor="image">קישור לתמונה</label>
              <input
                id="image"
                name="image"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={form.image}
                onChange={handleChange}
                onBlur={handleBlur}
                dir="ltr"
              />
              {showError('image') && <span className="avf-error">{errors.image}</span>}
              {!errors.image && imageBroken && (
                <span className="avf-warning">לא הצלחנו לטעון את התמונה מהקישור. בתצוגה מוצגת תמונת ברירת מחדל.</span>
              )}
              {!form.image && <span className="avf-hint">בלי קישור תוצג תמונת ברירת מחדל.</span>}
            </div>
          </section>

          <div className="avf-actions">
            <button type="button" className="avf-btn avf-btn--ghost" onClick={goBack} disabled={saving}>
              ביטול
            </button>
            <button
              type="submit"
              className="avf-btn avf-btn--primary"
              disabled={saving || (isEditMode && !isDirty)}
            >
              {saving ? 'שומר...' : isEditMode ? 'שמירת שינויים' : 'הוספת החופשה'}
            </button>
          </div>

          {isEditMode && (
            <section className="avf-danger">
              <div>
                <h2 className="avf-danger__title">מחיקת החופשה</h2>
                <p className="avf-danger__text">המחיקה סופית ותסיר גם את כל הלייקים שקיבלה החופשה.</p>
              </div>
              {!confirmDelete ? (
                <button type="button" className="avf-btn avf-btn--danger-outline" onClick={() => setConfirmDelete(true)}>
                  מחיקה
                </button>
              ) : (
                <div className="avf-danger__confirm">
                  <span>בטוח?</span>
                  <button type="button" className="avf-btn avf-btn--danger" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'מוחק...' : 'כן, למחוק'}
                  </button>
                  <button type="button" className="avf-btn avf-btn--ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                    לא
                  </button>
                </div>
              )}
            </section>
          )}
        </form>

        <aside className="avf-preview" aria-label="תצוגה מקדימה">
          <p className="avf-preview__label">תצוגה מקדימה</p>
          <div className="vacation-card avf-preview__card">
            <div className="card-image-container">
              <img src={previewImage} alt="" onError={() => setImageBroken(true)} />
              <h2>{form.destination.trim() || 'שם היעד'}</h2>
            </div>
            <div className="card-dates">
              📅 {formatDate(form.start_date)} - {formatDate(form.end_date)}
            </div>
            <div className="card-description">
              <p>{form.description.trim() || 'כאן יופיע התיאור של החופשה.'}</p>
            </div>
            <div className="card-footer">
              <span className="price">${form.price ? Number(form.price).toLocaleString() : '0'}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}