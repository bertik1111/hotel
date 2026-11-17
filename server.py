# server.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__, static_folder='.')
CORS(app)

DB_NAME = 'hotel.db'

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index(): return send_from_directory('.', 'index.html')
@app.route('/<path:path>')
def static_files(path): return send_from_directory('.', path)

@app.route('/api/rooms')
def get_rooms():
    cat = request.args.get('cat')
    db = get_db()
    if cat:
        rooms = db.execute("SELECT * FROM rooms WHERE category=? ORDER BY RANDOM() LIMIT 6", (cat,)).fetchall()
    else:
        rooms = db.execute("SELECT * FROM rooms ORDER BY RANDOM() LIMIT 6").fetchall()
    return jsonify([dict(r) for r in rooms])

@app.route('/api/book', methods=['POST'])
def book_room():
    data = request.json
    db = get_db()
    
    # Проверка занятости номера (упрощенная)
    busy = db.execute("SELECT COUNT(*) FROM bookings WHERE room_id=? AND status='approved' AND NOT (checkout <= ? OR checkin >= ?)", 
                      (data.get('room_id'), data['checkin'], data['checkout'])).fetchone()[0]
    
    if busy > 0:
        return jsonify({'message': 'Номер занят на выбранные даты'}), 400
        
    db.execute("INSERT INTO bookings (name, surname, phone, email, checkin, checkout, status) VALUES (?,?,?,?,?,?, 'pending')",
               (data['name'], data['surname'], data['phone'], data['email'], data['checkin'], data['checkout']))
    db.commit()
    return jsonify({'message': 'Заявка успешно отправлена! Ожидайте подтверждения.'})

@app.route('/api/admin/bookings')
def get_bookings():
    db = get_db()
    bookings = db.execute("SELECT * FROM bookings ORDER BY id DESC").fetchall()
    return jsonify([dict(b) for b in bookings])

@app.route('/api/admin/update', methods=['POST'])
def update_booking():
    data = request.json
    db = get_db()
    if data['status'] == 'deleted':
        db.execute("DELETE FROM bookings WHERE id=?", (data['id'],))
    else:
        db.execute("UPDATE bookings SET status=? WHERE id=?", (data['status'], data['id']))
    db.commit()
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    if not os.path.exists(DB_NAME):
        db = get_db()
        db.execute('''CREATE TABLE rooms (id INTEGER PRIMARY KEY, category TEXT, price REAL, image TEXT)''')
        db.execute('''CREATE TABLE bookings (id INTEGER PRIMARY KEY, name TEXT, surname TEXT, phone TEXT, email TEXT, checkin DATE, checkout DATE, status TEXT, room_id INTEGER)''')
        db.executemany("INSERT INTO rooms VALUES (?,?,?,?)", [
            (1, 'Стандарт', 2500, 'std.jpg'), (2, 'Комфорт', 4000, 'com.jpg'), 
            (3, 'Люкс', 7500, 'lux.jpg'), (4, 'Стандарт', 2500, 'std2.jpg'),
            (5, 'Люкс', 8000, 'lux2.jpg'), (6, 'Комфорт', 4200, 'com2.jpg')
        ])
        db.commit()
    app.run(debug=True, port=5000)
