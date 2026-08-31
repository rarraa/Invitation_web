/**
 * BLUEVITE - PUBLIC SALES APP LOGIC (#2F3B90 Ultramarine Luxury Edition)
 */

document.addEventListener("DOMContentLoaded", () => {
  initPublicApp();
});

let currentCategory = "all";
let searchQuery = "";
let sortBy = "popular";
let selectedPackageId = "pkg-premium";
let selectedAddonIds = new Set(["addon-priority"]);

function initPublicApp() {
  renderCatalog();
  renderPackages();
  renderAddons();
  updateOrderCalculator();
  initStatsCounters();
  bindAppEvents();
  lucide.createIcons();
}

function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  let list = [...INVITATION_TEMPLATES];

  if (currentCategory !== "all") {
    list = list.filter(t => t.category === currentCategory);
  }

  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    list = list.filter(t => t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q) || t.bride.toLowerCase().includes(q));
  }

  if (sortBy === "price-low") {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-white/80 font-mono text-sm bg-[#161d52]/60 rounded-3xl border border-white/20">
        <i data-lucide="sparkles" class="w-8 h-8 text-amber-300 mx-auto mb-2"></i>
        <span>Tidak ditemukan tema yang cocok dengan pencarian Anda.</span>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = list.map(t => `
    <div class="pop-card bg-white text-slate-900 rounded-3xl overflow-hidden flex flex-col justify-between group">
      
      <!-- Thumbnail with Overlay -->
      <div class="relative h-64 overflow-hidden bg-slate-950">
        <img src="${t.thumbnail}" alt="${t.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-mono font-bold bg-[#2f3b90] text-white px-2.5 py-1 rounded-md shadow border border-white/40">
              ${t.categoryLabel}
            </span>
            ${t.badge ? `
              <span class="text-[10px] font-mono font-bold bg-amber-400 text-black px-2.5 py-1 rounded-md shadow border border-black">
                ${t.badge}
              </span>
            ` : ''}
          </div>

          <div>
            <span class="text-xs text-amber-300 font-mono font-bold flex items-center gap-1">
              ★ ${t.rating} (${t.reviewsCount} ulasan)
            </span>
            <h3 class="font-serif-luxury text-2xl text-white font-bold tracking-wide">${t.title}</h3>
          </div>
        </div>
      </div>

      <!-- Card Details -->
      <div class="p-6 flex flex-col justify-between flex-1 space-y-4 text-left">
        <p class="text-xs text-slate-600 leading-relaxed font-sans">${t.subtitle}</p>

        <!-- Features list -->
        <div class="space-y-1.5 text-xs text-slate-700 font-sans border-t border-slate-100 pt-3">
          ${t.features.slice(0, 3).map(f => `
            <div class="flex items-center gap-2">
              <span class="text-[#2f3b90] font-bold">✦</span>
              <span>${f}</span>
            </div>
          `).join('')}
        </div>

        <!-- Pricing & CTA -->
        <div class="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
          <div>
            <span class="text-[10px] text-slate-400 line-through font-mono">Rp ${t.priceOriginal.toLocaleString('id-ID')}</span>
            <div class="font-display text-2xl text-[#2f3b90] font-bold">Rp ${t.price.toLocaleString('id-ID')}</div>
          </div>

          <div class="flex gap-2">
            <button onclick="window.simulator.open('${t.id}')" class="btn-pop-white py-2 px-3 rounded-xl text-xs font-bold" title="Lihat Live Demo">
              <i data-lucide="eye" class="w-4 h-4"></i>
              <span>Demo</span>
            </button>
            <button onclick="orderSingleTemplate('${t.id}')" class="btn-pop-dark py-2 px-3 rounded-xl text-xs font-bold">
              Pesan
            </button>
          </div>
        </div>
      </div>

    </div>
  `).join('');

  lucide.createIcons();
}

function renderPackages() {
  const container = document.getElementById("packages-grid");
  if (!container) return;

  container.innerHTML = PACKAGES_DATA.map(pkg => {
    const isSelected = pkg.id === selectedPackageId;
    return `
      <div onclick="selectPackage('${pkg.id}')" class="cursor-pointer transition-all duration-300 ${
        pkg.isFeatured ? 'pop-card bg-white text-slate-900 border-4 border-amber-400 shadow-2xl relative scale-105' : 'pop-card bg-white text-slate-900'
      } rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-left">
        
        <div>
          ${pkg.badge ? `
            <span class="inline-block px-3 py-1 bg-amber-400 text-black text-[10px] font-mono font-bold uppercase rounded-full border border-black shadow mb-3">
              ${pkg.badge}
            </span>
          ` : '<span class="inline-block h-6 mb-3"></span>'}

          <h3 class="font-serif-luxury text-3xl font-bold text-[#161d52]">${pkg.name}</h3>
          <p class="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">${pkg.description}</p>

          <div class="mb-6">
            <span class="text-xs text-slate-400 line-through font-mono">Rp ${pkg.priceOriginal.toLocaleString('id-ID')}</span>
            <div class="font-display text-4xl text-[#2f3b90] font-bold">Rp ${pkg.price.toLocaleString('id-ID')}</div>
          </div>

          <div class="space-y-2.5 text-xs text-slate-700 font-sans border-t border-slate-100 pt-4">
            ${pkg.features.map(f => `
              <div class="flex items-start gap-2">
                <i data-lucide="check-circle" class="w-4 h-4 text-[#2f3b90] shrink-0 mt-0.5"></i>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <button class="w-full mt-6 ${isSelected ? 'btn-pop-dark' : 'btn-pop-white'} py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
          ${isSelected ? '✓ Paket Terpilih' : 'Pilih Paket Ini'}
        </button>

      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function selectPackage(pkgId) {
  selectedPackageId = pkgId;
  renderPackages();
  updateOrderCalculator();
}

function renderAddons() {
  const container = document.getElementById("addons-list");
  if (!container) return;

  container.innerHTML = ADDONS_DATA.map(addon => {
    const isChecked = selectedAddonIds.has(addon.id);
    return `
      <label class="flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
        isChecked ? 'bg-blue-50 border-[#2f3b90]' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
      }">
        <div class="flex items-center gap-3 text-left">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleAddon('${addon.id}')" class="w-4 h-4 text-[#2f3b90] rounded focus:ring-0 cursor-pointer">
          <div>
            <span class="font-bold text-xs text-slate-900 block">${addon.name}</span>
            <span class="text-[11px] text-slate-500 font-sans">${addon.desc}</span>
          </div>
        </div>
        <span class="font-display text-sm font-bold text-[#2f3b90] shrink-0 ml-4 font-mono">
          +Rp ${addon.price.toLocaleString('id-ID')}
        </span>
      </label>
    `;
  }).join('');
}

function toggleAddon(addonId) {
  if (selectedAddonIds.has(addonId)) {
    selectedAddonIds.delete(addonId);
  } else {
    selectedAddonIds.add(addonId);
  }
  renderAddons();
  updateOrderCalculator();
}

function updateOrderCalculator() {
  const pkg = PACKAGES_DATA.find(p => p.id === selectedPackageId) || PACKAGES_DATA[1];
  let total = pkg.price;

  selectedAddonIds.forEach(id => {
    const a = ADDONS_DATA.find(item => item.id === id);
    if (a) total += a.price;
  });

  const nameEl = document.getElementById("calc-selected-pkg-name");
  const countEl = document.getElementById("calc-addons-count");
  const priceEl = document.getElementById("calc-total-price");

  if (nameEl) nameEl.textContent = pkg.name;
  if (countEl) countEl.textContent = `${selectedAddonIds.size} Fitur Tambahan`;
  if (priceEl) priceEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;

  const checkoutBtn = document.getElementById("btn-calc-checkout-wa");
  if (checkoutBtn) {
    checkoutBtn.onclick = () => checkoutViaWhatsApp(pkg, total);
  }
}

function checkoutViaWhatsApp(pkg, total) {
  const addonsArr = Array.from(selectedAddonIds).map(id => {
    const a = ADDONS_DATA.find(item => item.id === id);
    return a ? `• ${a.name} (+Rp ${a.price.toLocaleString('id-ID')})` : '';
  }).filter(Boolean);

  const message = `Halo Admin Bluevite.id,\n\nSaya ingin memesan Undangan Digital Website dengan rincian berikut:\n\n💍 *Paket:* ${pkg.name} (Rp ${pkg.price.toLocaleString('id-ID')})\n✨ *Fitur Tambahan (Add-ons):*\n${addonsArr.length > 0 ? addonsArr.join('\n') : '- Tidak ada'}\n\n💰 *Total Biaya:* Rp ${total.toLocaleString('id-ID')}\n\nMohon dibantu proses pembuatannya ya, terima kasih!`;

  const url = `https://wa.me/6282223551205?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

function orderSingleTemplate(templateId) {
  const t = INVITATION_TEMPLATES.find(item => item.id === templateId) || INVITATION_TEMPLATES[0];
  const message = `Halo Admin Bluevite.id,\n\nSaya tertarik untuk memesan tema undangan:\n*${t.title}* (${t.categoryLabel})\nHarga Promo: Rp ${t.price.toLocaleString('id-ID')}\n\nBisa dibantu untuk konsultasi pengisian datanya?`;

  const url = `https://wa.me/6282223551205?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

function initStatsCounters() {
  const counters = document.querySelectorAll(".stats-counter-num");
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute("data-target"), 10) || 0;
    let count = 0;
    const speed = target / 50;

    const update = () => {
      count += speed;
      if (count < target) {
        counter.innerText = Math.floor(count).toLocaleString('id-ID') + "+";
        requestAnimationFrame(update);
      } else {
        counter.innerText = target.toLocaleString('id-ID') + "+";
      }
    };
    update();
  });
}

function bindAppEvents() {
  // Category tabs
  const tabs = document.querySelectorAll(".catalog-tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      currentCategory = tab.getAttribute("data-category");
      tabs.forEach(t => {
        t.classList.remove("bg-white", "text-[#2f3b90]", "border-2", "border-white");
        t.classList.add("bg-white/10", "text-white");
      });
      tab.classList.add("bg-white", "text-[#2f3b90]", "border-2", "border-white");
      tab.classList.remove("bg-white/10", "text-white");
      renderCatalog();
    });
  });

  // Search input
  const searchInput = document.getElementById("catalog-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderCatalog();
    });
  }

  // Sort select
  const sortSelect = document.getElementById("catalog-sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortBy = e.target.value;
      renderCatalog();
    });
  }

  // FAQ Accordions
  const faqBtns = document.querySelectorAll(".faq-accordion-btn");
  faqBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector(".faq-icon");
      const isHidden = content.classList.contains("hidden");

      document.querySelectorAll(".faq-content").forEach(c => c.classList.add("hidden"));
      document.querySelectorAll(".faq-icon").forEach(i => i.classList.remove("rotate-180"));

      if (isHidden) {
        content.classList.remove("hidden");
        if (icon) icon.classList.add("rotate-180");
      }
    });
  });
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
