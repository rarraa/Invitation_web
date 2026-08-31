/**
 * BLUEVITE - SMART GUEST DASHBOARD SIMULATOR
 * Interactive showcase of the guestbook manager & WhatsApp Link Broadcast tool
 */

class SmartDashboardDemo {
  constructor() {
    this.guests = [
      { id: 1, name: "Bpk. H. Sukirno & Keluarga", group: "Keluarga", phone: "081234567890", status: "Sudah Terkirim", opened: true, rsvp: "Hadir (3 Orang)" },
      { id: 2, name: "Dra. Siti Nurhaliza, M.Pd", group: "Kolega Kantor", phone: "085712345678", status: "Sudah Terkirim", opened: true, rsvp: "Hadir (1 Orang)" },
      { id: 3, name: "Rian Hidayat & Partner", group: "Sahabat Kuliah", phone: "089612349876", status: "Sudah Terkirim", opened: false, rsvp: "Belum Mengisi" },
      { id: 4, name: "dr. Andika Pratama", group: "VIP Guest", phone: "081398765432", status: "Draft", opened: false, rsvp: "Belum Mengisi" }
    ];

    this.activeFilter = "Semua";
    this.templateUrl = "https://bluevite.id/v/rayhan-aisyah";

    this.init();
  }

  init() {
    this.renderGuestTable();
    this.bindEvents();
    this.updateSummaryCounters();
  }

  bindEvents() {
    const addGuestForm = document.getElementById("demo-add-guest-form");
    if (addGuestForm) {
      addGuestForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = addGuestForm.guest_name.value.trim();
        const group = addGuestForm.guest_group.value;
        const phone = addGuestForm.guest_phone.value.trim();

        if (name) {
          this.addGuest(name, group, phone);
          addGuestForm.reset();
          showToast(`✅ Tamu "${name}" berhasil ditambahkan ke daftar!`);
        }
      });
    }
  }

  addGuest(name, group, phone) {
    const newGuest = {
      id: Date.now(),
      name: name,
      group: group || "Teman",
      phone: phone || "-",
      status: "Draft",
      opened: false,
      rsvp: "Belum Mengisi"
    };

    this.guests.unshift(newGuest);
    this.renderGuestTable();
    this.updateSummaryCounters();
  }

  deleteGuest(id) {
    this.guests = this.guests.filter(g => g.id !== id);
    this.renderGuestTable();
    this.updateSummaryCounters();
    showToast("🗑️ Tamu berhasil dihapus dari daftar.");
  }

  generateWaMessage(guest) {
    const encodedName = encodeURIComponent(guest.name);
    const guestLink = `${this.templateUrl}?to=${encodedName}`;
    
    return `Kepada Yth. *${guest.name}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.\n\nBerikut tautan undangan digital Anda:\n👉 ${guestLink}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu berkenan hadir dan memberikan doa restu.\n\nTerima kasih.`;
  }

  copyGuestLink(guest) {
    const encodedName = encodeURIComponent(guest.name);
    const guestLink = `${this.templateUrl}?to=${encodedName}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(guestLink);
      showToast(`🔗 Link undangan untuk "${guest.name}" berhasil disalin!`);
    } else {
      showToast(`Link: ${guestLink}`);
    }
  }

  copyBroadcastText(guest) {
    const message = this.generateWaMessage(guest);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      guest.status = "Sudah Terkirim";
      this.renderGuestTable();
      showToast(`📲 Pesan WhatsApp sebar untuk "${guest.name}" berhasil disalin!`);
    }
  }

  sendDirectWhatsApp(guest) {
    const message = this.generateWaMessage(guest);
    const cleanPhone = guest.phone.replace(/[^0-9]/g, '');
    let waPhone = cleanPhone;
    if (waPhone.startsWith('0')) {
      waPhone = '62' + waPhone.substring(1);
    }
    
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    guest.status = "Sudah Terkirim";
    this.renderGuestTable();
    showToast(`🚀 Membuka WhatsApp untuk mengirim undangan ke ${guest.name}`);
  }

  previewGuestInvitation(guest) {
    if (window.simulator) {
      window.simulator.open("royal-syari-01", guest.name);
    }
  }

  simulateCheckin(guest) {
    guest.rsvp = "✅ Checked-in (Hadir di Lokasi)";
    guest.opened = true;
    this.renderGuestTable();
    showToast(`🎟️ QR Code Scan Berhasil! ${guest.name} telah check-in di buku tamu digital.`);
  }

  updateSummaryCounters() {
    const totalEl = document.getElementById("dash-total-guests");
    const sentEl = document.getElementById("dash-sent-guests");
    const openedEl = document.getElementById("dash-opened-guests");

    if (totalEl) totalEl.textContent = this.guests.length;
    if (sentEl) sentEl.textContent = this.guests.filter(g => g.status === "Sudah Terkirim").length;
    if (openedEl) openedEl.textContent = this.guests.filter(g => g.opened).length;
  }

  renderGuestTable() {
    const tableBody = document.getElementById("demo-guest-table-body");
    if (!tableBody) return;

    if (this.guests.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="p-8 text-center text-slate-400 font-mono text-xs">
            Belum ada data tamu. Tambahkan tamu baru di atas.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = this.guests.map((g, idx) => `
      <tr class="border-b border-slate-100 hover:bg-blue-50/50 transition">
        <td class="p-3 text-xs font-mono text-slate-400 font-bold">${idx + 1}</td>
        <td class="p-3">
          <div class="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <span>${g.name}</span>
            ${g.opened ? '<span class="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">Dibuka</span>' : ''}
          </div>
          <div class="text-[10px] text-slate-400 font-mono">${g.phone}</div>
        </td>
        <td class="p-3">
          <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
            g.group === 'VIP Guest' ? 'bg-amber-100 text-amber-800' :
            (g.group === 'Keluarga' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700')
          }">
            ${g.group}
          </span>
        </td>
        <td class="p-3">
          <span class="text-[11px] font-mono font-bold ${
            g.rsvp.includes('Hadir') ? 'text-emerald-600' : 'text-slate-500'
          }">
            ${g.rsvp}
          </span>
        </td>
        <td class="p-3">
          <div class="flex items-center gap-1.5">
            <button onclick="window.dashboardDemo.copyBroadcastText(window.dashboardDemo.guests.find(x => x.id === ${g.id}))" title="Salin Format Pesan WA" class="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 transition">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.dashboardDemo.copyGuestLink(window.dashboardDemo.guests.find(x => x.id === ${g.id}))" title="Salin Link Personal" class="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition">
              <i data-lucide="link" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.dashboardDemo.previewGuestInvitation(window.dashboardDemo.guests.find(x => x.id === ${g.id}))" title="Lihat Tampilan Undangan" class="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-700 transition">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.dashboardDemo.simulateCheckin(window.dashboardDemo.guests.find(x => x.id === ${g.id}))" title="Scan QR Check-in" class="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition">
              <i data-lucide="qr-code" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.dashboardDemo.deleteGuest(${g.id})" title="Hapus Tamu" class="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    lucide.createIcons();
  }
}

// Initialize on DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
  window.dashboardDemo = new SmartDashboardDemo();
});
