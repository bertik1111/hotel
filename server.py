# server.py
from flask import Flask, request, jsonify
import sqlite3
import random

app = Flask(__name__)

def get_db():
    return sqlite3.connect('hotel.db')

@app.route('/api/rooms')
def get_rooms():
    cat = request.args.get('cat')
    db = get_db()
    if cat:
        rooms = db.execute("SELECT * FROM rooms WHERE category=? ORDER BY RANDOM() LIMIT 6", (cat,)).fetchall()
    else:
        rooms = db.execute("SELECT * FROM rooms ORDER BY RANDOM() LIMIT 6").fetchall()
    return jsonify([{'id': r[0], 'category': r[1], 'price': r[2]} for r in rooms])

@app.route('/api/book', methods=['POST'])
def book_room():
    data = request.json
    # Валидация и проверка дат
    db = get_db()
    db.execute("INSERT INTO bookings (name, phone, email, checkin, checkout, status) VALUES (?,?,?,?,?, 'pending')",
               (data['name'], data['phone'], data['email'], data['checkin'], data['checkout']))
    db.commit()
    return jsonify({'message': 'Заявка отправлена'})

@app.route('/api/admin/bookings')
def get_bookings():
    db = get_db()
    bookings = db.execute("SELECT * FROM bookings").fetchall()
    return jsonify([{'id': b[0], 'name': b[1], 'status': b[5]} for b in bookings])

if __name__ == '__main__':
    app.run(debug=True)
