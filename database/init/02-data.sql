-- נתונים התחלתיים להרצה בדוקר
-- משתמשי דמו (הסיסמאות שמורות כ-hash של bcrypt):
--   מנהל:  admin@demo.com / Admin123456!
--   משתמש: user@demo.com  / User123456!!

INSERT INTO users (user_id, first_name, last_name, email, password, role) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Admin', 'Demo', 'admin@demo.com', '$2b$10$jr/3/7JugokQA6Qy6dTAWu0qKkE0y3mPA0rZ5Yh8d2VGGG6BGMAWm', 'admin'),
    (2, 'Dana', 'Cohen', 'user@demo.com', '$2b$10$0nowjsXijOQ3gW7Wy8gHzOOVVxvfEiBz57q/I7DUPei5BvFdOxkDS', 'user');

INSERT INTO vacations (vacation_id, destination, vacation_description, start_date, end_date, price, image_file_name) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Rome', 'Explore ancient wonders, the Colosseum, the Pantheon, and top-notch dining in fabulous restaurants.', '2026-10-28', '2026-11-09', 1931, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5'),
    (2, 'Rhodes', 'Enjoy a cocktail by the sea with incredible seaside views and Pefkos Beach nearby.', '2026-11-08', '2026-11-22', 462, 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713'),
    (4, 'Corfu', 'Discover beautiful Greek island landscapes, historic architecture, and crystal-clear waters.', '2026-12-13', '2026-12-27', 699, 'https://images.unsplash.com/photo-1533105079780-92b9be482077'),
    (5, 'Hilo', 'Experience lush tropical rainforests, waterfalls, and the unique charm of Hawaii.', '2026-12-17', '2026-12-31', 1200, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23'),
    (6, 'Montego Bay', 'Unwind on Caribbean white-sand beaches with luxury resorts and vibrant local culture.', '2027-01-03', '2027-01-17', 1450, 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62'),
    (7, 'Puerto Rico Island', 'Experience rich Spanish heritage, El Yunque rainforest, and vibrant coastal nightlife.', '2027-02-01', '2027-02-14', 1350, 'https://images.unsplash.com/photo-1589556264800-01d0b4bbfa84'),
    (8, 'Las Vegas', 'Enjoy world-class entertainment, luxury hotels, fine dining, and vibrant nightlife on the Strip.', '2027-02-15', '2027-02-22', 950, 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d'),
    (9, 'Honolulu', 'Relax on Waikiki Beach, visit historical landmarks, and enjoy tropical island paradise views.', '2027-03-01', '2027-03-15', 1600, 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35'),
    (10, 'Kailua-Kona', 'Explore coffee plantations, manta ray night dives, and stunning sunny coasts in Hawaii.', '2027-03-10', '2027-03-24', 1550, 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a'),
    (11, 'Port Antonio', 'Discover lush jungles, hidden waterfalls, and relaxed coastal vibes in Jamaica.', '2027-04-05', '2027-04-19', 1100, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5'),
    (12, 'Paris', 'Experience romantic walks along the Seine, art at the Louvre, and world-class culinary delights.', '2027-05-01', '2027-05-12', 1750, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34');

INSERT INTO likes (user_id, vacation_id) VALUES
    (2, 1),
    (2, 2),
    (1, 2);

-- המזהה הבא שייווצר אוטומטית ימשיך אחרי המזהים שהוכנסו ידנית
SELECT setval(pg_get_serial_sequence('users', 'user_id'), COALESCE((SELECT MAX(user_id) FROM users), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('vacations', 'vacation_id'), COALESCE((SELECT MAX(vacation_id) FROM vacations), 0) + 1, false);
