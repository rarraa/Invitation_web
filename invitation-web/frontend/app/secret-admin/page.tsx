"use client";

import { useState, useEffect } from "react";
import { loginAdmin, logoutAdmin, getCurrentUser } from "@/lib/auth";
import {
  ShieldCheck,
  LogOut,
  DollarSign,
  Sparkles,
  Users,
  TrendingUp,
  ShoppingBag,
  LayoutGrid,
  Globe,
  RefreshCw,
  MessageCircle,
  Trash2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------
type PaymentStatus = "Lunas" | "DP 50%" | "Pending";
type WorkflowStatus = "Draft" | "In Progress" | "Live";

type Order = {
  orderId: string;
  clientName: string;
  phone: string;
  template: string;
  package: string;
  total: number;
  paymentStatus: PaymentStatus;
  workflowStatus: WorkflowStatus;
  slug: string;
  orderDate: string;
};

type Template = {
  id: string;
  title: string;
  categoryLabel: string;
  price: number;
  rating: number;
  reviewsCount: number;
  badge: string | null;
};

type Domain = { domain: string; client: string; status: string; target: string; expiry: string };
type Toast = { id: number; message: string };
type TabId = "orders" | "templates" | "domains";

// ---------------------------------------------------------------------------
// DATA (sama dengan dashboard-admin, tanpa nilai default login)
// ---------------------------------------------------------------------------
const INITIAL_ORDERS: Order[] = [
  { orderId: "BLV-2026-0891", clientName: "Muhammad Rayhan & Aisyah", phone: "081234567890", template: "The Ultramarine Royal Suite", package: "Paket Premium Royal Suite", total: 179000, paymentStatus: "Lunas", workflowStatus: "Live", slug: "rayhan-aisyah", orderDate: "2026-08-28" },
  { orderId: "BLV-2026-0892", clientName: "Kevin Alexander & Jessica", phone: "085712345678", template: "Emerald Botanical Glasshouse", package: "Paket Eksklusif Custom Domain", total: 424000, paymentStatus: "Lunas", workflowStatus: "Live", slug: "kevin-jessica", orderDate: "2026-08-27" },
  { orderId: "BLV-2026-0893", clientName: "Fahri Al-Farizi & Fathiya", phone: "081398765432", template: "Pearl White Islamic Elegance", package: "Paket Basic", total: 99000, paymentStatus: "DP 50%", workflowStatus: "In Progress", slug: "fahri-fathiya", orderDate: "2026-08-29" },
  { orderId: "BLV-2026-0894", clientName: "Alyssa Valerie (Sweet 17)", phone: "089612349876", template: "Celestial Euphoria Birthday", package: "Paket Premium", total: 179000, paymentStatus: "Pending", workflowStatus: "Draft", slug: "alyssa-sweet17", orderDate: "2026-08-29" },
];

const INITIAL_TEMPLATES: Template[] = [
  { id: "royal-ultramarine-01", title: "The Ultramarine Royal Suite", categoryLabel: "Royal Modern Wedding", price: 129000, rating: 5.0, reviewsCount: 142, badge: "✦ BEST SELLER" },
  { id: "pearl-syari-02", title: "Pearl White Islamic Elegance", categoryLabel: "Wedding Syar'i", price: 99000, rating: 4.9, reviewsCount: 98, badge: "FAVORITE" },
  { id: "botanical-luxury-03", title: "Emerald Botanical Glasshouse", categoryLabel: "Rustic Botanical", price: 139000, rating: 5.0, reviewsCount: 115, badge: "✦ LUXURY" },
  { id: "sweet-birthday-04", title: "Celestial Euphoria Birthday", categoryLabel: "Sweet 17 / Birthday", price: 79000, rating: 4.8, reviewsCount: 64, badge: "TRENDING" },
];

const INITIAL_DOMAINS: Domain[] = [
  { domain: "rayhan-aisyah.com", client: "Muhammad Rayhan & Aisyah", status: "Active (SSL Secured)", target: "cname.bluevite.id", expiry: "2027-11-20" },
  { domain: "kevinjessicawedding.com", client: "Kevin Alexander & Jessica", status: "Active (SSL Secured)", target: "cname.bluevite.id", expiry: "2027-12-12" },
  { domain: "dimasnadialove.com", client: "Dimas Prasetyo & Nadia", status: "Pending DNS Verification", target: "cname.bluevite.id", expiry: "2027-10-18" },
];

const TEMPLATE_CHOICES = ["Pearl White Islamic Suite", "Emerald Botanical Luxury", "Terracotta Sunset Boho", "Y2K Pop Birthday Fiesta"];
const PACKAGE_CHOICES = [
  { value: "Paket Basic", label: "Paket Basic (Rp 79k)", total: 79000 },
  { value: "Paket Premium", label: "Paket Premium (Rp 129k)", total: 129000 },
  { value: "Paket Eksklusif Custom Domain", label: "Paket Eksklusif (Rp 249k)", total: 249000 },
];

function paymentBadgeClass(status: PaymentStatus) {
  if (status === "Lunas") return "bg-emerald-100 text-emerald-800 border border-emerald-300";
  if (status === "DP 50%") return "bg-amber-100 text-amber-800 border border-amber-300";
  return "bg-rose-100 text-rose-800 border border-rose-300";
}
function workflowBadgeClass(status: WorkflowStatus) {
  if (status === "Live") return "bg-emerald-500 text-white";
  if (status === "In Progress") return "bg-blue-600 text-white";
  return "bg-slate-600 text-white";
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="bg-slate-950 text-white text-xs font-mono px-4 py-3 rounded-xl border border-white/10 shadow-xl">
          {t.message}
        </div>
      ))}
    </div>
  );
}

function KpiCard({ label, value, sub, icon, valueClass = "text-slate-950" }: { label: string; value: string; sub: string; icon: React.ReactNode; valueClass?: string }) {
  return (
    <div className="pop-card bg-white p-5 rounded-2xl">
      <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono font-bold mb-1">
        <span>{label}</span>
        {icon}
      </div>
      <div className={`font-impact text-3xl ${valueClass}`}>{value}</div>
      <span className="text-[10px] text-slate-500 font-mono">{sub}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export default function SecretAdminPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Saat halaman dimuat, cek dulu apakah sudah ada sesi login valid
  // (misalnya user refresh halaman setelah login sebelumnya).
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user) setIsLoggedIn(true);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const [activeTab, setActiveTab] = useState<TabId>("orders");
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [templates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [domains] = useState<Domain[]>(INITIAL_DOMAINS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [orderTemplate, setOrderTemplate] = useState(TEMPLATE_CHOICES[0]);
  const [orderPackage, setOrderPackage] = useState(PACKAGE_CHOICES[1].value);

  function showToast(message: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    const result = await loginAdmin(email, password);

    setLoggingIn(false);

    if (result.success) {
      setIsLoggedIn(true);
      showToast("🔓 Login Berhasil! Selamat datang di Master Control Panel.");
    } else {
      setLoginError(result.message);
    }
  }

  async function handleLogout() {
    await logoutAdmin();
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setActiveTab("orders");
    showToast("🔒 Anda telah keluar dari Master Admin.");
  }

  function handleAddOrder(e: React.FormEvent) {
    e.preventDefault();
    const name = clientName.trim();
    if (!name) return;
    const pkg = PACKAGE_CHOICES.find((p) => p.value === orderPackage);
    const newOrder: Order = {
      orderId: `BLV-2026-0${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: name,
      phone: clientPhone.trim(),
      template: orderTemplate,
      package: orderPackage,
      total: pkg?.total ?? 129000,
      paymentStatus: "Lunas",
      workflowStatus: "Live",
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      orderDate: new Date().toISOString().split("T")[0],
    };
    setOrders((prev) => [newOrder, ...prev]);
    setClientName("");
    setClientPhone("");
    showToast(`🎉 Pesanan baru "${name}" tersimpan & langsung LIVE!`);
  }

  function toggleOrderStatus(orderId: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId !== orderId) return o;
        let next: WorkflowStatus = "Draft";
        if (o.workflowStatus === "Draft") next = "In Progress";
        else if (o.workflowStatus === "In Progress") next = "Live";
        return { ...o, workflowStatus: next, paymentStatus: next === "Live" ? "Lunas" : o.paymentStatus };
      })
    );
    showToast(`🔄 Status pesanan ${orderId} diubah.`);
  }

  function contactClient(phone: string, name: string, slug: string) {
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.substring(1);
    const message = `Halo Kak ${name},\n\nTerima kasih telah memesan undangan digital di Bluevite.id! Website undangan Anda saat ini sudah *LIVE ONLINE* dan dapat diakses melalui link:\n👉 https://bluevite.id/v/${slug}\n\nKakak juga bisa login ke Smart Dashboard untuk mengelola nama tamu dan kirim broadcast WA. Ada yang bisa kami bantu?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  }

  function deleteOrderItem(orderId: string) {
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    showToast(`🗑️ Pesanan ${orderId} berhasil dihapus.`);
  }

  const NAV_TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "orders", label: "Manajemen Pesanan (Pipeline)", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: "templates", label: "Katalog Template & Harga", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: "domains", label: "Custom Domain & DNS", icon: <Globe className="w-3.5 h-3.5" /> },
  ];

  // ============================== VIEW 0: CEK SESI ==============================
  if (checkingSession) {
    return (
      <div className="bg-[#0a192f] text-white min-h-screen flex items-center justify-center">
        <p className="text-xs font-mono text-slate-400">Memeriksa sesi login...</p>
      </div>
    );
  }

  // ============================== VIEW 1: LOGIN GATE ==============================
  if (!isLoggedIn) {
    return (
      <div className="bg-[#0a192f] text-white selection:bg-yellow-400 selection:text-black min-h-screen flex items-center justify-center p-4">
        <div className="pop-card bg-white text-slate-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 text-yellow-400 border-2 border-white flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <span className="inline-block px-3 py-0.5 bg-yellow-400 text-black text-[10px] font-mono font-bold uppercase rounded-md border border-black mb-2 shadow">
            PRIVATE ADMIN GATE
          </span>
          <h2 className="font-display text-4xl text-slate-950">Master Control Panel</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Area terbatas khusus pengelola sistem Bluevite.id. Masukkan kredensial administrator.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 font-mono mb-1">Email Admin:</label>
              <input
                type="email"
                placeholder="admin@bluevite.id"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 font-mono mb-1">Password:</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900"
              />
            </div>

            {loginError && <p className="text-xs text-rose-600 font-mono">❌ {loginError}</p>}

            <button
              type="submit"
              disabled={loggingIn}
              className="btn-pop-dark w-full py-3 rounded-xl text-xs font-bold uppercase font-impact tracking-wider disabled:opacity-50"
            >
              {loggingIn ? "Memproses..." : "Masuk sebagai Super Admin"}
            </button>
          </form>
        </div>
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  // ============================== VIEW 2: DASHBOARD ==============================
  return (
    <div className="bg-[#0a192f] text-white selection:bg-yellow-400 selection:text-black min-h-screen flex flex-col justify-between">
      <header className="bg-[#0f2042] border-b-2 border-black sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 text-black font-bold flex items-center justify-center rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-impact text-xl tracking-wider text-white">
                BLUEVITE<span className="text-yellow-400">.ADMIN</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-blue-300 block -mt-1 uppercase font-bold">Master Control Panel</span>
            </div>
          </div>

          <button onClick={handleLogout} className="btn-pop-dark py-2 px-3 rounded-xl text-xs font-bold font-mono text-rose-400 hover:text-white">
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Admin</span>
          </button>
        </div>

        <div className="bg-[#162a56] border-t border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none font-mono text-xs">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition ${
                  activeTab === tab.id ? "bg-yellow-400 text-black border-2 border-black shadow" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-left">
          <KpiCard label="PENDAPATAN BULAN INI" value="Rp 28.450.000" sub="▲ +24% vs bulan lalu" icon={<DollarSign className="w-4 h-4 text-emerald-600" />} valueClass="text-emerald-600" />
          <KpiCard label="UNDANGAN AKTIF (LIVE)" value="142 Website" sub="Tersebar online" icon={<Sparkles className="w-4 h-4 text-blue-600" />} valueClass="text-blue-700" />
          <KpiCard label="TOTAL TAMU TERKELOLA" value="48.920" sub="Di database sistem" icon={<Users className="w-4 h-4 text-purple-600" />} valueClass="text-purple-600" />
          <KpiCard label="CONVERSION RATE" value="18.4%" sub="Trafik ke pesanan" icon={<TrendingUp className="w-4 h-4 text-amber-500" />} valueClass="text-amber-600" />
        </div>

        {activeTab === "orders" && (
          <div className="pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-left shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
              <div>
                <h3 className="font-display text-3xl text-slate-950">Daftar Pesanan Masuk (Order Pipeline)</h3>
                <p className="text-xs text-slate-600">Kelola status pesanan, pembayaran, dan aktivasi link undangan klien.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Database Sync Active</span>
            </div>

            <form onSubmit={handleAddOrder} className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl mb-6">
              <span className="text-xs font-bold text-blue-900 block mb-3">➕ Buat Pesanan Klien Baru ke Database:</span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <input
                  type="text"
                  placeholder="Nama Klien / Pengantin"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Nomor WhatsApp"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <select value={orderTemplate} onChange={(e) => setOrderTemplate(e.target.value)} className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none">
                  {TEMPLATE_CHOICES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select value={orderPackage} onChange={(e) => setOrderPackage(e.target.value)} className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none">
                  {PACKAGE_CHOICES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <button type="submit" className="btn-pop-yellow py-2 px-4 rounded-xl text-xs font-bold">
                  Simpan &amp; Aktifkan
                </button>
              </div>
            </form>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono text-slate-600 uppercase">
                  <tr>
                    <th className="p-3.5">ID Order</th>
                    <th className="p-3.5">Nama Klien</th>
                    <th className="p-3.5">Tema &amp; Paket</th>
                    <th className="p-3.5">Total Biaya</th>
                    <th className="p-3.5">Pembayaran</th>
                    <th className="p-3.5">Workflow</th>
                    <th className="p-3.5">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-mono text-xs">
                        Belum ada data pesanan.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.orderId} className="hover:bg-slate-50 transition text-left">
                        <td className="p-3.5 font-mono text-xs font-bold text-blue-700">{o.orderId}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-xs text-slate-900">{o.clientName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{o.phone}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-xs font-bold text-slate-800">{o.template}</div>
                          <span className="text-[10px] text-slate-500 font-mono">{o.package}</span>
                        </td>
                        <td className="p-3.5 font-mono text-xs font-bold text-slate-900">Rp {o.total.toLocaleString("id-ID")}</td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${paymentBadgeClass(o.paymentStatus)}`}>{o.paymentStatus}</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${workflowBadgeClass(o.workflowStatus)}`}>
                            {o.workflowStatus === "Live" ? "🟢 LIVE" : o.workflowStatus}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => toggleOrderStatus(o.orderId)} title="Ganti Status" className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition">
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => contactClient(o.phone, o.clientName, o.slug)} title="Chat WhatsApp Klien" className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition">
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteOrderItem(o.orderId)} title="Hapus" className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div className="pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-left shadow-xl">
            <h3 className="font-display text-3xl text-slate-950 mb-1">Manajemen Katalog Tema &amp; Harga</h3>
            <p className="text-xs text-slate-600 mb-6">Daftar template aktif yang tampil di website penjualan publik.</p>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-[10px] font-mono text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Nama Template</th>
                    <th className="p-3.5">Harga Aktif</th>
                    <th className="p-3.5">Rating &amp; Ulasan</th>
                    <th className="p-3.5">Badge Promo</th>
                    <th className="p-3.5">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templates.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition text-left">
                      <td className="p-3.5">
                        <div className="font-bold text-xs text-slate-900">{t.title}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{t.categoryLabel}</span>
                      </td>
                      <td className="p-3.5 font-mono text-xs font-bold text-blue-700">Rp {t.price.toLocaleString("id-ID")}</td>
                      <td className="p-3.5">
                        <span className="text-xs text-amber-500 font-bold flex items-center gap-1 font-mono">★ {t.rating} ({t.reviewsCount})</span>
                      </td>
                      <td className="p-3.5">
                        {t.badge ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">{t.badge}</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Standard</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <button onClick={() => showToast("✏️ Form edit tema diaktifkan.")} className="btn-pop-dark py-1 px-2.5 rounded-lg text-[11px] font-bold">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "domains" && (
          <div className="pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-left shadow-xl">
            <h3 className="font-display text-3xl text-slate-950 mb-1">Custom Domain &amp; DNS Management</h3>
            <p className="text-xs text-slate-600 mb-6">Pantau status propagasi domain klien dan sertifikat SSL otomatis.</p>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-[10px] font-mono text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Domain Klien</th>
                    <th className="p-3.5">Nama Klien</th>
                    <th className="p-3.5">Target CNAME</th>
                    <th className="p-3.5">Status DNS / SSL</th>
                    <th className="p-3.5">Tanggal Berakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {domains.map((d) => (
                    <tr key={d.domain} className="hover:bg-slate-50 transition text-left">
                      <td className="p-3.5 font-mono text-xs font-bold text-slate-900">🌐 {d.domain}</td>
                      <td className="p-3.5 text-xs text-slate-700">{d.client}</td>
                      <td className="p-3.5 font-mono text-xs text-slate-500">{d.target}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.status.includes("Active") ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-xs text-slate-400">{d.expiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#09111e] border-t border-slate-800 py-4 text-center text-slate-500 font-mono text-xs">
        © 2026 BLUEVITE.ID Master Admin Portal • Protected Endpoint
      </footer>

      <ToastStack toasts={toasts} />
    </div>
  );
}

/**
 * ✅ UPDATE: Login sekarang sudah pakai Laravel Sanctum (lihat lib/auth.ts).
 * Password di-hash bcrypt di database, dicek di server, sesi disimpan di
 * httpOnly cookie — bukan lagi dicek di JavaScript kayak sebelumnya.
 *
 * Sisa PR yang masih perlu dikerjakan:
 *
 * 1. Proteksi route di level Next.js — saat ini kalau orang tahu URL
 *    /secret-admin dan langsung buka, dia tetap akan lihat tampilan
 *    "checkingSession" sebentar sebelum redirect ke form login (karena
 *    getCurrentUser() akan return null kalau belum login). Ini sudah
 *    cukup aman untuk sekarang, tapi bisa lebih rapi dengan middleware.ts
 *    di Next.js untuk redirect otomatis di level server sebelum halaman
 *    ini bahkan dikirim ke browser.
 * 2. Ganti nama route dari "secret-admin" jadi sesuatu yang tidak
 *    menyiratkan keamanan berbasis "URL tersembunyi" — proteksi sebenarnya
 *    sekarang ada di backend (Laravel Sanctum), bukan di kerahasiaan nama
 *    folder/URL, jadi nama route apa pun sebenarnya sudah aman.
 * 3. Data orders/templates/domains di atas masih hardcode di file ini.
 *    Nanti perlu fetch dari API Laravel (Route::get('/api/orders', ...)
 *    dst.), sama seperti catatan di dashboard-pembeli/page.tsx.
 * 4. Terapkan pola yang sama (import dari lib/auth.ts) ke halaman
 *    /dashboard-admin dan /portal, yang saat ini login-nya MASIH
 *    hardcode di kode frontend dan belum aman.
 */