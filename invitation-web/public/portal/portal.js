/**
 * BLUEVITE - CLIENT PORTAL SCRIPT (#2F3B90 Ultramarine Luxury Edition)
 */

document.addEventListener("DOMContentLoaded", () => {
  initClientPortal();
});

let currentClient = null;

function initClientPortal() {
  currentClient = BlueviteDB.getCurrentClient();

  if (currentClient) {
    showDashboardView();
  } else {
    showLoginView();
  }

  bindPortalEvents();
  lucide.createIcons();
}

function showLoginView() {
  const loginGate = document.getElementById("portal-login-gate");
  const dashboardView = document.getElementById("portal-dashboard-view");
  if (loginGate) loginGate.classList.remove("hidden");
  if (dashboardView) dashboardView.classList.add("hidden");
}

function showDashboardView() {
  const loginGate = document.getElementById("portal-login-gate");
  const dashboardView = document.getElementById("portal-dashboard-view");
  if (loginGate) loginGate.classList.add("hidden");
  if (dashboardView) dashboardView.classList.remove("hidden");

  renderClientInfo();
  renderClientStats();
  renderClientGuests();
  renderClientWishes();
  renderClientWaPreview();
  startClientCountdown();
}

function renderClientInfo() {
  if (!currentClient) return;
  const coupleEl = document.getElementById("client-couple-name");
  const pkgEl = document.getElementById("client-package-info");
  const linkInput = document.getElementById("client-share-link-input");

  if (coupleEl) coupleEl.textContent = `${currentClient.bride} & ${currentClient.groom}`;
  if (pkgEl) pkgEl.textContent = `${currentClient.package} (Masa Aktif s/d ${currentClient.activeUntil})`;
  if (linkInput) linkInput.value = currentClient.url;
}

function startClientCountdown() {
  const target = new Date(currentClient.eventDate).getTime();
  const update = () => {
    const now = new Date().getTime();
    const diff = target - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const el = document.getElementById("client-cd-days-text");
    if (el) el.textContent = `H-${days} Hari Menuju Hari H • ${currentClient.eventDateFormatted}`;
  };
  update();
}

function renderClientStats() {
  if (!currentClient) return;
  const guests = BlueviteDB.getGuestsByInvitation(currentClient.id);
  const totalGuests = guests.length;
  const sentCount = guests.filter(g => g.status === "Sudah Terkirim").length;
  const openedCount = guests.filter(g => g.opened).length;
  const hadirGuests = guests.filter(g => g.rsvp === "Hadir");
  const totalPorsi = hadirGuests.reduce((acc, curr) => acc + (curr.count || 1), 0);
  const checkedinCount = guests.filter(g => g.checkin).length;

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

let currentGroupFilter = "Semua";
let currentSearchGuest = "";

function renderClientGuests() {
  if (!currentClient) return;
  const tbody = document.getElementById("client-guest-tbody");
  if (!tbody) return;

  let guests = BlueviteDB.getGuestsByInvitation(currentClient.id);

  if (currentGroupFilter !== "Semua") {
    guests = guests.filter(g => g.group === currentGroupFilter);
  }

  if (currentSearchGuest.trim() !== "") {
    const q = currentSearchGuest.toLowerCase();
    guests = guests.filter(g => g.name.toLowerCase().includes(q) || (g.phone && g.phone.includes(q)));
  }

  if (guests.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-8 text-center text-slate-400 font-mono text-xs">
          Belum ada data tamu yang cocok. Tambahkan tamu baru di atas.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = guests.map((g, idx) => {
    const personalLink = `${currentClient.url}?to=${encodeURIComponent(g.name)}`;
    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-left">
        <td class="p-3.5 text-xs font-mono text-slate-400 font-bold">${idx + 1}</td>
        <td class="p-3.5">
          <div class="font-bold text-xs text-slate-900 flex items-center gap-1.5 font-sans">
            <span>${g.name}</span>
            ${g.checkin ? '<span class="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded font-mono">Check-in (' + (g.checkinTime || 'Hadir') + ')</span>' : ''}
          </div>
          <div class="text-[10px] text-slate-400 font-mono">${g.phone || '-'}</div>
        </td>
        <td class="p-3.5">
          <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
            g.group === 'VIP Guest' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
            (g.group === 'Keluarga' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-700')
          }">
            ${g.group}
          </span>
        </td>
        <td class="p-3.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${
            g.status === 'Sudah Terkirim' ? 'bg-blue-100 text-[#2f3b90]' : 'bg-slate-100 text-slate-600'
          }">
            ${g.status}
          </span>
        </td>
        <td class="p-3.5">
          <span class="text-xs font-mono font-bold ${
            g.rsvp === 'Hadir' ? 'text-emerald-600' : (g.rsvp === 'Ragu-ragu' ? 'text-amber-600' : 'text-slate-400')
          }">
            ${g.rsvp} ${g.count > 0 ? `(${g.count} porsi)` : ''}
          </span>
        </td>
        <td class="p-3.5">
          <div class="flex items-center gap-1.5">
            <button onclick="sendDirectWa(${g.id})" title="Kirim via WhatsApp Langsung" class="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm">
              <i data-lucide="send" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="copyLink('${personalLink}', '${g.name}')" title="Salin Tautan Personal" class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2f3b90] transition">
              <i data-lucide="link" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="copyWaText(${g.id})" title="Salin Format Pesan" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="deleteGuestItem(${g.id})" title="Hapus Tamu" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

let waTemplate = "Kepada Yth. *{nama_tamu}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:\n\n*{mempelai}*\n📅 {tanggal_acara}\n📍 Grand Ballroom Hotel Mulia Senayan Jakarta\n\nBerikut tautan undangan digital personal Anda:\n👉 {link_undangan}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu berkenan hadir dan memberikan doa restu.\n\nTerima kasih.\n*{mempelai}*";

function generateClientMessage(guest) {
  if (!currentClient) return "";
  const personalLink = `${currentClient.url}?to=${encodeURIComponent(guest.name)}`;
  return waTemplate
    .replace(/{nama_tamu}/g, guest.name)
    .replace(/{link_undangan}/g, personalLink)
    .replace(/{grup}/g, guest.group)
    .replace(/{tanggal_acara}/g, currentClient.eventDateFormatted)
    .replace(/{mempelai}/g, `${currentClient.bride.split(',')[0]} & ${currentClient.groom.split(',')[0]}`);
}

function renderClientWaPreview() {
  if (!currentClient) return;
  const guests = BlueviteDB.getGuestsByInvitation(currentClient.id);
  const sample = guests[0] || { name: "Bpk. H. Sukirno", group: "Keluarga" };
  const previewEl = document.getElementById("wa-preview-bubble");
  if (previewEl) {
    previewEl.innerText = generateClientMessage(sample);
  }
}

function sendDirectWa(guestId) {
  if (!currentClient) return;
  const guests = BlueviteDB.getGuestsByInvitation(currentClient.id);
  const guest = guests.find(g => g.id === guestId);
  if (!guest) return;

  const msg = generateClientMessage(guest);
  let phone = (guest.phone || "").replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) phone = '62' + phone.substring(1);

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');

  BlueviteDB.updateGuest(guestId, { status: "Sudah Terkirim" });
  renderClientStats();
  renderClientGuests();
  showToast(`📲 Mengirim pesan undangan ke WhatsApp ${guest.name}`);
}

function copyWaText(guestId) {
  if (!currentClient) return;
  const guests = BlueviteDB.getGuestsByInvitation(currentClient.id);
  const guest = guests.find(g => g.id === guestId);
  if (!guest) return;

  const msg = generateClientMessage(guest);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(msg);
    BlueviteDB.updateGuest(guestId, { status: "Sudah Terkirim" });
    renderClientStats();
    renderClientGuests();
    showToast(`📋 Pesan WhatsApp untuk "${guest.name}" berhasil disalin!`);
  }
}

function copyLink(link, name) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link);
    showToast(`🔗 Tautan undangan untuk "${name}" berhasil disalin!`);
  }
}

function deleteGuestItem(id) {
  BlueviteDB.deleteGuest(id);
  renderClientStats();
  renderClientGuests();
  showToast("🗑️ Tamu berhasil dihapus dari database.");
}

function renderClientWishes() {
  if (!currentClient) return;
  const wishes = BlueviteDB.getWishesByInvitation(currentClient.id);
  const tbody = document.getElementById("client-wishes-tbody");
  if (!tbody) return;

  tbody.innerHTML = wishes.map(w => `
    <tr class="border-b border-slate-100 text-left">
      <td class="p-3.5">
        <div class="font-bold text-xs text-slate-900 font-sans">${w.name}</div>
        <span class="text-[10px] text-slate-400 font-mono">${w.time}</span>
      </td>
      <td class="p-3.5 text-xs text-slate-600 max-w-xs leading-relaxed font-sans">
        ${w.message}
      </td>
      <td class="p-3.5">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded ${
          w.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }">
          ${w.status === 'active' ? 'Ditampilkan' : 'Disembunyikan'}
        </span>
      </td>
      <td class="p-3.5">
        <button onclick="toggleWish(${w.id})" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition" title="Toggle Tampilkan/Sembunyikan">
          <i data-lucide="${w.status === 'active' ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
        </button>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

function toggleWish(id) {
  if (!currentClient) return;
  const wishes = BlueviteDB.getWishesByInvitation(currentClient.id);
  const found = wishes.find(w => w.id === id);
  if (found) {
    found.status = found.status === "active" ? "hidden" : "active";
    BlueviteDB.save(BlueviteDB.STORAGE_KEYS.WISHES, wishes);
    renderClientWishes();
    showToast(found.status === "active" ? "👁️ Ucapan ditampilkan di feed" : "🚫 Ucapan disembunyikan");
  }
}

function simulateQrScan(code) {
  if (!currentClient) return;
  const guests = BlueviteDB.getGuestsByInvitation(currentClient.id);
  const cleanCode = window.BlueviteSecurity.sanitizeInput(code).toLowerCase();
  const guest = guests.find(g => g.id.toString() === cleanCode || g.name.toLowerCase().includes(cleanCode));
  const resultBox = document.getElementById("qr-scan-result");

  if (guest) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    BlueviteDB.updateGuest(guest.id, {
      checkin: true,
      rsvp: "Hadir",
      count: guest.count || 2,
      checkinTime: timeStr
    });

    renderClientStats();
    renderClientGuests();

    if (resultBox) {
      resultBox.innerHTML = `
        <div class="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 text-slate-900 text-left animate-bounce shadow-lg">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <span class="text-[10px] font-mono text-emerald-700 font-bold uppercase">CHECK-IN BERHASIL</span>
              <h4 class="font-serifLuxury text-2xl text-slate-950 font-bold">${guest.name}</h4>
            </div>
          </div>
          <div class="text-xs text-slate-600 space-y-1 font-mono">
            <div>Kategori: <b>${guest.group}</b></div>
            <div>Porsi Kehadiran: <b>${guest.count || 2} Orang</b></div>
            <div>Waktu Kedatangan: <b>${timeStr}</b></div>
          </div>
        </div>
      `;
    }
    showToast(`🎟️ Sukses Check-in: ${guest.name}`);
  } else {
    if (resultBox) {
      resultBox.innerHTML = `
        <div class="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 text-rose-800 text-left">
          <h4 class="font-bold text-xs font-mono">❌ Tamu Tidak Ditemukan</h4>
          <p class="text-xs mt-1 font-sans">Kode QR tidak valid atau belum terdaftar dalam database.</p>
        </div>
      `;
    }
  }
}

function bindPortalEvents() {
  // Login Form
  const loginForm = document.getElementById("portal-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = loginForm.client_passcode.value.trim();
      const res = BlueviteDB.loginClient(code);
      if (res.success) {
        currentClient = res.invitation;
        showDashboardView();
        showToast(`🎉 Selamat datang kembali, ${currentClient.bride.split(',')[0]} & ${currentClient.groom.split(',')[0]}!`);
      } else {
        showToast(`❌ ${res.message}`);
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById("client-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      BlueviteDB.logoutClient();
      currentClient = null;
      showLoginView();
      showToast("🔒 Anda telah keluar dari Smart Dashboard.");
    });
  }

  // Add Guest Form
  const addGuestForm = document.getElementById("client-add-guest-form");
  if (addGuestForm) {
    addGuestForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = addGuestForm.guest_name.value.trim();
      const group = addGuestForm.guest_group.value;
      const phone = addGuestForm.guest_phone.value.trim();

      if (name && currentClient) {
        BlueviteDB.addGuest({
          invitationId: currentClient.id,
          name: name,
          group: group,
          phone: phone || "-",
          status: "Draft",
          opened: false,
          rsvp: "Belum Mengisi",
          count: 0,
          checkin: false
        });
        addGuestForm.reset();
        renderClientStats();
        renderClientGuests();
        showToast(`✅ Tamu "${name}" tersimpan di database!`);
      }
    });
  }

  // Search Guest
  const searchInput = document.getElementById("client-search-guest");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchGuest = e.target.value;
      renderClientGuests();
    });
  }

  // Filter Group
  const filterGroup = document.getElementById("client-filter-group");
  if (filterGroup) {
    filterGroup.addEventListener("change", (e) => {
      currentGroupFilter = e.target.value;
      renderClientGuests();
    });
  }

  // Navigation Tabs
  const navTabs = document.querySelectorAll(".dash-nav-tab");
  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetSection = tab.getAttribute("data-tab");
      navTabs.forEach(t => {
        t.classList.remove("bg-white", "text-[#2f3b90]", "border-2", "border-white");
        t.classList.add("text-slate-300", "hover:bg-white/10");
      });
      tab.classList.add("bg-white", "text-[#2f3b90]", "border-2", "border-white");
      tab.classList.remove("text-slate-300", "hover:bg-white/10");

      document.querySelectorAll(".dash-section-pane").forEach(pane => {
        pane.classList.add("hidden");
      });
      const activePane = document.getElementById(`pane-${targetSection}`);
      if (activePane) activePane.classList.remove("hidden");
      lucide.createIcons();
    });
  });

  // Settings Save
  const settingsForm = document.getElementById("client-settings-form");
  if (settingsForm) {
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!currentClient) return;
      currentClient.bride = window.BlueviteSecurity.sanitizeInput(settingsForm.bride_name.value);
      currentClient.groom = window.BlueviteSecurity.sanitizeInput(settingsForm.groom_name.value);
      currentClient.eventDateFormatted = window.BlueviteSecurity.sanitizeInput(settingsForm.event_date.value);

      const allInvs = BlueviteDB.get(BlueviteDB.STORAGE_KEYS.INVITATIONS);
      const idx = allInvs.findIndex(i => i.id === currentClient.id);
      if (idx !== -1) {
        allInvs[idx] = currentClient;
        BlueviteDB.save(BlueviteDB.STORAGE_KEYS.INVITATIONS, allInvs);
        const updatedSession = window.BlueviteSecurity.createSession(currentClient, 6);
        localStorage.setItem(BlueviteDB.STORAGE_KEYS.AUTH_CLIENT, JSON.stringify(updatedSession));
      }
      renderClientInfo();
      showToast("💾 Perubahan data undangan berhasil disimpan ke database!");
    });
  }
}

// Global Toast Helper
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
