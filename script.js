// script.js
const API_URL = 'http://localhost:5000/api'; // Заменить на реальный адрес

// Каталог
async function loadRooms(filter = '') {
    const container = document.getElementById('roomsGrid');
    if (!container) return;
    
    try {
        const res = await fetch(`${API_URL}/rooms?cat=${filter}`);
        const rooms = await res.json();
        
        container.innerHTML = rooms.map(r => `
            <div class="room-card">
                <div class="room-img">Изображение</div>
                <div class="room-info">
                    <h3>${r.category}</h3>
                    <p class="room-price">${r.price} ₽ / ночь</p>
                    <a href="booking.html?id=${r.id}" class="btn btn-primary full-width">Забронировать</a>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = '<p>Ошибка загрузки данных</p>';
    }
}

function applyFilter() {
    const cat = document.getElementById('categoryFilter')?.value;
    loadRooms(cat);
}

function resetFilter() {
    const select = document.getElementById('categoryFilter');
    if(select) select.value = '';
    loadRooms();
}

// Бронирование
const form = document.getElementById('bookingForm');
if (form) {
    // Установка минимальной даты (сегодня)
    const today = new Date().toISOString().split('T')[0];
    form.checkin.min = today;
    form.checkout.min = today;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        
        // Простая валидация дат на клиенте перед отправкой
        if (new Date(data.checkin) >= new Date(data.checkout)) {
            showMessage('Дата выезда должна быть позже даты заезда', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/book`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await res.json();
            showMessage(result.message, res.ok ? 'success' : 'error');
            if(res.ok) form.reset();
        } catch (err) {
            showMessage('Ошибка соединения с сервером', 'error');
        }
    });
}

function showMessage(text, type) {
    const box = document.getElementById('messageBox');
    if(box) {
        box.innerText = text;
        box.className = `message-box ${type}`;
        box.style.display = 'block';
    }
}

// Админка
async function login() {
    const l = document.getElementById('adminLogin').value;
    const p = document.getElementById('adminPass').value;
    
    if(l === 'hotel123' && p === 'adminHotel') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadBookings();
    } else {
        document.getElementById('loginError').innerText = 'Неверный логин или пароль';
    }
}

async function loadBookings() {
    const list = document.getElementById('bookingsList');
    if(!list) return;
    
    const res = await fetch(`${API_URL}/admin/bookings`);
    const bookings = await res.json();
    
    list.innerHTML = bookings.map(b => `
        <div class="booking-item">
            <div>
                <strong>${b.name}</strong> (${b.phone})<br>
                <small>Статус: ${b.status}</small>
            </div>
            <div>
                ${b.status === 'pending' ? `
                    <button onclick="updateStatus(${b.id}, 'approved')" class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem;">Одобрить</button>
                    <button onclick="updateStatus(${b.id}, 'deleted')" class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem; border-color: var(--danger); color: var(--danger);">Удалить</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function updateStatus(id, status) {
    await fetch(`${API_URL}/admin/update`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id, status})
    });
    loadBookings();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('roomsGrid')) loadRooms();
});
