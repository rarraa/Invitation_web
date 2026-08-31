# PANDUAN LENGKAP ARSITEKTUR & PENYIMPANAN DATABASE (BLUEVITE.ID)

Dokumen ini menjelaskan secara rinci bagaimana sistem penyimpanan data di website undangan digital **BLUEVITE.ID** bekerja saat ini dan bagaimana cara menghubungkannya ke Database Cloud Produksi (Supabase / Firebase / MySQL).

---

## 💾 1. Di Mana Data Disimpan Saat Ini?

Untuk kemudahan pengujian lokal dan performa cepat tanpa perlu menyewa server database di awal, seluruh sistem telah dilengkapi dengan **Database Storage Engine bawaan (`js/db.js`)**.

### Cara Kerja Penyimpanan Saat Ini (`LocalStorage Database Engine`):
1. **Penyimpanan Persisten di Browser**:
   - Setiap kali pengantin menambah data tamu di `portal/index.html`, data langsung tersimpan di storage browser dan **TIDAK AKAN HILANG** meskipun browser di-refresh atau ditutup.
   - Setiap kali tamu mengisi form RSVP atau mengirim ucapan di undangan, data otomatis masuk ke tabel database ucapan (`bluevite_wishes`) dan tamu (`bluevite_guests`).
2. **Kunci Tabel Database Bawaan**:
   - `bluevite_invitations`: Menyimpan data akun pengantin, tanggal akad/resepsi, dan rekening hadiah.
   - `bluevite_guests`: Menyimpan daftar tamu, nomor telepon, status RSVP (Hadir/Ragu/Tidak), dan status check-in QR.
   - `bluevite_wishes`: Menyimpan doa dan ucapan tamu dari form undangan.
   - `bluevite_orders`: Menyimpan riwayat pesanan masuk untuk Super Admin.

---

## ☁️ 2. Cara Menyimpan ke Database Online / Cloud (Production Ready)

Jika Anda ingin website dapat diakses dari banyak perangkat yang berbeda secara online, Anda cukup menghubungkan fungsi di `js/db.js` ke backend database online.

Pilihan database yang paling direkomendasikan & gratis:

### Opsi A: Supabase (PostgreSQL - Sangat Direkomendasikan)
1. Buat akun gratis di [https://supabase.com](https://supabase.com).
2. Buat proyek baru dan buka menu **SQL Editor**.
3. Jalankan script SQL di bawah ini:

```sql
-- 1. Tabel Akun Undangan Klien
CREATE TABLE invitations (
    id VARCHAR(50) PRIMARY KEY,
    passcode VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(30),
    slug VARCHAR(100) UNIQUE NOT NULL,
    bride VARCHAR(150),
    groom VARCHAR(150),
    event_date TIMESTAMP,
    akad_time VARCHAR(100),
    resepsi_time VARCHAR(100),
    location_name VARCHAR(200),
    location_address TEXT,
    maps_url TEXT,
    package VARCHAR(50),
    custom_domain VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Daftar Tamu
CREATE TABLE guests (
    id BIGSERIAL PRIMARY KEY,
    invitation_id VARCHAR(50) REFERENCES invitations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    group_name VARCHAR(100) DEFAULT 'Keluarga',
    phone VARCHAR(30),
    status VARCHAR(50) DEFAULT 'Draft',
    opened BOOLEAN DEFAULT FALSE,
    rsvp VARCHAR(50) DEFAULT 'Belum Mengisi',
    count INT DEFAULT 0,
    checkin BOOLEAN DEFAULT FALSE,
    checkin_time VARCHAR(30)
);

-- 3. Tabel Doa & Ucapan
CREATE TABLE wishes (
    id BIGSERIAL PRIMARY KEY,
    invitation_id VARCHAR(50) REFERENCES invitations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'active',
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Pesanan Admin
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    client_name VARCHAR(150),
    phone VARCHAR(30),
    template VARCHAR(100),
    package VARCHAR(50),
    total DECIMAL(12,2),
    payment_status VARCHAR(30),
    workflow_status VARCHAR(30),
    order_date DATE DEFAULT CURRENT_DATE
);
```

---

## 🔒 3. Struktur Pemisahan Akses & Keamanan Rute

Untuk memastikan pengunjung umum tidak mengetahui adanya portal admin dan klien:

| Halaman | Rute URL | Akses & Keamanan |
| :--- | :--- | :--- |
| **Web Penjualan Utama** | `index.html` (atau `https://domainanda.com/`) | **Publik**. Bersih tanpa ada tombol/link admin maupun klien. |
| **Portal Smart Pengantin** | `portal/index.html` (atau `https://domainanda.com/portal`) | **Khusus Pembeli**. Dilindungi form login **Kode Undangan** (contoh: `RAYHAN-AISYAH`). |
| **Portal Super Admin** | `secret-admin/index.html` (atau `https://domainanda.com/secret-admin`) | **Privat & Rahasia**. Dilindungi login **Username & Password Admin** (`admin` / `admin123`). |

---

## 🚀 4. Uji Coba Langsung di Browser

1. Buka [**`index.html`**](file:///C:/Users/LENOVO/.gemini/antigravity/scratch/invitation-web/index.html) -> Tampilan web penjualan murni tanpa link admin/klien.
2. Buka [**`portal/index.html`**](file:///C:/Users/LENOVO/.gemini/antigravity/scratch/invitation-web/portal/index.html) -> Masuk dengan kode `RAYHAN-AISYAH` untuk menguji Smart Dashboard Pengantin.
3. Buka [**`secret-admin/index.html`**](file:///C:/Users/LENOVO/.gemini/antigravity/scratch/invitation-web/secret-admin/index.html) -> Masuk dengan user `admin` & password `admin123` untuk menguji Master Admin.
