-- database.sql
CREATE TABLE rooms (id INTEGER PRIMARY KEY, category TEXT, price REAL, image TEXT);
CREATE TABLE bookings (id INTEGER PRIMARY KEY, name TEXT, phone TEXT, email TEXT, checkin DATE, checkout DATE, status TEXT);
INSERT INTO rooms VALUES (1, 'standard', 2000, 'img1.jpg'), (2, 'lux', 5000, 'img2.jpg');
