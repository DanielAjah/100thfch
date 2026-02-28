/* ========================================== */
/* 1. KONFIGURASI & KONSTANTA                 */
/* ========================================== */
const DB_KEY = 'data_tanaman_jahe'; // Kunci LocalStorage
const START_DATE = new Date('2025-03-01'); // Tanggal awalinput (sesuai instruksi admin)

// Menghitung jumlah hari dari 1 Maret 2025 hingga 31 Des 2026
const END_DATE = new Date('2026-12-31');
const JUMLAH_HARI = Math.round((END_DATE - START_DATE) / (1000 * 60 * 60 * 24)) + 1; // 671 hari

/* ========================================== */
/* 2. FUNGSI NOTIFIKASI TOAST                */
/* ========================================== */
function showNotification(message, isError = false) {
    const notif = document.getElementById('notification');
    const msgSpan = document.getElementById('notification-message');
    
    if (!notif) return;
    
    msgSpan.innerText = message;
    notif.className = 'notification show';
    
    if (isError) {
        notif.classList.add('error');
    } else {
        notif.classList.remove('error');
    }

    // Sembunyikan setelah 3 detik
    setTimeout(() => {
        notif.className = 'notification';
    }, 3000);
}

/* ========================================== */
/* 3. FUNGSI UNTUK HALAMAN UTAMA (INDEX)     */
/* ========================================== */
function loadDataIndex() {
    const tbody = document.querySelector('#plant-table tbody');
    const noDataMsg = document.getElementById('no-data-msg');
    const rawData = localStorage.getItem(DB_KEY);

    if (!tbody) return;

    // Jika belum ada data sama sekali
    if (!rawData) {
        noDataMsg.style.display = 'block';
        return;
    }

    const data = JSON.parse(rawData);
    // Filter hanya data yang memiliki nilai panjang (tidak kosong)
    const validData = data.filter(item => item.panjang && item.panjang !== "");

    if (validData.length === 0) {
        noDataMsg.style.display = 'block';
        return;
    }

    let html = '';
    validData.forEach((item) => {
        html += `
            <tr>
                <td>${item.no}</td>
                <td>${item.tanggal}</td>
                <td>${item.panjang} cm</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    
    // Update Statistik
    updateStats(validData);
}

function updateStats(data) {
    const totalDaysEl = document.getElementById('total-days');
    const avgHeightEl = document.getElementById('avg-height');

    if (data.length > 0) {
        // Total Hari (berdasarkan jumlah data yang ada)
        const totalDays = data.length;
        
        // Tinggi Rata-rata
        const totalHeight = data.reduce((sum, item) => sum + parseFloat(item.panjang), 0);
        const avgHeight = (totalHeight / data.length).toFixed(1);

        if (totalDaysEl) totalDaysEl.innerText = `${totalDays} Hari`;
        if (avgHeightEl) avgHeightEl.innerText = `${avgHeight} cm`;
    }
}

/* ========================================== */
/* 4. FUNGSI UNTUK HALAMAN ADMIN             */
/* ========================================== */

// Setup Login & Logout
function setupLogin() {
    const form = document.getElementById('form-login');
    const errorMsg = document.getElementById('login-error');
    const loginPage = document.getElementById('login-page');
    const adminPage = document.getElementById('admin-page');

    if (!form) return;

    // Cek sesi login
    if (sessionStorage.getItem('isLogin') === 'true') {
        loginPage.style.display = 'none';
        adminPage.style.display = 'flex'; // Menggunakan flex karena container menggunakan flex
        generateInputTable();
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        if (user === 'admin' && pass === 'admin123') {
            sessionStorage.setItem('isLogin', 'true');
            loginPage.style.display = 'none';
            adminPage.style.display = 'flex';
            generateInputTable();
            errorMsg.style.display = 'none';
            showNotification('Login berhasil! Selamat datang Admin.');
        } else {
            errorMsg.style.display = 'block';
            showNotification('Username atau Password salah!', true);
        }
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isLogin');
            location.reload(); // Refresh halaman untuk kembali ke login
        });
    }
}

// Generate Tabel Input di Admin
function generateInputTable() {
    const tbody = document.querySelector('#input-table tbody');
    if (!tbody) return;

    let currentDate = new Date(START_DATE);
    let html = '';

    for (let i = 0; i < JUMLAH_HARI; i++) {
        const tanggalStr = currentDate.toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${tanggalStr}</td>
                <td><input type="number" class="length-input" placeholder="Cm" min="0"></td>
            </tr>
        `;

        // Tambah 1 hari
        currentDate.setDate(currentDate.getDate() + 1);
    }

    tbody.innerHTML = html;
    
    // Isi data yang sudah ada sebelumnya
    loadExistingDataToInput();
}

// Muat data lama ke form input
function loadExistingDataToInput() {
    const rawData = localStorage.getItem(DB_KEY);
    if (!rawData) return;

    const data = JSON.parse(rawData);
    const inputs = document.querySelectorAll('.length-input');

    // Kita cocokkan berdasarkan index array
    // Karena input di-generate urut dari tgl awal, maka index match dengan index data
    data.forEach((item, index) => {
        if (inputs[index]) {
            // Cek jika ada nilainya
            if (item.panjang && item.panjang !== "") {
                inputs[index].value = item.panjang;
            }
        }
    });
}

// Simpan Data
function saveData() {
    const inputs = document.querySelectorAll('.length-input');
    const processedData = [];
    let currentDate = new Date(START_DATE);

    for (let i = 0; i < JUMLAH_HARI; i++) {
        const val = inputs[i].value;
        
        const tanggalStr = currentDate.toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        processedData.push({
            no: i + 1,
            tanggal: tanggalStr,
            panjang: val
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    localStorage.setItem(DB_KEY, JSON.stringify(processedData));
    showNotification('Data berhasil disimpan ke database lokal!');
}

/* ========================================== */
/* 5. INISIALISASI & ANIMASI SCROLL          */
/* ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Logika Halaman Utama ---
    if (document.getElementById('plant-table')) {
        loadDataIndex();
    }

    // --- Logika Halaman Admin (Login & Dashboard) ---
    if (document.getElementById('login-page')) {
        setupLogin();
    }

    // --- Tombol Simpan (Admin) ---
    if (document.getElementById('save-btn')) {
        document.getElementById('save-btn').addEventListener('click', saveData);
    }

    // --- Tombol Reset (Admin) ---
    if (document.getElementById('reset-btn')) {
        document.getElementById('reset-btn').addEventListener('click', () => {
            if(confirm('Reset semua data input di form ini? Data yang sudah disimpan di database tidak akan hilang, hanya form ini dikosongkan.')) {
                document.querySelectorAll('.length-input').forEach(input => input.value = '');
                showNotification('Form input telah direset.');
            }
        });
    }

    /* --- Animasi Scroll (Intersection Observer) --- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-visible');
                
                // Hapus class arah (left/right/bottom) agar posisi akhir menjadi normal
                entry.target.classList.remove('scroll-hidden', 'scroll-left', 'scroll-right', 'scroll-bottom');
            }
        });
    }, observerOptions);

    // Pilih elemen yang akan dianimasikan
    const hiddenElements = document.querySelectorAll('.scroll-hidden');
    hiddenElements.forEach((el) => observer.observe(el));
});