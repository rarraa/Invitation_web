/**
 * BLUEVITE - SUPER ADMIN MASTER DASHBOARD LOGIC
 * Business metrics, Order workflow management, Template catalog CRUD, & DNS Tracker
 */

class AdminDashboard {
  constructor() {
    this.orders = [...ADMIN_ORDERS];
    this.templates = [...INVITATION_TEMPLATES];
    this.metrics = { ...ADMIN_METRICS };

    this.domains = [
      { domain: "rayhan-aisyah.com", client: "Muhammad Rayhan & Aisyah", status: "Active (SSL Secured)", target: "cname.bluevite.id", expiry: "2027-11-20" },
      { domain: "kevinjessicawedding.com", client: "Kevin Alexander & Jessica", status: "Active (SSL Secured)", target: "cname.bluevite.id", expiry: "2027-12-12" },
      { domain: "dimasnadialove.com", client: "Dimas Prasetyo & Nadia", status: "Pending DNS Verification", target: "cname.bluevite.id", expiry: "2027-10-18" }
    ];

    this.init();
  }

  init() {
    this.renderOrdersTable();
    this.renderTemplatesTable();
    this.renderDomainsTable();
    this.bindEvents();
    lucide.createIcons();
  }

  bindEvents() {
    // Navigation Tabs
    const tabs = document.querySelectorAll(".admin-nav-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-tab");
        tabs.forEach(t => {
          t.classList.remove("bg-yellow-400", "text-black", "border-black");
          t.classList.add("text-slate-300", "hover:bg-white/10");
        });
        tab.classList.add("bg-yellow-400", "text-black", "border-black");
        tab.classList.remove("text-slate-300", "hover:bg-white/10");

        document.querySelectorAll(".admin-section-pane").forEach(pane => {
          pane.classList.add("hidden");
        });
        const activePane = document.getElementById(`admin-pane-${target}`);
        if (activePane) activePane.classList.remove("hidden");
        lucide.createIcons();
      });
    });

    // Add Order Form
    const addOrderForm = document.getElementById("admin-add-order-form");
    if (addOrderForm) {
      addOrderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const clientName = addOrderForm.client_name.value.trim();
        const phone = addOrderForm.client_phone.value.trim();
        const template = addOrderForm.order_template.value;
        const pkg = addOrderForm.order_package.value;
        const total = parseInt(addOrderForm.order_total.value, 10) || 129000;

        this.orders.unshift({
          orderId: `BLV-2026-0${Math.floor(1000 + Math.random() * 9000)}`,
          clientName: clientName,
          phone: phone,
          template: template,
          package: pkg,
          addons: [],
          total: total,
          paymentStatus: "Lunas",
          workflowStatus: "Live",
          slug: clientName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          domain: "-",
          orderDate: new Date().toISOString().split('T')[0]
        });

        this.renderOrdersTable();
        addOrderForm.reset();
        showToast(`🎉 Pesan baru untuk "${clientName}" berhasil dibuat & langsung berstatus LIVE!`);
      });
    }

    // Add Template Form
    const addTemplateForm = document.getElementById("admin-add-template-form");
    if (addTemplateForm) {
      addTemplateForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = addTemplateForm.template_title.value.trim();
        const category = addTemplateForm.template_category.value;
        const price = parseInt(addTemplateForm.template_price.value, 10) || 99000;

        this.templates.unshift({
          id: `custom-${Date.now()}`,
          category: category,
          categoryLabel: category.toUpperCase(),
          title: title,
          slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          price: price,
          priceOriginal: price * 1.6,
          rating: 5.0,
          reviewsCount: 1,
          badge: "NEW",
          isPopular: true,
          thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
          coverImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
          themeColor: "#0f2042",
          bride: "Pengantin Wanita",
          groom: "Pengantin Pria",
          eventDate: "2026-12-30T08:00:00",
          eventDateFormatted: "Rabu, 30 Desember 2026",
          akadTime: "08:00 - 10:00 WIB",
          resepsiTime: "11:00 - 14:00 WIB",
          locationName: "Grand Ballroom",
          locationAddress: "Jakarta",
          mapsUrl: "https://maps.google.com",
          storyTimeline: [],
          accounts: [],
          features: ["Smart RSVP", "Backsound Musik", "Google Maps"]
        });

        this.renderTemplatesTable();
        addTemplateForm.reset();
        showToast(`✨ Template baru "${title}" berhasil ditambahkan ke katalog!`);
      });
    }
  }

  toggleOrderStatus(orderId) {
    const order = this.orders.find(o => o.orderId === orderId);
    if (!order) return;

    if (order.workflowStatus === "Draft") {
      order.workflowStatus = "In Progress";
    } else if (order.workflowStatus === "In Progress") {
      order.workflowStatus = "Live";
      order.paymentStatus = "Lunas";
    } else {
      order.workflowStatus = "Draft";
    }

    this.renderOrdersTable();
    showToast(`🔄 Status pesanan ${order.orderId} diubah menjadi: ${order.workflowStatus}`);
  }

  contactClientWa(phone, clientName, slug) {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);

    const message = `Halo Kak ${clientName},\n\nTerima kasih telah memesan undangan digital di Bluevite.id! Website undangan Anda saat ini sudah *LIVE ONLINE* dan dapat diakses melalui link:\n👉 https://bluevite.id/v/${slug}\n\nKakak juga bisa login ke Smart Dashboard untuk mengelola nama tamu dan kirim broadcast WA. Ada yang bisa kami bantu?`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  deleteOrder(orderId) {
    this.orders = this.orders.filter(o => o.orderId !== orderId);
    this.renderOrdersTable();
    showToast(`🗑️ Pesanan ${orderId} berhasil dihapus.`);
  }

  renderOrdersTable() {
    const tbody = document.getElementById("admin-orders-tbody");
    if (!tbody) return;

    tbody.innerHTML = this.orders.map(o => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-left">
        <td class="p-3.5 font-mono text-xs font-bold text-blue-700">${o.orderId}</td>
        <td class="p-3.5">
          <div class="font-bold text-xs text-slate-900">${o.clientName}</div>
          <div class="text-[10px] text-slate-400 font-mono">${o.phone}</div>
        </td>
        <td class="p-3.5">
          <div class="text-xs font-bold text-slate-800">${o.template}</div>
          <span class="text-[10px] text-slate-500 font-mono">${o.package}</span>
        </td>
        <td class="p-3.5 font-mono text-xs font-bold text-slate-900">
          Rp ${o.total.toLocaleString('id-ID')}
        </td>
        <td class="p-3.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${
            o.paymentStatus === 'Lunas' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
            (o.paymentStatus === 'DP 50%' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-rose-100 text-rose-800 border border-rose-300')
          }">
            ${o.paymentStatus}
          </span>
        </td>
        <td class="p-3.5">
          <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            o.workflowStatus === 'Live' ? 'bg-emerald-500 text-white' :
            (o.workflowStatus === 'In Progress' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white')
          }">
            ${o.workflowStatus === 'Live' ? '🟢 LIVE' : o.workflowStatus}
          </span>
        </td>
        <td class="p-3.5">
          <div class="flex items-center gap-1.5">
            <button onclick="window.adminDash.toggleOrderStatus('${o.orderId}')" class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition" title="Ganti Status">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.adminDash.contactClientWa('${o.phone}', '${o.clientName}', '${o.slug}')" class="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition" title="Chat WhatsApp Klien">
              <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.adminDash.deleteOrder('${o.orderId}')" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition" title="Hapus">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    lucide.createIcons();
  }

  renderTemplatesTable() {
    const tbody = document.getElementById("admin-templates-tbody");
    if (!tbody) return;

    tbody.innerHTML = this.templates.map(t => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-left">
        <td class="p-3.5">
          <div class="font-bold text-xs text-slate-900">${t.title}</div>
          <span class="text-[10px] text-slate-400 font-mono">${t.categoryLabel}</span>
        </td>
        <td class="p-3.5 font-mono text-xs font-bold text-blue-700">
          Rp ${t.price.toLocaleString('id-ID')}
        </td>
        <td class="p-3.5">
          <span class="text-xs text-amber-500 font-bold flex items-center gap-1 font-mono">
            ★ ${t.rating} (${t.reviewsCount})
          </span>
        </td>
        <td class="p-3.5">
          ${t.badge ? `
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
              ${t.badge}
            </span>
          ` : '<span class="text-[10px] text-slate-400 font-mono">Standard</span>'}
        </td>
        <td class="p-3.5">
          <button onclick="showToast('✏️ Mode edit tema diaktifkan.')" class="btn-pop-dark py-1 px-2.5 rounded-lg text-[11px] font-bold">
            Edit
          </button>
        </td>
      </tr>
    `).join('');

    lucide.createIcons();
  }

  renderDomainsTable() {
    const tbody = document.getElementById("admin-domains-tbody");
    if (!tbody) return;

    tbody.innerHTML = this.domains.map(d => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-left">
        <td class="p-3.5 font-mono text-xs font-bold text-slate-900">
          🌐 ${d.domain}
        </td>
        <td class="p-3.5 text-xs text-slate-700">${d.client}</td>
        <td class="p-3.5 font-mono text-xs text-slate-500">${d.target}</td>
        <td class="p-3.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${
            d.status.includes('Active') ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
          }">
            ${d.status}
          </span>
        </td>
        <td class="p-3.5 font-mono text-xs text-slate-400">${d.expiry}</td>
      </tr>
    `).join('');

    lucide.createIcons();
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

window.addEventListener("DOMContentLoaded", () => {
  window.adminDash = new AdminDashboard();
});
