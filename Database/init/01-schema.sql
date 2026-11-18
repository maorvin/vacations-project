-- מבנה מסד הנתונים של מערכת החופשות
-- הקובץ רץ אוטומטית בהפעלה הראשונה של קונטיינר ה-PostgreSQL (כשה-volume ריק)

CREATE TABLE IF NOT EXISTS users (
    user_id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name  TEXT,
    last_name   TEXT,
    email       TEXT,
    password    TEXT,
    role        TEXT DEFAULT 'user',
    CONSTRAINT chk_user_role CHECK (role IN ('user', 'admin'))
);

CREATE TABLE IF NOT EXISTS vacations (
    vacation_id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    destination           TEXT,
    vacation_description  TEXT,
    start_date            DATE,
    end_date              DATE,
    price                 INTEGER,
    image_file_name       TEXT
);

-- לייק = זוג (משתמש, חופשה). מחיקת משתמש או חופשה מוחקת גם את הלייקים שלהם
CREATE TABLE IF NOT EXISTS likes (
    user_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vacation_id  INTEGER NOT NULL REFERENCES vacations(vacation_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, vacation_id)
);
