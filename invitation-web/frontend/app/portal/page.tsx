"use client";

import { useState, useMemo, useEffect } from "react";
import { loginPortal, logoutPortal, getCurrentInvitation } from "@/lib/auth";
import {
  LogOut,
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
  Link2,
  Trash2,
  EyeOff,
  Search,
  MessageCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------
type Guest = {
  id: number;
  invitationId: string;
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
  invitationId: string;
  name: string;
  message: string;
  time: string;
  status: "active" | "hidden";
};

type Invitation = {
  id: string;
  passcode: string;
  phone: string;
  slug: string;
  url: string;
  bride: string;
  groom: string;
  eventDate: string;
  eventDateFormatted: string;
  package: string;
  activeUntil: string;
};

type Toast = { id: number; message: string };
type TabId = "overview" | "guests" | "broadcast" | "qrscanner" | "wishes" | "settings";

// ---------------------------------------------------------------------------
// Data tamu & ucapan masih hardcode (lihat catatan di bawah file).
// Data UNDANGAN sekarang datang dari Laravel (tabel `invitations`), TIDAK
// lagi hardcode di sini.
// ---------------------------------------------------------------------------

/** Ubah response Laravel (snake_case) jadi bentuk yang dipakai komponen ini. */
function mapInvitationFromApi(raw: any): Invitation {
  return {
    id: String(raw.id),
    passcode: raw.passcode,
    phone: raw.phone,
    slug: raw.slug,
    url: raw.url,
    bride: raw.bride,
    groom: raw.groom,
    eventDate: raw.event_date,
    eventDateFormatted: raw.event_date_formatted,
    package: raw.package,
    activeUntil: raw.active_until,
  };
}

const INITIAL_GUESTS: Guest[] = [
  { id: 1, invitationId: "inv-01", name: "Bpk. H. Sukirno & Ibu Hj. Marwah", group: "Keluarga", phone: "081234567890", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 3, checkin: false },
  { id: 2, invitationId: "inv-01", name: "Dra. Siti Nurhaliza, M.Pd", group: "Kolega Kantor", phone: "085712345678", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 1, checkin: false },
  { id: 3, invitationId: "inv-01", name: "Rian Hidayat & Partner", group: "Sahabat Kuliah", phone: "089612349876", status: "Sudah Terkirim", opened: false, rsvp: "Ragu-ragu", count: 0, checkin: false },
  { id: 4, invitationId: "inv-01", name: "dr. Andika Pratama, Sp.PD", group: "VIP Guest", phone: "081398765432", status: "Draft", opened: false, rsvp: "Belum Mengisi", count: 0, checkin: false },
  { id: 5, invitationId: "inv-02", name: "Ir. Bambang Trihatmodjo", group: "VIP Guest", phone: "081198765432", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 2, checkin: true, checkinTime: "08:15 WIB" },
];

const INITIAL_WISHES: Wish[] = [
  { id: 1, invitationId: "inv-01", name: "Budi Santoso & Keluarga", message: "Barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fii khair. Selamat menempuh hidup baru!", time: "10 menit lalu", status: "active" },
  { id: 2, invitationId: "inv-01", name: "Dr. Farah Amelia", message: "Selamat untuk kedua mempelai! Semoga cinta dan kebahagiaan selalu menyertai perjalanan kalian.", time: "25 menit lalu", status: "active" },
];

const DEFAULT_WA_TEMPLATE =
  "Kepada Yth. *{nama_tamu}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:\n\n*{mempelai}*\n📅 {tanggal_acara}\n📍 Grand Ballroom Hotel Mulia Senayan Jakarta\n\nBerikut tautan undangan digital personal Anda:\n👉 {link_undangan}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu berkenan hadir dan memberikan doa restu.\n\nTerima kasih.\n*{mempelai}*";

const GROUP_OPTIONS = ["Keluarga", "Sahabat Kuliah", "Kolega Kantor", "VIP Guest"];

// ---------------------------------------------------------------------------
// SMALL REUSABLE PIECES
// ---------------------------------------------------------------------------
function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="bg-[#161d52] text-white text-xs font-mono px-4 py-3 rounded-xl border border-white/10 shadow-xl">
          {t.message}
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, icon, valueClass = "text-slate-950" }: { label: string; value: string | number; sub: string; icon: React.ReactNode; valueClass?: string }) {
  return (
    <div className="pop-card bg-white p-4 rounded-2xl">
      <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono font-bold mb-1">
        <span>{label}</span>
        {icon}
      </div>
      <div className={`font-display text-3xl font-bold ${valueClass}`}>{value}</div>
      <span className="text-[10px] text-slate-500 font-mono">{sub}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export default function ClientPortal() {
  const [currentClient, setCurrentClient] = useState<Invitation | null>(null);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [groupFilter, setGroupFilter] = useState("Semua");
  const [searchGuest, setSearchGuest] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestGroup, setNewGuestGroup] = useState(GROUP_OPTIONS[0]);
  const [newGuestPhone, setNewGuestPhone] = useState("");

  const [waTemplate, setWaTemplate] = useState(DEFAULT_WA_TEMPLATE);
  const [qrInput, setQrInput] = useState("");
  const [qrResult, setQrResult] = useState<{ found: true; guest: Guest } | { found: false } | null>(null);

  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [eventDateText, setEventDateText] = useState("");

  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  function showToast(message: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    getCurrentInvitation()
      .then((raw) => {
        if (raw) setCurrentClient(mapInvitationFromApi(raw));
      })
      .finally(() => setCheckingSession(false));
  }, []);

  // --- LOGIN ---
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    const result = await loginPortal(passcodeInput.trim());

    setLoggingIn(false);

    if (result.success) {
      const invitation = mapInvitationFromApi(result.invitation);
      setCurrentClient(invitation);
      setBrideName(invitation.bride);
      setGroomName(invitation.groom);
      setEventDateText(invitation.eventDateFormatted);
      showToast(`🎉 Selamat datang kembali, ${invitation.bride.split(",")[0]} & ${invitation.groom.split(",")[0]}!`);
    } else {
      setLoginError(result.message);
    }
  }

  async function quickLogin(passcode: string) {
    setPasscodeInput(passcode);
    setLoggingIn(true);

    const result = await loginPortal(passcode);

    setLoggingIn(false);

    if (result.success) {
      const invitation = mapInvitationFromApi(result.invitation);
      setCurrentClient(invitation);
      setBrideName(invitation.bride);
      setGroomName(invitation.groom);
      setEventDateText(invitation.eventDateFormatted);
      setLoginError("");
      showToast(`🎉 Selamat datang kembali, ${invitation.bride.split(",")[0]} & ${invitation.groom.split(",")[0]}!`);
    } else {
      setLoginError(result.message);
    }
  }

  async function handleLogout() {
    await logoutPortal();
    setCurrentClient(null);
    setPasscodeInput("");
    setActiveTab("overview");
    showToast("🔒 Anda telah keluar dari Smart Dashboard.");
  }

  // --- Countdown ---
  useEffect(() => {
    if (!currentClient) return;
    const target = new Date(currentClient.eventDate).getTime();
    const update = () => setDaysLeft(Math.floor((target - Date.now()) / (1000 * 60 * 60 * 24)));
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [currentClient]);

  // --- Scoped data (per klien yang login) ---
  const myGuests = useMemo(
    () => (currentClient ? guests.filter((g) => g.invitationId === currentClient.id) : []),
    [guests, currentClient]
  );
  const myWishes = useMemo(
    () => (currentClient ? wishes.filter((w) => w.invitationId === currentClient.id) : []),
    [wishes, currentClient]
  );

  const stats = useMemo(() => {
    const totalGuests = myGuests.length;
    const sentCount = myGuests.filter((g) => g.status === "Sudah Terkirim").length;
    const openedCount = myGuests.filter((g) => g.opened).length;
    const hadirGuests = myGuests.filter((g) => g.rsvp === "Hadir");
    const totalPorsi = hadirGuests.reduce((acc, g) => acc + (g.count || 1), 0);
    const checkedinCount = myGuests.filter((g) => g.checkin).length;
    return { totalGuests, sentCount, openedCount, hadirCount: hadirGuests.length, totalPorsi, checkedinCount };
  }, [myGuests]);

  const filteredGuests = useMemo(() => {
    let list = [...myGuests];
    if (groupFilter !== "Semua") list = list.filter((g) => g.group === groupFilter);
    const q = searchGuest.trim().toLowerCase();
    if (q) list = list.filter((g) => g.name.toLowerCase().includes(q) || g.phone.includes(q));
    return list;
  }, [myGuests, groupFilter, searchGuest]);

  function generateMessage(guest: Guest) {
    if (!currentClient) return "";
    const personalLink = `${currentClient.url}?to=${encodeURIComponent(guest.name)}`;
    return waTemplate
      .replaceAll("{nama_tamu}", guest.name)
      .replaceAll("{link_undangan}", personalLink)
      .replaceAll("{grup}", guest.group)
      .replaceAll("{tanggal_acara}", currentClient.eventDateFormatted)
      .replaceAll("{mempelai}", `${currentClient.bride.split(",")[0]} & ${currentClient.groom.split(",")[0]}`);
  }

  const waPreviewText = useMemo(() => {
    const sample = myGuests[0] ?? { name: "Bpk. H. Sukirno", group: "Keluarga" };
    return generateMessage(sample as Guest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myGuests, waTemplate, currentClient]);

  function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!currentClient) return;
    const name = newGuestName.trim();
    if (!name) return;
    const guest: Guest = {
      id: Date.now(),
      invitationId: currentClient.id,
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
    showToast(`✅ Tamu "${name}" tersimpan di database!`);
  }

  function sendDirectWa(guestId: number) {
    const guest = myGuests.find((g) => g.id === guestId);
    if (!guest) return;
    const message = generateMessage(guest);
    let cleanPhone = guest.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.substring(1);
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, status: "Sudah Terkirim" } : g)));
  }

  function copyLink(link: string, label: string) {
    navigator.clipboard?.writeText(link);
    showToast(`🔗 Tautan untuk "${label}" berhasil disalin!`);
  }

  function copyWaText(guestId: number) {
    const guest = myGuests.find((g) => g.id === guestId);
    if (!guest) return;
    navigator.clipboard?.writeText(generateMessage(guest));
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, status: "Sudah Terkirim" } : g)));
    showToast(`📋 Pesan untuk "${guest.name}" berhasil disalin!`);
  }

  function deleteGuestItem(id: number) {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    showToast("🗑️ Tamu berhasil dihapus dari daftar.");
  }

  function simulateQrScan(code: string) {
    const guest = myGuests.find((g) => g.id.toString() === code || g.name.toLowerCase().includes(code.toLowerCase()));
    if (guest) {
      const now = new Date();
      const checkinTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
      const updated: Guest = { ...guest, checkin: true, rsvp: "Hadir", count: guest.count || 2, checkinTime };
      setGuests((prev) => prev.map((g) => (g.id === guest.id ? updated : g)));
      setQrResult({ found: true, guest: updated });
      showToast(`🎟️ Sukses Check-in: ${guest.name}`);
    } else {
      setQrResult({ found: false });
    }
  }

  function toggleWish(id: number) {
    setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, status: w.status === "active" ? "hidden" : "active" } : w)));
  }

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    // TODO: PUT ke API Laravel, lihat catatan di bawah
    showToast("💾 Perubahan data undangan berhasil disimpan ke database!");
  }

  const NAV_TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: "guests", label: "Kelola Daftar Tamu", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "broadcast", label: "Generator Sebar WA", icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "qrscanner", label: "Buku Tamu QR Scanner", icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: "wishes", label: "Moderasi Ucapan", icon: <Heart className="w-3.5 h-3.5" /> },
    { id: "settings", label: "Edit Konten Undangan", icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  // ============================== VIEW 0: CEK SESI ==============================
  if (checkingSession) {
    return (
      <div className="bg-[#2f3b90] text-white min-h-screen flex items-center justify-center">
        <p className="text-xs font-mono text-blue-200">Memeriksa sesi login...</p>
      </div>
    );
  }

  // ============================== VIEW 1: LOGIN GATE ==============================
  if (!currentClient) {
    return (
      <div className="bg-[#2f3b90] text-white selection:bg-white selection:text-[#2f3b90] min-h-screen flex items-center justify-center p-4">
        <div className="pop-card bg-white text-slate-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative">
          <div className="w-14 h-14 rounded-2xl bg-[#2f3b90] text-white border-2 border-[#161d52] flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#161d52] font-serifLuxury text-2xl font-bold">
            ✦
          </div>

          <span className="inline-block px-3 py-0.5 bg-blue-100 text-[#2f3b90] text-[10px] font-mono font-bold uppercase rounded-md mb-2">
            CLIENT ACCESS GATE • SECURED
          </span>
          <h2 className="font-serifLuxury text-4xl text-slate-950 font-bold">Portal Smart Dashboard</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Masukkan Kode Undangan atau Nomor WhatsApp terdaftar Anda untuk mengelola tamu &amp; sebar link undangan.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 font-mono mb-1">
                Kode Undangan / Nomor WhatsApp:
              </label>
              <input
                type="text"
                placeholder="cth: RAYHAN-AISYAH atau 0812345678"
                required
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-[#2f3b90] focus:outline-none text-slate-900"
              />
            </div>

            {loginError && <p className="text-xs text-rose-600 font-mono">❌ {loginError}</p>}

            <button
              type="submit"
              disabled={loggingIn}
              className="btn-pop-dark w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {loggingIn ? "Memproses..." : "Masuk ke Dashboard Pengantin"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-left">
            <span className="text-[11px] font-mono text-slate-400 block mb-2">Uji Coba Cepat (Akun Demo):</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => quickLogin("RAYHAN-AISYAH")}
                className="text-[10px] bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-[#2f3b90] px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
              >
                🔑 Rayhan &amp; Aisyah
              </button>
              <button
                onClick={() => quickLogin("KEVIN-JESSICA")}
                className="text-[10px] bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-[#2f3b90] px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
              >
                🔑 Kevin &amp; Jessica
              </button>
            </div>
          </div>
        </div>
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  // ============================== VIEW 2: DASHBOARD ==============================
  return (
    <div className="bg-[#2f3b90] text-white selection:bg-white selection:text-[#2f3b90] min-h-screen flex flex-col">
      <header className="bg-[#161d52] border-b-2 border-white/20 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-[#2f3b90] font-bold flex items-center justify-center rounded-xl border-2 border-white shadow-[2px_2px_0px_#0f1438] font-serifLuxury text-xl">
              ✦
            </div>
            <div>
              <span className="font-display text-xl tracking-wider text-white font-bold">
                BLUEVITE<span className="text-amber-300">.PORTAL</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-blue-200 block -mt-1 uppercase font-bold">
                Smart Guest Management Suite
              </span>
            </div>
          </div>

          <button onClick={handleLogout} className="btn-pop-dark py-2 px-3 rounded-xl text-xs font-bold font-mono text-rose-300 hover:text-white">
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Portal</span>
          </button>
        </div>

        <div className="bg-[#1e2666] border-t border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none font-mono text-xs">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition ${
                  activeTab === tab.id ? "bg-white text-[#2f3b90] border-2 border-white shadow" : "text-slate-300 hover:bg-white/10"
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
        {/* ============================== TAB: OVERVIEW ============================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="pop-card-ultramarine rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-[#2f3b90] via-[#1e2666] to-[#161d52]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 text-left">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-mono font-bold uppercase rounded-full shadow">
                      🟢 STATUS: LIVE ONLINE
                    </span>
                    <span className="text-xs font-mono text-amber-300">{currentClient.package}</span>
                  </div>
                  <h1 className="font-serifLuxury text-4xl sm:text-5xl text-white font-bold">
                    {currentClient.bride} &amp; {currentClient.groom}
                  </h1>
                  <p className="text-xs text-blue-200 font-mono mt-1">
                    {daysLeft !== null ? `H-${daysLeft} Hari Menuju Hari H` : "Menghitung..."} • {currentClient.eventDateFormatted}
                  </p>
                </div>

                <div className="bg-black/40 border-2 border-white/30 p-4 rounded-2xl w-full md:w-auto text-left shadow-xl shrink-0">
                  <span className="text-[10px] font-mono text-slate-300 uppercase block font-bold mb-1">Tautan Undangan Website:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentClient.url}
                      className="bg-slate-900 text-amber-300 font-mono text-xs px-3 py-2 rounded-lg border border-slate-700 w-full sm:w-64 focus:outline-none"
                    />
                    <button onClick={() => copyLink(currentClient.url, "Undangan")} className="btn-pop-white py-2 px-3 rounded-lg text-xs font-bold shrink-0">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-left">
              <StatCard label="TOTAL TAMU" value={stats.totalGuests} sub="Database Tamu" icon={<Users className="w-4 h-4 text-[#2f3b90]" />} />
              <StatCard label="TERKIRIM" value={stats.sentCount} sub="Via WhatsApp" icon={<Send className="w-4 h-4 text-emerald-600" />} valueClass="text-emerald-600" />
              <StatCard label="DIBUKA" value={stats.openedCount} sub="Oleh Tamu" icon={<Eye className="w-4 h-4 text-purple-600" />} valueClass="text-purple-600" />
              <StatCard label="KONFIRMASI HADIR" value={stats.hadirCount} sub="Status RSVP" icon={<CheckCircle className="w-4 h-4 text-[#2f3b90]" />} valueClass="text-[#2f3b90]" />
              <StatCard label="ESTIMASI PORSI" value={`${stats.totalPorsi} Orang`} sub="Headcount Katering" icon={<Utensils className="w-4 h-4 text-amber-500" />} valueClass="text-2xl text-amber-600" />
              <StatCard label="QR CHECK-IN" value={stats.checkedinCount} sub="Tamu Hadir Venue" icon={<QrCode className="w-4 h-4 text-rose-600" />} valueClass="text-rose-600" />
            </div>
          </div>
        )}

        {/* ============================== TAB: GUESTS ============================== */}
        {activeTab === "guests" && (
          <div className="pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-left shadow-xl">
            <h3 className="font-serifLuxury text-3xl text-slate-950 font-bold mb-1">Manajemen Tamu Undangan</h3>
            <p className="text-xs text-slate-600 mb-6">Tambah, cari, dan kelola penerima undangan digital pernikahan Anda.</p>

            <form onSubmit={handleAddGuest} className="bg-blue-50 border-2 border-[#2f3b90]/30 p-4 rounded-2xl mb-6">
              <span className="text-xs font-bold text-[#161d52] block mb-3 font-mono">➕ Tambah Tamu Baru ke Database:</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nama Lengkap & Gelar Tamu"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#2f3b90] focus:outline-none"
                />
                <select
                  value={newGuestGroup}
                  onChange={(e) => setNewGuestGroup(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#2f3b90] focus:outline-none"
                >
                  {GROUP_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g === "Keluarga" ? "Keluarga Besar" : g === "Sahabat Kuliah" ? "Sahabat / Teman" : g}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Nomor WhatsApp (cth: 0812345678)"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#2f3b90] focus:outline-none"
                />
                <button type="submit" className="btn-pop-dark py-2 px-4 rounded-xl text-xs font-bold">
                  Simpan ke Database
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="bg-slate-100 border border-slate-300 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold font-mono"
              >
                <option value="Semua">Semua Kategori Grup</option>
                {GROUP_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari nama tamu..."
                  value={searchGuest}
                  onChange={(e) => setSearchGuest(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-300 text-slate-800 pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2f3b90]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono text-slate-600 uppercase">
                  <tr>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">Nama Tamu</th>
                    <th className="p-3.5">Kategori Grup</th>
                    <th className="p-3.5">Status Sebar</th>
                    <th className="p-3.5">Konfirmasi RSVP</th>
                    <th className="p-3.5">Aksi Kirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-mono text-xs">
                        Belum ada data tamu yang cocok. Tambahkan tamu baru di atas.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((g, idx) => (
                      <tr key={g.id} className="hover:bg-slate-50 transition text-left">
                        <td className="p-3.5 text-xs font-mono text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>{g.name}</span>
                            {g.checkin && (
                              <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded font-mono">
                                Check-in ({g.checkinTime || "Hadir"})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{g.phone || "-"}</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              g.group === "VIP Guest"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : g.group === "Keluarga"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {g.group}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${g.status === "Sudah Terkirim" ? "bg-blue-100 text-[#2f3b90]" : "bg-slate-100 text-slate-600"}`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`text-xs font-mono font-bold ${g.rsvp === "Hadir" ? "text-emerald-600" : g.rsvp === "Ragu-ragu" ? "text-amber-600" : "text-slate-400"}`}>
                            {g.rsvp} {g.count > 0 ? `(${g.count} porsi)` : ""}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => sendDirectWa(g.id)} title="Kirim via WhatsApp Langsung" className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm">
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => copyLink(`${currentClient.url}?to=${encodeURIComponent(g.name)}`, g.name)} title="Salin Tautan Personal" className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2f3b90] transition">
                              <Link2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => copyWaText(g.id)} title="Salin Format Pesan" className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteGuestItem(g.id)} title="Hapus Tamu" className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
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

        {/* ============================== TAB: BROADCAST ============================== */}
        {activeTab === "broadcast" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            <div className="lg:col-span-7 pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8">
              <h3 className="font-serifLuxury text-3xl text-slate-950 font-bold mb-1">Editor Template Pesan WhatsApp</h3>
              <p className="text-xs text-slate-600 mb-4">Gunakan tag dinamis agar nama tamu dan link undangan otomatis disesuaikan.</p>

              <div className="flex flex-wrap gap-2 mb-4 font-mono text-[10px]">
                {["{nama_tamu}", "{link_undangan}", "{tanggal_acara}", "{mempelai}", "{grup}"].map((tag) => (
                  <span key={tag} className="bg-blue-100 text-[#2f3b90] px-2 py-1 rounded font-bold">{tag}</span>
                ))}
              </div>

              <textarea
                value={waTemplate}
                onChange={(e) => setWaTemplate(e.target.value)}
                rows={9}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 text-xs font-mono focus:ring-2 focus:ring-[#2f3b90] focus:outline-none leading-relaxed text-slate-900 mb-4"
              />

              <button onClick={() => showToast("💾 Template pesan sebar WhatsApp berhasil disimpan!")} className="btn-pop-dark py-2.5 px-6 rounded-xl text-xs font-bold uppercase">
                Simpan Template
              </button>
            </div>

            <div className="lg:col-span-5 pop-card-ultramarine bg-[#161d52] rounded-3xl p-6 border-2 border-white/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <MessageCircle className="w-4 h-4" />
                    <span>Preview WhatsApp Bubble</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-mono">Tampilan di HP Tamu</span>
                </div>

                <div className="bg-[#0b2016] border border-emerald-800/60 rounded-2xl p-4 text-xs text-white leading-relaxed shadow-lg relative">
                  <div className="text-[11px] text-emerald-300 font-bold mb-1">Official Wedding Invitation</div>
                  <div className="whitespace-pre-wrap font-mono text-[11px] text-slate-200">{waPreviewText}</div>
                  <div className="text-[9px] text-slate-400 text-right mt-2 font-mono">10:20 WIB • ✓✓</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20">
                <button onClick={() => myGuests[0] && sendDirectWa(myGuests[0].id)} className="btn-pop-white w-full py-3 rounded-xl text-xs font-bold uppercase">
                  📲 Test Kirim Contoh ke WhatsApp Saya
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================== TAB: QR SCANNER ============================== */}
        {activeTab === "qrscanner" && (
          <div className="max-w-3xl mx-auto pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-center shadow-xl">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-[10px] font-mono font-bold uppercase rounded-full mb-2">
              MEJA RESEPSIONIS ACARA
            </span>
            <h3 className="font-serifLuxury text-4xl text-slate-950 font-bold">Scanner Buku Tamu Digital</h3>
            <p className="text-xs text-slate-600 max-w-lg mx-auto mb-6">
              Petugas resepsionis dapat menggunakan fitur ini untuk scan QR Code pada undangan tamu atau memasukkan ID/Nama tamu untuk menandai kehadiran.
            </p>

            <div className="w-full max-w-sm mx-auto h-64 bg-[#161d52] rounded-2xl border-4 border-dashed border-[#4351b8] relative flex flex-col items-center justify-center p-6 text-white shadow-inner mb-6 overflow-hidden">
              <div className="absolute inset-0 opacity-20 halftone-ultramarine" />
              <QrCode className="w-16 h-16 text-amber-300 mb-2 animate-pulse" />
              <span className="text-xs font-mono text-slate-300">Arahkan Kamera ke QR Code Tamu</span>
              <span className="text-[10px] text-amber-300 font-mono mt-1">Status: Kamera Standby</span>
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-bounce" />
            </div>

            <div className="max-w-md mx-auto space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Masukkan ID / Nama Tamu..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2f3b90]"
                />
                <button onClick={() => simulateQrScan(qrInput)} className="btn-pop-dark py-2 px-5 rounded-xl text-xs font-bold shrink-0">
                  Scan / Check-in
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                <span className="text-[10px] font-mono text-slate-400">Uji Cepat:</span>
                <button onClick={() => simulateQrScan("Sukirno")} className="text-[10px] bg-slate-100 hover:bg-blue-100 text-slate-700 px-2.5 py-1 rounded-lg border font-mono">
                  Bpk. H. Sukirno (Keluarga)
                </button>
                <button onClick={() => simulateQrScan("Bambang")} className="text-[10px] bg-slate-100 hover:bg-blue-100 text-slate-700 px-2.5 py-1 rounded-lg border font-mono">
                  Ir. Bambang (VIP)
                </button>
              </div>
            </div>

            <div className="max-w-md mx-auto mt-6">
              {qrResult?.found === true && (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 text-slate-900 text-left shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">✓</div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">CHECK-IN BERHASIL</span>
                      <h4 className="font-serifLuxury text-2xl text-slate-950 font-bold">{qrResult.guest.name}</h4>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 font-mono">
                    <div>Kategori: <b>{qrResult.guest.group}</b></div>
                    <div>Porsi Kehadiran: <b>{qrResult.guest.count || 2} Orang</b></div>
                    <div>Waktu Kedatangan: <b>{qrResult.guest.checkinTime}</b></div>
                  </div>
                </div>
              )}
              {qrResult?.found === false && (
                <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 text-rose-800 text-left">
                  <h4 className="font-bold text-xs font-mono">❌ Tamu Tidak Ditemukan</h4>
                  <p className="text-xs mt-1">Kode QR tidak valid atau belum terdaftar dalam database.</p>
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
                <h3 className="font-serifLuxury text-3xl text-slate-950 font-bold">Moderasi Doa &amp; Ucapan Tamu</h3>
                <p className="text-xs text-slate-600">Kelola dan filter pesan doa restu yang tampil di feed website undangan Anda.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-100 text-[#2f3b90] px-3 py-1 rounded-full">Feed Realtime</span>
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
                  {myWishes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-mono text-xs">
                        Belum ada ucapan untuk undangan ini.
                      </td>
                    </tr>
                  ) : (
                    myWishes.map((w) => (
                      <tr key={w.id} className="text-left">
                        <td className="p-3">
                          <div className="font-bold text-xs text-slate-900">{w.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{w.time}</span>
                        </td>
                        <td className="p-3 text-xs text-slate-600 max-w-xs">{w.message}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${w.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                            {w.status === "active" ? "Ditampilkan" : "Disembunyikan"}
                          </span>
                        </td>
                        <td className="p-3">
                          <button onClick={() => toggleWish(w.id)} title="Toggle" className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                            {w.status === "active" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================== TAB: SETTINGS ============================== */}
        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-left shadow-xl">
            <h3 className="font-serifLuxury text-3xl text-slate-950 font-bold mb-1">Pengaturan Konten Undangan</h3>
            <p className="text-xs text-slate-600 mb-6">Perbarui data mempelai, jadwal acara akad &amp; resepsi, dan informasi rekening hadiah.</p>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="border-b border-slate-200 pb-5">
                <h4 className="font-bold text-sm text-[#161d52] uppercase font-mono mb-3">1. Data Mempelai</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Mempelai Wanita &amp; Gelar</label>
                    <input type="text" value={brideName} onChange={(e) => setBrideName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#2f3b90] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Mempelai Pria &amp; Gelar</label>
                    <input type="text" value={groomName} onChange={(e) => setGroomName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#2f3b90] focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-200 pb-5">
                <h4 className="font-bold text-sm text-[#161d52] uppercase font-mono mb-3">2. Waktu &amp; Lokasi Acara</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Acara</label>
                    <input type="text" value={eventDateText} onChange={(e) => setEventDateText(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#2f3b90] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Akad</label>
                    <input type="text" defaultValue="08:00 - 10:00 WIB" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#2f3b90] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Resepsi</label>
                    <input type="text" defaultValue="11:00 - 14:00 WIB" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#2f3b90] focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Gedung &amp; Alamat Lengkap</label>
                  <input type="text" defaultValue="Grand Ballroom Hotel Mulia Senayan, Jl. Asia Afrika No. 6, Senayan, Jakarta Pusat" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#2f3b90] focus:outline-none" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#161d52] uppercase font-mono mb-3">3. Rekening Hadiah / Amplop Digital</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening 1 (BCA)</label>
                    <input type="text" defaultValue="8830192841 - a.n Muhammad Rayhan" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#2f3b90] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening 2 (BSI)</label>
                    <input type="text" defaultValue="7192840192 - a.n Aisyah Humaira" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#2f3b90] focus:outline-none" />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-pop-dark py-3 px-8 rounded-xl text-xs font-bold uppercase tracking-wider">
                Simpan Perubahan Undangan ke Database
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="bg-[#161d52] border-t border-white/10 py-4 text-center text-slate-400 font-mono text-xs">
        © 2026 BLUEVITE.ID Smart Client Portal
      </footer>

      <ToastStack toasts={toasts} />
    </div>
  );
}

/**
 * ✅ UPDATE: Login sekarang sudah pakai Laravel (tabel `invitations`, session
 * httpOnly cookie via /api/portal/login). Passcode dicek di server, bukan
 * lagi di array hardcode di file ini.
 *
 * Sisa PR yang masih perlu dikerjakan:
 *
 * 1. Data guests/wishes masih hardcode & scoped manual pakai `invitationId`.
 *    Nanti ganti jadi:
 *    GET  /api/guests?invitation_id=xxx
 *    POST /api/guests
 *    dst — sama seperti catatan di file dashboard-pembeli/page.tsx.
 * 2. Data undangan (INVITATIONS) sekarang sudah dari database — kalau mau
 *    tambah klien baru, tinggal tambah row baru di tabel `invitations`
 *    (lewat dashboard-admin nanti, atau db:seed manual untuk sekarang).
 */