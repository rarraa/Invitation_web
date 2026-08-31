# BLUEVITE.ID - Web Penjualan Undangan Digital Premium

Website penjualan & katalog undangan digital interaktif berbasis web dengan tema visual **Cobalt Blue Neo-Pop & Checkerboard (Catur Biru-Putih)** yang terinspirasi dari referensi desain visual dan kelengkapan fitur dari **Helloguest.id**.

---

## 🌟 Fitur Utama Website

1. **Desain Visual Pop-Art Neo-Brutalism & Checkerboard**:
   - Skema warna Electric Cobalt Blue (`#0038FF`), Aksen Kuning (`#FFE600`), dan Pita Papan Catur Biru-Putih.
   - Tipografi Display Bold Condensed (*Bebas Neue* & *Anton*) dikombinasikan dengan Script Serif elegan (*Playfair Display*).
   - Badge floating mengkilap (*Quick Order*, *Bebas Revisi*, *Rating 4.9★*) dan kartu invoice tiket ber-barcode.

2. **Live Smartphone Simulator (Interactive iPhone Mockup)**:
   - Pengunjung dapat langsung mencoba demo undangan digital di dalam simulator iPhone:
     - **Cover dengan Personalisasi Nama Tamu**: Ketik nama tamu dan cover berubah instan.
     - **Buka Undangan Animation**: Membuka surat dengan animasi cover naik ke atas.
     - **Interactive Audio Synth Player**: Kontrol putar/jeda backsound dengan animasi equalizer visual.
     - **Real-time Countdown Timer**: Hitung mundur hari akad/acara.
     - **Formulir RSVP Real-time**: Kirim konfirmasi kehadiran dan counter tamu otomatis terupdate.
     - **Guestbook / Kolom Ucapan Interaktif**: Tulis doa restu & like ucapan dari tamu lain.
     - **Amplop Digital / Hadiah**: Fitur 1-klik salin nomor rekening bank & QRIS dengan notifikasi toast.
     - **Integrasi Navigasi Google Maps**: Tautan rute langsung ke lokasi venue.

3. **Katalog Tema Lengkap dengan Filter & Pencarian**:
   - Filter kategori: *Wedding Syar'i*, *Wedding Modern*, *Rustic & Floral*, *Sweet 17 / Birthday*, *Aqiqah & Khitan*, dan *Corporate Gathering*.
   - Pencarian judul/kategori real-time & pengurutan harga/popularitas.
   - Tombol cepat **"Live Demo"** dan **"Pesan Tema"**.

4. **Simulasi Smart Guest Dashboard (Manajemen Tamu)**:
   - Input daftar nama tamu & pengelompokan grup (Keluarga, Sahabat, Kolega Kantor, VIP).
   - **Generator Link Sebar WA 1-Klik**: Otomatis membuat format pesan WhatsApp personal lengkap dengan tautan unik nama tamu.
   - QR Code Check-in simulator untuk buku tamu digital di lokasi acara.

5. **Kalkulator Paket Harga & Add-ons Interaktif**:
   - Pilihan paket (Basic Rp 79k, Premium Rp 129k, Eksklusif Custom Domain Rp 249k).
   - Checkbox fitur tambahan (Filter IG, Buku Tamu Digital QR, Sesi Undangan, Custom Domain, Bilingual).
   - Tombol **"Pesan Sekarang via WhatsApp"** yang otomatis mengisi format pesan rincian pesanan.

---

## 🚀 Cara Menjalankan Website

1. Buka folder proyek di:
   `C:\Users\LENOVO\.gemini\antigravity\scratch\invitation-web`
2. Buka file `index.html` langsung di browser favorit Anda (Google Chrome, Microsoft Edge, Safari, Firefox) dengan cara klik dua kali, atau gunakan ekstensi *Live Server* di VS Code / editor pilihan Anda.

---

## ⚙️ Cara Kustomisasi Nomor WhatsApp Admin & Data

- **Mengganti Nomor WhatsApp Admin**:
  Buka file `index.html` dan `js/app.js`, lalu cari nomor `6282223551205` dan gantikan dengan nomor WhatsApp bisnis Anda (gunakan format internasional tanpa tanda +, contoh: `6281234567890`).

- **Menambah / Mengedit Tema Undangan**:
  Buka file `js/data.js` pada array `INVITATION_TEMPLATES` untuk mengubah judul, foto cover, waktu akad/resepsi, dan nomor rekening.
