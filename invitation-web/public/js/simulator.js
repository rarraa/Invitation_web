/**
 * BLUEVITE - LUXURY INVITATION SIMULATOR ENGINE (#2F3B90 Ultramarine Edition)
 */

class InvitationSimulator {
  constructor() {
    this.modal = document.getElementById("simulator-modal");
    this.screen = document.getElementById("simulator-screen");
    this.closeBtn = document.getElementById("close-simulator-btn");
    this.guestInput = document.getElementById("simulator-guest-input");

    this.currentTemplate = null;
    this.isPlaying = false;
    this.audioObj = null;
    this.guestName = "Tamu Undangan";
    this.isOpenInvitation = false;

    this.bindEvents();
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    if (this.guestInput) {
      this.guestInput.addEventListener("input", (e) => {
        this.guestName = e.target.value.trim() || "Tamu Undangan";
        this.updateGuestNameInView();
      });
    }
  }

  open(templateId = "royal-ultramarine-01", customGuest = null) {
    this.currentTemplate = INVITATION_TEMPLATES.find(t => t.id === templateId) || INVITATION_TEMPLATES[0];
    this.guestName = customGuest || "dr. Tirta Mandira & Istri";
    this.isOpenInvitation = false;
    this.isPlaying = false;

    if (this.guestInput) {
      this.guestInput.value = this.guestName;
    }

    this.render();
    if (this.modal) {
      this.modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
    lucide.createIcons();
  }

  close() {
    if (this.modal) {
      this.modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
    this.stopAudio();
  }

  toggleAudio() {
    this.isPlaying = !this.isPlaying;
    const btn = document.getElementById("sim-audio-toggle");
    const visualizer = document.getElementById("sim-audio-eq");

    if (this.isPlaying) {
      if (btn) btn.innerHTML = `<i data-lucide="volume-2" class="w-4 h-4 text-[#2f3b90]"></i>`;
      if (visualizer) visualizer.classList.remove("eq-paused");
      this.playSyntheticChime();
    } else {
      if (btn) btn.innerHTML = `<i data-lucide="volume-x" class="w-4 h-4 text-slate-400"></i>`;
      if (visualizer) visualizer.classList.add("eq-paused");
    }
    lucide.createIcons();
  }

  playSyntheticChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.6); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      // Audio context ignored
    }
  }

  stopAudio() {
    this.isPlaying = false;
  }

  openEnvelope() {
    this.isOpenInvitation = true;
    this.isPlaying = true;
    this.playSyntheticChime();
    this.render();
    lucide.createIcons();
  }

  updateGuestNameInView() {
    const el = document.getElementById("sim-guest-name-text");
    if (el) el.textContent = this.guestName;
  }

  render() {
    if (!this.currentTemplate || !this.screen) return;
    const t = this.currentTemplate;

    if (!this.isOpenInvitation) {
      // COVER SCREEN
      this.screen.innerHTML = `
        <div class="relative min-h-[640px] flex flex-col justify-between p-6 text-center text-white bg-cover bg-center overflow-hidden" style="background-image: linear-gradient(to bottom, rgba(22, 29, 82, 0.5), rgba(47, 59, 144, 0.9)), url('${t.coverImage}');">
          
          <!-- Sparkles Top -->
          <div class="pt-8 flex justify-between items-center text-white/90">
            <span class="sparkle-icon text-xl text-amber-300">✦</span>
            <span class="text-[10px] font-mono tracking-widest uppercase border border-white/40 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md">
              THE WEDDING CELEBRATION
            </span>
            <span class="sparkle-icon text-xl text-amber-300">✦</span>
          </div>

          <!-- Couple Names with Classic Serif -->
          <div class="my-auto space-y-3 py-6">
            <div class="w-16 h-16 rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center font-serif-luxury text-2xl font-bold shadow-lg">
              ${t.bride[0]}&amp;${t.groom[0]}
            </div>
            <h2 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-white tracking-wide leading-tight drop-shadow-md">
              ${t.bride.split(',')[0]} <br>
              <span class="font-script italic text-2xl font-normal text-amber-200">&amp;</span> <br>
              ${t.groom.split(',')[0]}
            </h2>
            <p class="text-xs font-mono text-white/80 tracking-wider">
              ${t.eventDateFormatted}
            </p>
          </div>

          <!-- Guest Target Box & Open Button -->
          <div class="space-y-4 pb-4">
            <div class="bg-white/95 backdrop-blur-md text-[#161d52] p-4 rounded-2xl border-2 border-white shadow-xl text-center">
              <span class="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
                Kepada Yth. Bapak/Ibu/Saudara/i:
              </span>
              <h4 id="sim-guest-name-text" class="font-display text-lg text-[#2f3b90] font-bold mt-0.5">
                ${this.guestName}
              </h4>
              <span class="text-[9px] text-slate-500 block font-mono mt-0.5">
                *Mohon maaf bila ada kesalahan penulisan nama/gelar
              </span>
            </div>

            <button onclick="window.simulator.openEnvelope()" class="w-full btn-pop-gold py-3 rounded-xl text-xs font-bold uppercase shadow-lg flex items-center justify-center gap-2">
              <i data-lucide="mail-open" class="w-4 h-4"></i>
              <span>Buka Undangan Digital</span>
            </button>
          </div>

        </div>
      `;
    } else {
      // FULL CONTENT SCREEN
      this.screen.innerHTML = `
        <div class="relative bg-white text-slate-900 pb-16 font-sans">
          
          <!-- Sticky Audio Player Widget -->
          <div class="sticky top-0 z-30 bg-[#2f3b90] text-white p-3 flex items-center justify-between shadow-md">
            <div class="flex items-center gap-2">
              <div id="sim-audio-eq" class="flex items-center gap-0.5 h-4">
                <span class="equalizer-bar"></span>
                <span class="equalizer-bar"></span>
                <span class="equalizer-bar"></span>
                <span class="equalizer-bar"></span>
              </div>
              <span class="text-[10px] font-mono text-white/90 truncate max-w-[150px] font-bold">
                ${t.audioTitle}
              </span>
            </div>

            <button id="sim-audio-toggle" onclick="window.simulator.toggleAudio()" class="w-8 h-8 rounded-full bg-white text-[#2f3b90] flex items-center justify-center shadow">
              <i data-lucide="volume-2" class="w-4 h-4 text-[#2f3b90]"></i>
            </button>
          </div>

          <!-- Hero Section inside phone -->
          <div class="relative h-72 bg-cover bg-center flex flex-col justify-end p-5 text-white" style="background-image: linear-gradient(to top, rgba(22, 29, 82, 0.9), transparent), url('${t.thumbnail}');">
            <span class="text-[10px] font-mono bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full w-max mb-1">
              ✦ WALIMATUL 'URS
            </span>
            <h1 class="font-serif-luxury text-3xl font-bold leading-tight">
              ${t.bride.split(',')[0]} &amp; ${t.groom.split(',')[0]}
            </h1>
            <p class="text-xs font-mono text-amber-300">${t.eventDateFormatted}</p>
          </div>

          <!-- Holy Quote Section -->
          <div class="p-6 text-center border-b border-slate-100 bg-[#f8fafc]">
            <span class="sparkle-icon text-lg text-[#2f3b90]">✦</span>
            <p class="font-serif-luxury italic text-xs text-slate-700 leading-relaxed max-w-xs mx-auto mt-1">
              "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya."
            </p>
            <span class="text-[10px] font-mono text-slate-500 font-bold block mt-2">(QS. Ar-Rum: 21)</span>
          </div>

          <!-- Couple Profiles -->
          <div class="p-6 space-y-6 text-center">
            
            <div class="space-y-2">
              <div class="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-[#2f3b90] shadow">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" alt="Mempelai Wanita" class="w-full h-full object-cover">
              </div>
              <h3 class="font-serif-luxury text-xl font-bold text-[#2f3b90]">${t.bride}</h3>
              <p class="text-[11px] text-slate-500 font-mono">${t.brideParents}</p>
            </div>

            <div class="font-script text-2xl text-amber-500 font-bold">&amp;</div>

            <div class="space-y-2">
              <div class="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-[#2f3b90] shadow">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" alt="Mempelai Pria" class="w-full h-full object-cover">
              </div>
              <h3 class="font-serif-luxury text-xl font-bold text-[#2f3b90]">${t.groom}</h3>
              <p class="text-[11px] text-slate-500 font-mono">${t.groomParents}</p>
            </div>

          </div>

          <!-- Event Schedule Cards -->
          <div class="p-6 bg-[#f8fafc] border-y border-slate-200 space-y-4">
            <h3 class="font-display text-xl text-center text-[#161d52] font-bold uppercase">
              Rangkaian Acara
            </h3>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left space-y-1">
              <div class="flex items-center justify-between text-[#2f3b90] font-bold text-xs">
                <span>💍 AKAD NIKAH</span>
                <span class="font-mono text-[10px] bg-blue-50 px-2 py-0.5 rounded">${t.akadTime}</span>
              </div>
              <p class="text-xs text-slate-700 font-bold">${t.locationName}</p>
              <p class="text-[11px] text-slate-500">${t.locationAddress}</p>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left space-y-1">
              <div class="flex items-center justify-between text-[#2f3b90] font-bold text-xs">
                <span>🥂 RESEPSI PERNIKAHAN</span>
                <span class="font-mono text-[10px] bg-blue-50 px-2 py-0.5 rounded">${t.resepsiTime}</span>
              </div>
              <p class="text-xs text-slate-700 font-bold">${t.locationName}</p>
              <p class="text-[11px] text-slate-500">${t.locationAddress}</p>
            </div>

            <a href="${t.mapsUrl}" target="_blank" class="w-full btn-pop-dark py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>Buka Petunjuk Arah Google Maps</span>
            </a>
          </div>

          <!-- RSVP Form Simulation -->
          <div class="p-6 text-left space-y-3">
            <h3 class="font-display text-xl text-[#161d52] font-bold uppercase text-center">
              Konfirmasi Kehadiran (RSVP)
            </h3>
            
            <form onsubmit="event.preventDefault(); showToast('✨ Terima kasih, konfirmasi kehadiran Anda berhasil dikirim!');" class="space-y-3 bg-[#f8fafc] p-4 rounded-2xl border border-slate-200">
              <div>
                <label class="block text-[10px] font-bold text-slate-700 font-mono mb-1">Nama Lengkap:</label>
                <input type="text" value="${this.guestName}" required class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#2f3b90]">
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-700 font-mono mb-1">Konfirmasi:</label>
                <select class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#2f3b90]">
                  <option value="Hadir">Saya Pasti Hadir</option>
                  <option value="Ragu">Masih Ragu-ragu</option>
                  <option value="Tidak Hadir">Maaf, Belum Bisa Hadir</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-700 font-mono mb-1">Jumlah Tamu (Porsi):</label>
                <input type="number" min="1" max="5" value="2" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#2f3b90]">
              </div>

              <button type="submit" class="w-full btn-pop-gold py-2 rounded-xl text-xs font-bold uppercase">
                Kirim Konfirmasi RSVP
              </button>
            </form>
          </div>

          <!-- Digital Envelope & Gift Bank -->
          <div class="p-6 bg-[#f8fafc] border-t border-slate-200 text-left space-y-3">
            <h3 class="font-display text-xl text-[#161d52] font-bold uppercase text-center">
              Tanda Kasih (Amplop Digital)
            </h3>
            <p class="text-[11px] text-slate-600 text-center leading-relaxed">
              Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda ingin memberi tanda kasih, dapat melalui:
            </p>

            ${t.accounts.map(acc => `
              <div class="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                <div>
                  <span class="text-[10px] font-mono text-slate-400 block font-bold">${acc.bank}</span>
                  <span class="font-mono text-xs font-bold text-[#2f3b90]">${acc.number}</span>
                  <span class="text-[10px] text-slate-600 block">a.n ${acc.name}</span>
                </div>
                <button onclick="navigator.clipboard.writeText('${acc.number}'); showToast('📋 Nomor rekening ${acc.bank} berhasil disalin!');" class="btn-pop-white py-1.5 px-3 rounded-lg text-[10px] font-bold">
                  Salin
                </button>
              </div>
            `).join('')}
          </div>

        </div>
      `;
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.simulator = new InvitationSimulator();
});
