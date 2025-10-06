// --- Elemen DOM ---
const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const mapInfo = document.getElementById('mapInfo');
const initialMessage = document.getElementById('initialMessage');
const errorMessage = document.getElementById('errorMessage');

const locationNameEl = document.getElementById('locationName');
const coordinatesEl = document.getElementById('coordinates');
const countryEl = document.getElementById('country');
const latEl = document.getElementById('lat');
const lngEl = document.getElementById('lng');

// Variabel untuk menyimpan objek peta
let map;
let marker;

// --- Fungsi untuk mengambil data lokasi ---
async function getLocation(location) {
    // Sembunyikan semua tampilan sebelum melakukan pencarian baru
    mapInfo.classList.add('hidden');
    errorMessage.classList.add('hidden');
    initialMessage.classList.add('hidden');

    // URL untuk Nominatim API (OpenStreetMap)
    const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`;

    try {
        // Tambahkan header untuk mengidentifikasi aplikasi (sesuai kebijakan Nominatim)
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'AplikasiPeta/1.0 (https://github.com/dhamagiovanny123-web/cuaca-app)'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            throw new Error('Lokasi tidak ditemukan');
        }
        
        updateMap(data[0]);
    } catch (error) {
        console.error('Gagal mengambil data lokasi:', error);
        errorMessage.textContent = `Error: ${error.message}`;
        errorMessage.classList.remove('hidden'); // Tampilkan pesan error
    }
}

// --- Fungsi untuk memperbarui tampilan peta ---
function updateMap(locationData) {
    const { lat, lon, display_name, address } = locationData;
    
    // Jika peta sudah ada, hapus dulu
    if (map) {
        map.remove();
    }
    
    // Inisialisasi peta baru - dengan interaktif
    map = L.map('map', {
        center: [lat, lon],
        zoom: 15,
        zoomControl: true, // Aktifkan kontrol zoom
        attributionControl: true, // Tampilkan atribusi
        dragging: true, // Aktifkan dragging
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        keyboard: true
    });
    
    // Tambahkan tile layer (peta dasar)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Tambahkan marker
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
    
    marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    
    // Perbarui informasi lokasi
    locationNameEl.textContent = display_name.split(',')[0];
    coordinatesEl.textContent = `${parseFloat(lat).toFixed(4)}°, ${parseFloat(lon).toFixed(4)}°`;
    countryEl.textContent = address.country || 'Tidak diketahui';
    latEl.textContent = `${parseFloat(lat).toFixed(4)}°`;
    lngEl.textContent = `${parseFloat(lon).toFixed(4)}°`;
    
    // Tampilkan informasi peta
    mapInfo.classList.remove('hidden');
}

// --- Fungsi untuk menampilkan contoh lokasi ---
function showExampleLocation() {
    // Contoh lokasi yang valid
    const exampleLocations = [
        "Jakarta, Indonesia",
        "Surabaya, Indonesia",
        "Bandung, Indonesia",
        "Bali, Indonesia",
        "Yogyakarta, Indonesia",
        "Medan, Indonesia",
        "Semarang, Indonesia",
        "Makassar, Indonesia"
    ];
    
    // Pilih contoh acak
    const randomExample = exampleLocations[Math.floor(Math.random() * exampleLocations.length)];
    
    // Perbarui placeholder input
    locationInput.placeholder = `Contoh: ${randomExample}`;
}

// --- Event Listeners ---
// 1. Saat tombol cari diklik
searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location) {
        getLocation(location);
    } else {
        // Tampilkan pesan jika input kosong
        errorMessage.textContent = "Silakan masukkan nama lokasi";
        errorMessage.classList.remove('hidden');
        showExampleLocation();
    }
});

// 2. Saat menekan tombol "Enter" di kotak input
locationInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const location = locationInput.value.trim();
        if (location) {
            getLocation(location);
        } else {
            // Tampilkan pesan jika input kosong
            errorMessage.textContent = "Silakan masukkan nama lokasi";
            errorMessage.classList.remove('hidden');
            showExampleLocation();
        }
    }
});

// 3. Saat input fokus, hapus placeholder
locationInput.addEventListener('focus', () => {
    locationInput.placeholder = "Masukkan nama lokasi...";
});

// 4. Saat input blur, tampilkan contoh lagi
locationInput.addEventListener('blur', () => {
    if (!locationInput.value.trim()) {
        showExampleLocation();
    }
});

// Inisialisasi dengan contoh lokasi
showExampleLocation();