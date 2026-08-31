/**
 * BLUEVITE - CLIENT SMART DASHBOARD ENGINE
 * Interactive Guest Manager, WhatsApp Template Generator, QR Scanner, RSVP Analytics, & Content Editor
 */

class ClientDashboard {
  constructor() {
    this.clientData = {
      slug: "rayhan-aisyah",
      url: "https://bluevite.id/v/rayhan-aisyah",
      bride: "dr. Aisyah Humaira, Sp.A",
      groom: "Muhammad Rayhan, S.T",
      eventDate: "2026-11-20T08:00:00",
      eventDateFormatted: "Minggu, 20 November 2026",
      package: "Paket Premium",
      activeUntil: "20 November 2027",
      status: "LIVE ONLINE",
      customDomain: "rayhan-aisyah.com"
    };

    this.guests = [
      { id: 1, name: "Bpk. H. Sukirno & Ibu Hj. Marwah", group: "Keluarga", phone: "081234567890", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 3, checkin: false },
      { id: 2, name: "Dra. Siti Nurhaliza, M.Pd", group: "Kolega Kantor", phone: "085712345678", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 1, checkin: false },
      { id: 3, name: "Rian Hidayat & Partner", group: "Sahabat Kuliah", phone: "089612349876", status: "Sudah Terkirim", opened: false, rsvp: "Ragu-ragu", count: 0, checkin: false },
      { id: 4, name: "dr. Andika Pratama, Sp.PD", group: "VIP Guest", phone: "081398765432", status: "Draft", opened: false, rsvp: "Belum Mengisi", count: 0, checkin: false },
      { id: 5, name: "Ir. Bambang Trihatmodjo", group: "VIP Guest", phone: "081198765432", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 2, checkin: true, checkinTime: "08:15 WIB" },
      { id: 6, name: "Fathur Rahman, S.Kom", group: "Sahabat Kuliah", phone: "082188765432", status: "Draft", opened: false, rsvp: "Belum Mengisi", count: 0, checkin: false }
    ];

    this.wishes = [
      { id: 1, name: "Budi Santoso & Keluarga", message: "Barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fii khair. Selamat menempuh hidup baru ya, semoga sakinah mawaddah warahmah!", time: "10 menit lalu", status: "active", pinned: true },
      { id: 2, name: "Dr. Farah Amelia", message: "Selamat untuk kedua mempelai! Semoga cinta dan kebahagiaan selalu menyertai perjalanan kalian. Sampai ketemu di resepsi!", time: "25 menit lalu", status: "active", pinned: false },
      { id: 3, name: "Rendra & Team Creative", message: "Happy wedding Rayhan & Aisyah! Lancar sampai hari H ya kawan!", time: "1 jam lalu", status: "active", pinned: false },
      { id: 4, name: "Spam User 99", message: "Halo promo pinjaman dana cepat hubungi 0899999", time: "2 jam lalu", status: "hidden", pinned: false }
    ];

    this.waTemplate = "Kepada Yth. *{nama_tamu}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:\n\n*Aisyah & Rayhan*\n📅 {tanggal_acara}\n📍 Hotel Mulia Senayan Jakarta\n\nBerikut tautan undangan digital personal Anda:\n👉 {link_undangan}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu berkenan hadir dan memberikan doa restu.\n\nTerima kasih.\n*Aisyah & Rayhan*";

    this.currentGroupFilter = "Semua";
    this.currentSearchGuest = "";

    this.init();
  }

  init() {
    this.renderStats();
    this.renderGuestList();
    this.renderWishesList();
    this.renderWaPreview();
    this.bindEvents();
    this.startCountdown();
    lucide.createIcons();
  }

  bindEvents() {
    // Navigation Tabs
    const navTabs = document.querySelectorAll(".dash-nav-tab");
    navTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const targetSection = tab.getAttribute("data-tab");
        navTabs.forEach(t => {
          t.classList.remove("bg-yellow-400", "text-black", "border-black");
          t.classList.add("text-slate-300", "hover:bg-white/10");
        });
        tab.classList.add("bg-yellow-400", "text-black", "border-black");
        tab.classList.remove("text-slate-300", "hover:bg-white/10");

        document.querySelectorAll(".dash-section-pane").forEach(pane => {
          pane.classList.add("hidden");
        });
        const activePane = document.getElementById(`pane-${targetSection}`);
        if (activePane) activePane.classList.remove("hidden");
        lucide.createIcons();
      });
    });

    // Add Guest Form
    const addForm = document.getElementById("client-add-guest-form");
    if (addForm) {
      addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = addForm.guest_name.value.trim();
        const group = addForm.guest_group.value;
        const phone = addForm.guest_phone.value.trim();

        if (name) {
          this.guests.unshift({
            id: Date.now(),
            name: name,
            group: group,
            phone: phone || "-",
            status: "Draft",
            opened: false,
            rsvp: "Belum Mengisi",
            count: 0,
            checkin: false
          });
          addForm.reset();
          this.renderStats();
          this.renderGuestList();
          showToast(`✅ Tamu "${name}" berhasil ditambahkan!`);
        }
      });
    }

    // Guest Search
    const searchInput = document.getElementById("client-search-guest");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.currentSearchGuest = e.target.value;
        this.renderGuestList();
      });
    }

    // Guest Group Filter
    const groupSelect = document.getElementById("client-filter-group");
    if (groupSelect) {
      groupSelect.addEventListener("change", (e) => {
        this.currentGroupFilter = e.target.value;
        this.renderGuestList();
      });
    }

    // WA Template Textarea
    const templateInput = document.getElementById("wa-template-input");
    if (templateInput) {
      templateInput.value = this.waTemplate;
      templateInput.addEventListener("input", (e) => {
        this.waTemplate = e.target.value;
        this.renderWaPreview();
      });
    }

    // Content Settings Form
    const settingsForm = document.getElementById("client-settings-form");
    if (settingsForm) {
      settingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.clientData.bride = settingsForm.bride_name.value;
        this.clientData.groom = settingsForm.groom_name.value;
        this.clientData.eventDateFormatted = settingsForm.event_date.value;
        showToast("💾 Pengaturan undangan berhasil disimpan & diperbarui secara live!");
      });
    }
  }

  startCountdown() {
    const target = new Date("2026-11-20T08:00:00").getTime();
    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const el = document.getElementById("client-cd-days");
      if (el) el.textContent = `H-${days} Hari Menuju Hari H`;
    };
    update();
  }

  renderStats() {
    const totalGuests = this.guests.length;
    const sentCount = this.guests.filter(g => g.status === "Sudah Terkirim").length;
    const openedCount = this.guests.filter(g => g.opened).length;
    const hadirGuests = this.guests.filter(g => g.rsvp === "Hadir");
    const totalPorsi = hadirGuests.reduce((acc, curr) => acc + (curr.count || 1), 0);
    const checkedinCount = this.guests.filter(g => g.checkin).length;

    const elTotal = document.getElementById("stat-total-guests");
    const elSent = document.getElementById("stat-sent-guests");
    const elOpened = document.getElementById("stat-opened-guests");
    const elHadir = document.getElementById("stat-hadir-count");
    const elPorsi = document.getElementById("stat-total-porsi");
    const elCheckin = document.getElementById("stat-checkedin-count");

    if (elTotal) elTotal.textContent = totalGuests;
    if (elSent) elSent.textContent = sentCount;
    if (elOpened) elOpened.textContent = openedCount;
    if (elHadir) elHadir.textContent = hadirGuests.length;
    if (elPorsi) elPorsi.textContent = `${totalPorsi} Orang`;
    if (elCheckin) elCheckin.textContent = checkedinCount;
  }

  renderGuestList() {
    const tbody = document.getElementById("client-guest-tbody");
    if (!tbody) return;

    let filtered = [...this.guests];

    if (this.currentGroupFilter !== "Semua") {
      filtered = filtered.filter(g => g.group === this.currentGroupFilter);
    }

    if (this.currentSearchGuest.trim() !== "") {
      const q = this.currentSearchGuest.toLowerCase();
      filtered = filtered.filter(g => g.name.toLowerCase().includes(q) || g.phone.includes(q));
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-slate-400 font-mono text-xs">
            Tidak ada data tamu yang cocok.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((g, idx) => {
      const personalLink = `${this.clientData.url}?to=${encodeURIComponent(g.name)}`;
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-left">
          <td class="p-3 text-xs font-mono text-slate-400 font-bold">${idx + 1}</td>
          <td class="p-3">
            <div class="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <span>${g.name}</span>
              ${g.checkin ? '<span class="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded font-mono">Check-in (' + g.checkinTime + ')</span>' : ''}
            </div>
            <div class="text-[10px] text-slate-400 font-mono">${g.phone}</div>
          </td>
          <td class="p-3">
            <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
              g.group === 'VIP Guest' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
              (g.group === 'Keluarga' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-700')
            }">
              ${g.group}
            </span>
          </td>
          <td class="p-3">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded ${
              g.status === 'Sudah Terkirim' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
            }">
              ${g.status}
            </span>
          </td>
          <td class="p-3">
            <span class="text-xs font-mono font-bold ${
              g.rsvp === 'Hadir' ? 'text-emerald-600' : (g.rsvp === 'Ragu-ragu' ? 'text-amber-600' : 'text-slate-400')
            }">
              ${g.rsvp} ${g.count > 0 ? `(${g.count} porsi)` : ''}
            </span>
          </td>
          <td class="p-3">
            <div class="flex items-center gap-1.5">
              <button onclick="window.clientDash.sendDirectWa(${g.id})" title="Kirim via WhatsApp Langsung" class="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm">
                <i data-lucide="send" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="window.clientDash.copyPersonalLink('${personalLink}', '${g.name}')" title="Salin Tautan Personal" class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition">
                <i data-lucide="link" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="window.clientDash.copyPersonalWaText(${g.id})" title="Salin Format Pesan" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="window.clientDash.deleteGuest(${g.id})" title="Hapus Tamu" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    lucide.createIcons();
  }

  generateCustomMessage(guest) {
    const personalLink = `${this.clientData.url}?to=${encodeURIComponent(guest.name)}`;
    return this.waTemplate
      .replace(/{nama_tamu}/g, guest.name)
      .replace(/{link_undangan}/g, personalLink)
      .replace(/{grup}/g, guest.group)
      .replace(/{tanggal_acara}/g, this.clientData.eventDateFormatted);
  }

  renderWaPreview() {
    const sampleGuest = this.guests[0] || { name: "Bpk. H. Sukirno", group: "Keluarga" };
    const previewEl = document.getElementById("wa-preview-bubble");
    if (previewEl) {
      previewEl.innerText = this.generateCustomMessage(sampleGuest);
    }
  }

  sendDirectWa(guestId) {
    const guest = this.guests.find(g => g.id === guestId);
    if (!guest) return;

    const message = this.generateCustomMessage(guest);
    let cleanPhone = guest.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    guest.status = "Sudah Terkirim";
    this.renderStats();
    this.renderGuestList();
    showToast(`📲 Mengirim pesan undangan ke WhatsApp ${guest.name}`);
  }

  copyPersonalWaText(guestId) {
    const guest = this.guests.find(g => g.id === guestId);
    if (!guest) return;

    const message = this.generateCustomMessage(guest);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      guest.status = "Sudah Terkirim";
      this.renderStats();
      this.renderGuestList();
      showToast(`📋 Pesan WhatsApp untuk "${guest.name}" berhasil disalin!`);
    }
  }

  copyPersonalLink(link, name) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      showToast(`🔗 Tautan undangan untuk "${name}" berhasil disalin!`);
    }
  }

  deleteGuest(id) {
    this.guests = this.guests.filter(g => g.id !== id);
    this.renderStats();
    this.renderGuestList();
    showToast("🗑️ Tamu berhasil dihapus dari daftar.");
  }

  // QR SCANNER CHECK-IN DEMO
  simulateQrScan(code) {
    const guest = this.guests.find(g => g.id.toString() === code || g.name.toLowerCase().includes(code.toLowerCase()));
    const resultBox = document.getElementById("qr-scan-result");

    if (guest) {
      guest.checkin = true;
      guest.rsvp = "Hadir";
      if (!guest.count || guest.count === 0) guest.count = 2;
      const now = new Date();
      guest.checkinTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

      this.renderStats();
      this.renderGuestList();

      if (resultBox) {
        resultBox.innerHTML = `
          <div class="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 text-slate-900 text-left animate-bounce shadow-lg">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <span class="text-[10px] font-mono text-emerald-700 font-bold uppercase">CHECK-IN BERHASIL</span>
                <h4 class="font-display text-2xl text-slate-950">${guest.name}</h4>
              </div>
            </div>
            <div class="text-xs text-slate-600 space-y-1 font-mono">
              <div>Kategori: <b>${guest.group}</b></div>
              <div>Porsi Kehadiran: <b>${guest.count} Orang</b></div>
              <div>Waktu Kedatangan: <b>${guest.checkinTime}</b></div>
            </div>
          </div>
        `;
      }
      showToast(`🎟️ Sukses Check-in: ${guest.name}`);
    } else {
      if (resultBox) {
        resultBox.innerHTML = `
          <div class="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 text-rose-800 text-left">
            <h4 class="font-bold text-xs">❌ Tamu Tidak Ditemukan</h4>
            <p class="text-xs mt-1">Kode QR tidak valid atau belum terdaftar dalam sistem.</p>
          </div>
        `;
      }
    }
  }

  // WISHES MODERATION
  toggleWishStatus(id) {
    const wish = this.wishes.find(w => w.id === id);
    if (wish) {
      wish.status = wish.status === "active" ? "hidden" : "active";
      this.renderWishesList();
      showToast(wish.status === "active" ? "👁️ Ucapan ditampilkan di undangan" : "🚫 Ucapan disembunyikan");
    }
  }

  deleteWish(id) {
    this.wishes = this.wishes.filter(w => w.id !== id);
    this.renderWishesList();
    showToast("🗑️ Ucapan berhasil dihapus permanen.");
  }

  renderWishesList() {
    const container = document.getElementById("client-wishes-tbody");
    if (!container) return;

    container.innerHTML = this.wishes.map(w => `
      <tr class="border-b border-slate-100 text-left">
        <td class="p-3">
          <div class="font-bold text-xs text-slate-900">${w.name}</div>
          <span class="text-[10px] text-slate-400 font-mono">${w.time}</span>
        </td>
        <td class="p-3 text-xs text-slate-600 max-w-xs">
          ${w.message}
        </td>
        <td class="p-3">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${
            w.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }">
            ${w.status === 'active' ? 'Ditampilkan' : 'Disembunyikan'}
          </span>
        </td>
        <td class="p-3">
          <div class="flex items-center gap-2">
            <button onclick="window.clientDash.toggleWishStatus(${w.id})" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition" title="Toggle Sembunyikan/Tampilkan">
              <i data-lucide="${w.status === 'active' ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.clientDash.deleteWish(${w.id})" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition" title="Hapus">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    lucide.createIcons();
  }
}

// Global helper for toast
function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideInUp 0.3s reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

window.addEventListener("DOMContentLoaded", () => {
  window.clientDash = new ClientDashboard();
});
