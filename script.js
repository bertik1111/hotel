// script.js
async function loadRooms(filter = '') {
    const res = await fetch(`/api/rooms?cat=${filter}`);
    const rooms = await res.json();
    const container = document.getElementById('rooms');
    if(container) {
        container.innerHTML = rooms.map(r => `
            <div class="room-card">
                <h3>${r.category}</h3>
                <p>${r.price} руб.</p>
                <a href="booking.html?id=${r.id}">Забронировать</a>
            </div>
        `).join('');
    }
}

function applyFilter() {
    const cat = document.getElementById('category').value;
    loadRooms(cat);
}

function resetFilter() {
    document.getElementById('category').value = '';
    loadRooms();
}

document.getElementById('bookingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const res = await fetch('/api/book', { method: 'POST', body: JSON.stringify(Object.fromEntries(data)), headers: {'Content-Type': 'application/json'} });
    const result = await res.json();
    document.getElementById('message').innerText = result.message;
});

async function login() {
    const l = document.getElementById('adminLogin').value;
    const p = document.getElementById('adminPass').value;
    if(l === 'hotel123' && p === 'adminHotel') {
        document.getElementById('login').style.display = 'none';
        document.getElementById('panel').style.display = 'block';
        loadBookings();
    }
}

async function loadBookings() {
    const res = await fetch('/api/admin/bookings');
    const bookings = await res.json();
    document.getElementById('bookingsList').innerHTML = bookings.map(b => `
        <div>${b.name} - ${b.status} 
            <button onclick="updateStatus(${b.id}, 'approved')">Одобрить</button>
            <button onclick="updateStatus(${b.id}, 'deleted')">Удалить</button>
        </div>
    `).join('');
}
