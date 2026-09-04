"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Shield,
  Smartphone,
  LayoutDashboard,
  Users,
  MessageSquare,
  QrCode,
  Heart,
  Settings,
  Copy,
  Send,
  Eye,
  CheckCircle,
  Utensils,
  UserPlus,
  Trash2,
  EyeOff,
} from "lucide-react";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------
type Guest = {
  id: number;
  name: string;
  group: string;
  phone: string;
  status: "Draft" | "Sudah Terkirim";
  opened: boolean;
  rsvp: "Hadir" | "Ragu-ragu" | "Belum Mengisi";
  count: number;
  checkin: boolean;
  checkinTime?: string;
};

type Wish = {
  id: number;
  name: string;
  message: string;
  time: string;
  status: "active" | "hidden";
  pinned: boolean;
};

type Toast = { id: number; message: string };

type TabId =
  | "overview"
  | "guests"
  | "broadcast"
  | "qrscanner"
  | "wishes"
  | "settings";

// ---------------------------------------------------------------------------
// INITIAL DATA (dulu ada di data.js / constructor client-dashboard.js)
// Nanti ini idealnya di-fetch dari API Laravel, lihat catatan di bawah komponen.
// ---------------------------------------------------------------------------
const INITIAL_CLIENT_DATA = {
  slug: "rayhan-aisyah",
  url: "https://bluevite.id/v/rayhan-aisyah",
  bride: "dr. Aisyah Humaira, Sp.A",
  groom: "Muhammad Rayhan, S.T",
  eventDate: "2026-11-20T08:00:00",
  eventDateFormatted: "Minggu, 20 November 2026",
  package: "Paket Premium",
  activeUntil: "20 Nov 2027",
  status: "LIVE ONLINE",
};

const INITIAL_GUESTS: Guest[] = [
  { id: 1, name: "Bpk. H. Sukirno & Ibu Hj. Marwah", group: "Keluarga", phone: "081234567890", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 3, checkin: false },
  { id: 2, name: "Dra. Siti Nurhaliza, M.Pd", group: "Kolega Kantor", phone: "085712345678", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 1, checkin: false },
  { id: 3, name: "Rian Hidayat & Partner", group: "Sahabat Kuliah", phone: "089612349876", status: "Sudah Terkirim", opened: false, rsvp: "Ragu-ragu", count: 0, checkin: false },
  { id: 4, name: "dr. Andika Pratama, Sp.PD", group: "VIP Guest", phone: "081398765432", status: "Draft", opened: false, rsvp: "Belum Mengisi", count: 0, checkin: false },
  { id: 5, name: "Ir. Bambang Trihatmodjo", group: "VIP Guest", phone: "081198765432", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 2, checkin: true, checkinTime: "08:15 WIB" },
  { id: 6, name: "Fathur Rahman, S.Kom", group: "Sahabat Kuliah", phone: "082188765432", status: "Draft", opened: false, rsvp: "Belum Mengisi", count: 0, checkin: false },
];

const INITIAL_WISHES: Wish[] = [
  { id: 1, name: "Budi Santoso & Keluarga", message: "Barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fii khair. Selamat menempuh hidup baru ya, semoga sakinah mawaddah warahmah!", time: "10 menit lalu", status: "active", pinned: true },
  { id: 2, name: "Dr. Farah Amelia", message: "Selamat untuk kedua mempelai! Semoga cinta dan kebahagiaan selalu menyertai perjalanan kalian.", time: "25 menit lalu", status: "active", pinned: false },
  { id: 3, name: "Rendra & Team Creative", message: "Happy wedding Rayhan & Aisyah! Lancar sampai hari H ya kawan!", time: "1 jam lalu", status: "active", pinned: false },
  { id: 4, name: "Spam User 99", message: "Halo promo pinjaman dana cepat hubungi 0899999", time: "2 jam lalu", status: "hidden", pinned: false },
];

const DEFAULT_WA_TEMPLATE =
  "Kepada Yth. *{nama_tamu}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:\n\n*Aisyah & Rayhan*\n📅 {tanggal_acara}\n📍 Hotel Mulia Senayan Jakarta\n\nBerikut tautan undangan digital personal Anda:\n👉 {link_undangan}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu berkenan hadir dan memberikan doa restu.\n\nTerima kasih.\n*Aisyah & Rayhan*";

const GROUP_OPTIONS = ["Keluarga", "Sahabat Kuliah", "Kolega Kantor", "VIP Guest"];

// ---------------------------------------------------------------------------
// SMALL REUSABLE PIECES
// ---------------------------------------------------------------------------
function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-slate-950 text-white text-xs font-mono px-4 py-3 rounded-xl border border-white/10 shadow-xl animate-in fade-in slide-in-from-bottom-2"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  valueClass = "text-slate-950",
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="pop-card bg-white p-4 rounded-2xl">
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
export default function DashboardPembeli() {
  const [clientData] = useState(INITIAL_CLIENT_DATA);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Guest list controls
  const [groupFilter, setGroupFilter] = useState("Semua");
  const [searchGuest, setSearchGuest] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestGroup, setNewGuestGroup] = useState(GROUP_OPTIONS[0]);
  const [newGuestPhone, setNewGuestPhone] = useState("");

  // WA broadcast
  const [waTemplate, setWaTemplate] = useState(DEFAULT_WA_TEMPLATE);

  // QR scanner
  const [qrInput, setQrInput] = useState("");
  const [qrResult, setQrResult] = useState<
    { found: true; guest: Guest } | { found: false } | null
  >(null);

  // Settings form (nilai lokal, disimpan saat submit)
  const [brideName, setBrideName] = useState(clientData.bride);
  const [groomName, setGroomName] = useState(clientData.groom);
  const [eventDate, setEventDate] = useState(clientData.eventDateFormatted);

  // Countdown H-berapa (dulu startCountdown())
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    const target = new Date(clientData.eventDate).getTime();
    const update = () => {
      const diff = target - Date.now();
      setDaysLeft(Math.floor(diff / (1000 * 60 * 60 * 24)));
    };
    update();
    const timer = setInterval(update, 60_000); // update tiap menit, cukup untuk hitung hari
    return () => clearInterval(timer);
  }, [clientData.eventDate]);

  function showToast(message: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  // --- derived stats (dulu renderStats()) ---
  const stats = useMemo(() => {
    const totalGuests = guests.length;
    const sentCount = guests.filter((g) => g.status === "Sudah Terkirim").length;
    const openedCount = guests.filter((g) => g.opened).length;
    const hadirGuests = guests.filter((g) => g.rsvp === "Hadir");
    const totalPorsi = hadirGuests.reduce((acc, g) => acc + (g.count || 1), 0);
    const checkedinCount = guests.filter((g) => g.checkin).length;
    return { totalGuests, sentCount, openedCount, hadirCount: hadirGuests.length, totalPorsi, checkedinCount };
  }, [guests]);

  // --- filtered guest list (dulu bagian atas renderGuestList()) ---
  const filteredGuests = useMemo(() => {
    let list = [...guests];
    if (groupFilter !== "Semua") {
      list = list.filter((g) => g.group === groupFilter);
    }
    const q = searchGuest.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) => g.name.toLowerCase().includes(q) || g.phone.includes(q)
      );
    }
    return list;
  }, [guests, groupFilter, searchGuest]);

  function generateCustomMessage(guest: Guest) {
    const personalLink = `${clientData.url}?to=${encodeURIComponent(guest.name)}`;
    return waTemplate
      .replaceAll("{nama_tamu}", guest.name)
      .replaceAll("{link_undangan}", personalLink)
      .replaceAll("{grup}", guest.group)
      .replaceAll("{tanggal_acara}", clientData.eventDateFormatted);
  }

  const waPreviewText = useMemo(() => {
    const sample = guests[0] ?? {
      name: "Bpk. H. Sukirno",
      group: "Keluarga",
    };
    return generateCustomMessage(sample as Guest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests, waTemplate]);

  function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    const name = newGuestName.trim();
    if (!name) return;

    const guest: Guest = {
      id: Date.now(),
      name,
      group: newGuestGroup,
      phone: newGuestPhone.trim() || "-",
      status: "Draft",
      opened: false,
      rsvp: "Belum Mengisi",
      count: 0,
      checkin: false,
    };
    setGuests((prev) => [guest, ...prev]);
    setNewGuestName("");
    setNewGuestPhone("");
    showToast(`✅ Tamu "${name}" berhasil ditambahkan!`);
  }

  function sendDirectWa(guestId: number) {
    const guest = guests.find((g) => g.id === guestId);
    if (!guest) return;
    const message = generateCustomMessage(guest);
    let cleanPhone = guest.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.substring(1);
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, status: "Sudah Terkirim" } : g))
    );
    showToast(`📲 Mengirim pesan undangan ke WhatsApp ${guest.name}`);
  }

  function copyPersonalWaText(guestId: number) {
    const guest = guests.find((g) => g.id === guestId);
    if (!guest) return;
    const message = generateCustomMessage(guest);
    navigator.clipboard?.writeText(message);
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, status: "Sudah Terkirim" } : g))
    );
    showToast(`📋 Pesan WhatsApp untuk "${guest.name}" berhasil disalin!`);
  }

  function copyPersonalLink(link: string, name: string) {
    navigator.clipboard?.writeText(link);
    showToast(`🔗 Tautan undangan untuk "${name}" berhasil disalin!`);
  }

  function deleteGuest(id: number) {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    showToast("🗑️ Tamu berhasil dihapus dari daftar.");
  }

  function simulateQrScan(code: string) {
    const guest = guests.find(
      (g) => g.id.toString() === code || g.name.toLowerCase().includes(code.toLowerCase())
    );
    if (guest) {
      const now = new Date();
      const checkinTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")} WIB`;
      const updated: Guest = {
        ...guest,
        checkin: true,
        rsvp: "Hadir",
        count: guest.count && guest.count > 0 ? guest.count : 2,
        checkinTime,
      };
      setGuests((prev) => prev.map((g) => (g.id === guest.id ? updated : g)));
      setQrResult({ found: true, guest: updated });
      showToast(`🎟️ Sukses Check-in: ${guest.name}`);
    } else {
      setQrResult({ found: false });
    }
  }

  function toggleWishStatus(id: number) {
    setWishes((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: w.status === "active" ? "hidden" : "active" } : w
      )
    );
    const wish = wishes.find((w) => w.id === id);
    if (wish) {
      showToast(
        wish.status === "active" ? "🚫 Ucapan disembunyikan" : "👁️ Ucapan ditampilkan di undangan"
      );
    }
  }

  function deleteWish(id: number) {
    setWishes((prev) => prev.filter((w) => w.id !== id));
    showToast("🗑️ Ucapan berhasil dihapus permanen.");
  }

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    // TODO: ganti dengan fetch PUT/POST ke Laravel API, lihat catatan di bawah
    showToast("💾 Pengaturan undangan berhasil disimpan & diperbarui secara live!");
  }

  const NAV_TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: "guests", label: "Kelola Daftar Tamu", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "broadcast", label: "Generator Sebar WA", icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "qrscanner", label: "Buku Tamu QR Scanner", icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: "wishes", label: "Moderasi Ucapan", icon: <Heart className="w-3.5 h-3.5" /> },
    { id: "settings", label: "Edit Konten Undangan", icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-[#0a192f] text-white selection:bg-yellow-400 selection:text-black min-h-screen">
      {/* TOP HEADER */}
      <header className="bg-[#0f2042] border-b-2 border-black sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-yellow-400 text-black font-bold flex items-center justify-center rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-impact text-xl tracking-wider text-white">
                  CONCRETE BLOOM<span className="text-yellow-400">.ID</span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-blue-300 block -mt-1 uppercase font-bold">
                  Smart Guest Portal
                </span>
              </div>
            </Link>

            <div className="hidden md:block h-6 w-px bg-white/20" />

            <div className="hidden md:flex items-center gap-2 bg-black/40 border border-white/20 px-3 py-1.5 rounded-full text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{clientData.bride} &amp; {clientData.groom}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="btn-pop-dark py-2 px-3 rounded-xl text-xs font-bold font-mono">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Web Penjualan</span>
            </Link>
            <Link
              href="/dashboard-admin"
              className="btn-pop-dark py-2 px-3 rounded-xl text-xs font-bold font-mono text-yellow-300"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Dashboard Admin</span>
            </Link>
            <button className="btn-pop-yellow py-2 px-4 rounded-xl text-xs font-bold uppercase font-impact tracking-wider">
              <Smartphone className="w-4 h-4" />
              <span>Live Preview</span>
            </button>
          </div>
        </div>

        {/* SUB NAV TABS */}
        <div className="bg-[#162a56] border-t border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none font-mono text-xs">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition ${
                  activeTab === tab.id
                    ? "bg-yellow-400 text-black border-2 border-black shadow"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ============================== TAB: OVERVIEW ============================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="pop-card-navy rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-[#0f2042] via-[#162a56] to-[#1e3a8a]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 text-left">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-impact font-bold uppercase rounded-full border border-black shadow">
                      🟢 STATUS: {clientData.status}
                    </span>
                    <span className="text-xs font-mono text-yellow-300">
                      {clientData.package} (Masa Aktif s/d {clientData.activeUntil})
                    </span>
                  </div>
                  <h1 className="font-display text-4xl sm:text-5xl text-white">
                    {clientData.bride} &amp; {clientData.groom}
                  </h1>
                  <p className="text-xs text-blue-200 font-mono mt-1">
                    {daysLeft !== null ? `H-${daysLeft} Hari Menuju Hari H` : "Menghitung..."} • {clientData.eventDateFormatted}
                  </p>
                </div>

                <div className="bg-black/50 border-2 border-white/20 p-4 rounded-2xl w-full md:w-auto text-left shadow-xl shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold mb-1">
                    Tautan Undangan Website:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={clientData.url}
                      className="bg-slate-900 text-yellow-300 font-mono text-xs px-3 py-2 rounded-lg border border-slate-700 w-full sm:w-64 focus:outline-none"
                    />
                    <button
                      onClick={() => copyPersonalLink(clientData.url, "Semua")}
                      className="btn-pop-yellow py-2 px-3 rounded-lg text-xs font-bold shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-left">
              <StatCard label="TOTAL TAMU" value={stats.totalGuests} sub="Daftar Terdaftar" icon={<Users className="w-4 h-4 text-blue-600" />} />
              <StatCard label="TERKIRIM" value={stats.sentCount} sub="Via WhatsApp" icon={<Send className="w-4 h-4 text-emerald-600" />} valueClass="text-emerald-600" />
              <StatCard label="DIBUKA" value={stats.openedCount} sub="Oleh Tamu" icon={<Eye className="w-4 h-4 text-purple-600" />} valueClass="text-purple-600" />
              <StatCard label="KONFIRMASI HADIR" value={stats.hadirCount} sub="Status RSVP" icon={<CheckCircle className="w-4 h-4 text-blue-600" />} valueClass="text-blue-700" />
              <StatCard label="ESTIMASI PORSI" value={`${stats.totalPorsi} Orang`} sub="Headcount Katering" icon={<Utensils className="w-4 h-4 text-amber-500" />} valueClass="text-2xl text-amber-600" />
              <StatCard label="QR CHECK-IN" value={stats.checkedinCount} sub="Tamu Hadir Venue" icon={<QrCode className="w-4 h-4 text-rose-600" />} valueClass="text-rose-600" />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="pop-card bg-white p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-2xl text-slate-900">Tambah Tamu Undangan</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Masukkan nama teman, keluarga, atau relasi kantor untuk membuat cover personal otomatis.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("guests")}
                  className="btn-pop-yellow w-full py-2.5 rounded-xl text-xs font-bold uppercase mt-4"
                >
                  Buka Kelola Tamu
                </button>
              </div>

              <div className="pop-card bg-white p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-2xl text-slate-900">Kirim WhatsApp Broadcast</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Kustomisasi teks pengantar pesan sebar WhatsApp dan kirim langsung ke kontak tamu.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("broadcast")}
                  className="btn-pop-dark w-full py-2.5 rounded-xl text-xs font-bold uppercase mt-4"
                >
                  Atur Template Broadcast
                </button>
              </div>

              <div className="pop-card bg-white p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-2xl text-slate-900">Scanner Buku Tamu Digital</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Buka simulator scanner resepsionis untuk mencatat kehadiran tamu saat hari H acara.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("qrscanner")}
                  className="btn-pop-yellow w-full py-2.5 rounded-xl text-xs font-bold uppercase mt-4"
                >
                  Buka QR Scanner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================== TAB: GUESTS ============================== */}
        {activeTab === "guests" && (
          <div className="space-y-6">
            <div className="pop-card bg-white text-slate-900 rounded-3xl p-6 shadow-xl text-left">
              <h3 className="font-display text-3xl text-slate-950 mb-1">Manajemen Tamu Undangan</h3>
              <p className="text-xs text-slate-600 mb-6">
                Tambah, cari, dan kelola penerima undangan digital pernikahan Anda.
              </p>

              <form onSubmit={handleAddGuest} className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl mb-6">
                <span className="text-xs font-bold text-blue-900 block mb-3">➕ Tambah Tamu Baru:</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Nama Lengkap & Gelar Tamu"
                    required
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <select
                    value={newGuestGroup}
                    onChange={(e) => setNewGuestGroup(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {GROUP_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g === "Keluarga" ? "Keluarga Besar" : g === "Sahabat Kuliah" ? "Sahabat / Teman" : g}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Nomor WA (cth: 0812345678)"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button type="submit" className="btn-pop-yellow py-2 px-4 rounded-xl text-xs font-bold">
                    Simpan ke Daftar
                  </button>
                </div>
              </form>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="bg-slate-100 border border-slate-300 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold"
                  >
                    <option value="Semua">Semua Kategori Grup</option>
                    {GROUP_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Cari nama / nomor WA..."
                    value={searchGuest}
                    onChange={(e) => setSearchGuest(e.target.value)}
                    className="bg-slate-100 border border-slate-300 px-3 py-2 rounded-xl text-xs w-full sm:w-64 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-[10px] font-mono text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Nama Tamu</th>
                      <th className="p-3.5">Grup</th>
                      <th className="p-3.5">Status Kirim</th>
                      <th className="p-3.5">RSVP</th>
                      <th className="p-3.5">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredGuests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 font-mono text-xs">
                          Tidak ada tamu yang cocok dengan pencarian/filter.
                        </td>
                      </tr>
                    ) : (
                      filteredGuests.map((g) => (
                        <tr key={g.id} className="text-xs">
                          <td className="p-3 font-bold text-slate-900">{g.name}</td>
                          <td className="p-3 text-slate-600">{g.group}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                g.status === "Sudah Terkirim"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {g.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{g.rsvp}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => sendDirectWa(g.id)}
                                title="Kirim via WhatsApp"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => copyPersonalWaText(g.id)}
                                title="Salin Pesan"
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteGuest(g.id)}
                                title="Hapus Tamu"
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                              >
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
          </div>
        )}

        {/* ============================== TAB: BROADCAST ============================== */}
        {activeTab === "broadcast" && (
          <div className="space-y-6">
            <div className="pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-left shadow-xl">
              <h3 className="font-display text-3xl text-slate-950 mb-1">Generator Template Sebar WhatsApp</h3>
              <p className="text-xs text-slate-600 mb-6">
                Edit template pesan di bawah. Gunakan <code>{"{nama_tamu}"}</code>, <code>{"{link_undangan}"}</code>,{" "}
                <code>{"{grup}"}</code>, dan <code>{"{tanggal_acara}"}</code> — otomatis diganti sesuai data tamu.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Template Pesan</label>
                  <textarea
                    value={waTemplate}
                    onChange={(e) => setWaTemplate(e.target.value)}
                    rows={10}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Pratinjau (contoh untuk {guests[0]?.name ?? "tamu pertama"})
                  </label>
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 text-xs whitespace-pre-wrap font-mono text-slate-800 h-[calc(100%-1.75rem)]">
                    {waPreviewText}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================== TAB: QR SCANNER ============================== */}
        {activeTab === "qrscanner" && (
          <div className="pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-center shadow-xl relative overflow-hidden">
            <h3 className="font-display text-3xl text-slate-950 mb-1">Simulator Buku Tamu QR Scanner</h3>
            <p className="text-xs text-slate-600 mb-6">
              Simulasi check-in tamu di venue. Ketik nama atau ID tamu untuk mensimulasikan scan.
            </p>

            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-400 shadow-[0_0_12px_#c084fc] animate-bounce" />

            <div className="max-w-md mx-auto space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Masukkan ID / Nama Tamu..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  onClick={() => simulateQrScan(qrInput)}
                  className="btn-pop-dark py-2 px-5 rounded-xl text-xs font-bold shrink-0"
                >
                  Scan / Check-in
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                <span className="text-[10px] font-mono text-slate-400">Uji Cepat:</span>
                <button
                  onClick={() => simulateQrScan("Sukirno")}
                  className="text-[10px] bg-slate-100 hover:bg-purple-100 text-slate-700 px-2.5 py-1 rounded-lg border font-mono"
                >
                  Bpk. H. Sukirno (Keluarga)
                </button>
                <button
                  onClick={() => simulateQrScan("Andika")}
                  className="text-[10px] bg-slate-100 hover:bg-purple-100 text-slate-700 px-2.5 py-1 rounded-lg border font-mono"
                >
                  dr. Andika Pratama (VIP)
                </button>
              </div>
            </div>

            <div className="max-w-md mx-auto mt-6">
              {qrResult?.found === true && (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 text-slate-900 text-left shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">
                        CHECK-IN BERHASIL
                      </span>
                      <h4 className="font-display text-2xl text-slate-950">{qrResult.guest.name}</h4>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 font-mono">
                    <div>Kategori: <b>{qrResult.guest.group}</b></div>
                    <div>Porsi Kehadiran: <b>{qrResult.guest.count} Orang</b></div>
                    <div>Waktu Kedatangan: <b>{qrResult.guest.checkinTime}</b></div>
                  </div>
                </div>
              )}
              {qrResult?.found === false && (
                <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 text-rose-800 text-left">
                  <h4 className="font-bold text-xs">❌ Tamu Tidak Ditemukan</h4>
                  <p className="text-xs mt-1">Kode QR tidak valid atau belum terdaftar dalam sistem.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================== TAB: WISHES ============================== */}
        {activeTab === "wishes" && (
          <div className="pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-left shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <h3 className="font-display text-3xl text-slate-950">Moderasi Doa &amp; Ucapan Tamu</h3>
                <p className="text-xs text-slate-600">
                  Kelola dan filter pesan doa restu yang tampil di feed website undangan Anda.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Feed Realtime
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-[10px] font-mono text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Pengirim</th>
                    <th className="p-3.5">Pesan Ucapan</th>
                    <th className="p-3.5">Status Tampil</th>
                    <th className="p-3.5">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wishes.map((w) => (
                    <tr key={w.id} className="text-left">
                      <td className="p-3">
                        <div className="font-bold text-xs text-slate-900">{w.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{w.time}</span>
                      </td>
                      <td className="p-3 text-xs text-slate-600 max-w-xs">{w.message}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            w.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {w.status === "active" ? "Ditampilkan" : "Disembunyikan"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleWishStatus(w.id)}
                            title="Toggle Sembunyikan/Tampilkan"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            {w.status === "active" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => deleteWish(w.id)}
                            title="Hapus"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================== TAB: SETTINGS ============================== */}
        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-left shadow-xl">
            <h3 className="font-display text-3xl text-slate-950 mb-1">Pengaturan Konten Undangan</h3>
            <p className="text-xs text-slate-600 mb-6">
              Perbarui data mempelai, jadwal acara akad &amp; resepsi, dan informasi rekening hadiah.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="border-b border-slate-200 pb-5">
                <h4 className="font-bold text-sm text-blue-900 uppercase font-mono mb-3">1. Data Mempelai</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Mempelai Wanita &amp; Gelar
                    </label>
                    <input
                      type="text"
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Mempelai Pria &amp; Gelar
                    </label>
                    <input
                      type="text"
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-200 pb-5">
                <h4 className="font-bold text-sm text-blue-900 uppercase font-mono mb-3">2. Waktu &amp; Lokasi Acara</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Acara</label>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Akad</label>
                    <input
                      type="text"
                      defaultValue="08:00 - 10:00 WIB"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Resepsi</label>
                    <input
                      type="text"
                      defaultValue="11:00 - 14:00 WIB"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Gedung &amp; Alamat Lengkap</label>
                  <input
                    type="text"
                    defaultValue="Grand Ballroom Hotel Mulia, Jl. Asia Afrika No. 6, Senayan, Jakarta Pusat"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-blue-900 uppercase font-mono mb-3">
                  3. Rekening Hadiah / Amplop Digital
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening 1 (BCA)</label>
                    <input
                      type="text"
                      defaultValue="8830192841 - a.n Muhammad Rayhan"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening 2 (BSI)</label>
                    <input
                      type="text"
                      defaultValue="7192840192 - a.n Aisyah Humaira"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-pop-yellow py-3 px-8 rounded-xl text-xs font-bold uppercase tracking-wider">
                Simpan Perubahan Undangan
              </button>
            </form>
          </div>
        )}
      </main>

      <ToastStack toasts={toasts} />
    </div>
  );
}

/**
 * CATATAN MIGRASI DATA KE LARAVEL (bertahap, tidak wajib sekarang):
 *
 * Semua data di atas (INITIAL_CLIENT_DATA, INITIAL_GUESTS, INITIAL_WISHES) sekarang
 * masih hardcode di file ini, sama seperti sebelumnya di client-dashboard.js.
 * Supaya datanya beneran tersimpan (bukan hilang saat refresh), nanti tinggal:
 *
 * 1. Bikin endpoint di routes/api.php Laravel, misal:
 *    Route::get('/api/guests', [GuestController::class, 'index']);
 *    Route::post('/api/guests', [GuestController::class, 'store']);
 *    Route::delete('/api/guests/{id}', [GuestController::class, 'destroy']);
 *
 * 2. Ganti useState(INITIAL_GUESTS) jadi useState<Guest[]>([]), lalu fetch di useEffect:
 *    useEffect(() => {
 *      fetch('http://localhost:8000/api/guests')
 *        .then(res => res.json())
 *        .then(data => setGuests(data));
 *    }, []);
 *
 * 3. Di handleAddGuest/deleteGuest/dst, tambahkan fetch POST/DELETE ke Laravel
 *    sebelum (atau sesudah) update state lokal, supaya perubahan tersimpan di database.
 */
