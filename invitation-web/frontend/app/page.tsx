"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Phone,
  MessageCircle,
  BookOpen,
  Smartphone,
  Music,
  ArrowRight,
  Search,
  Star,
  Eye,
  CheckCircle,
  Clock,
  Gift,
  MapPin,
  Globe,
  ChevronDown,
  Camera,
  ThumbsUp,
  PlayCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// TYPES & DATA (setara data.js — INVITATION_TEMPLATES, PACKAGES_DATA, ADDONS_DATA)
// ---------------------------------------------------------------------------
type Template = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  subtitle: string;
  price: number;
  priceOriginal: number;
  rating: number;
  reviewsCount: number;
  badge: string | null;
  thumbnail: string;
  features: string[];
};

type Package = {
  id: string;
  name: string;
  price: number;
  priceOriginal: number;
  badge: string | null;
  isFeatured: boolean;
  description: string;
  features: string[];
};

type Addon = { id: string; name: string; price: number; desc: string };

const INVITATION_TEMPLATES: Template[] = [
  {
    id: "royal-ultramarine-01",
    category: "wedding-modern",
    categoryLabel: "Royal Modern Wedding",
    title: "The Ultramarine Royal Suite",
    subtitle: "Kombinasi Ultramarine Blue #2F3B90, Tipografi Editorial & Diamond Sparkles",
    price: 129000,
    priceOriginal: 249000,
    rating: 5.0,
    reviewsCount: 142,
    badge: "✦ BEST SELLER",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    features: ["Custom Backsound Musik", "Live RSVP & Ucapan", "Google Maps Navigasi", "Amplop Digital 1-Klik", "Galeri Foto Sinematik", "Hitung Mundur Acara"],
  },
  {
    id: "pearl-syari-02",
    category: "wedding-syari",
    categoryLabel: "Wedding Syar'i",
    title: "Pearl White Islamic Elegance",
    subtitle: "Nuansa Islami Suci dengan Ornamen Bintang Sparkle ✦ & Kaligrafi Emas",
    price: 99000,
    priceOriginal: 199000,
    rating: 4.9,
    reviewsCount: 98,
    badge: "FAVORITE",
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    features: ["Kutipan Ayat Suci & Doa", "Pemisahan Denah Pria & Wanita", "Musik Nasyid/Akustik Islami", "Buku Tamu Digital", "Live RSVP"],
  },
  {
    id: "botanical-luxury-03",
    category: "wedding-rustic",
    categoryLabel: "Rustic Botanical",
    title: "Emerald Botanical Glasshouse",
    subtitle: "Desain Floral Daun Segar Dipadu Aksen Ultramarine Blue Berkelas",
    price: 139000,
    priceOriginal: 269000,
    rating: 5.0,
    reviewsCount: 115,
    badge: "✦ LUXURY",
    thumbnail: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    features: ["Full Animasi Smooth Scroll", "Dress Code Color Palette", "Live Streaming YouTube Embed", "Smart RSVP", "Galeri Prewedding 12 Foto"],
  },
  {
    id: "sweet-birthday-04",
    category: "birthday",
    categoryLabel: "Sweet 17 / Birthday",
    title: "Celestial Euphoria Birthday",
    subtitle: "Glamour Modern dengan Aksen Sparkle ✦ & Wish Wall Interaktif",
    price: 79000,
    priceOriginal: 149000,
    rating: 4.8,
    reviewsCount: 64,
    badge: "TRENDING",
    thumbnail: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
    features: ["Spotify Playlist Embed", "Dress Code Neon / Chic", "Wish Wall & Likes", "Countdown Timer", "RSVP Form"],
  },
];

const PACKAGES_DATA: Package[] = [
  {
    id: "pkg-basic",
    name: "Paket Basic Wedding",
    price: 79000,
    priceOriginal: 149000,
    badge: null,
    isFeatured: false,
    description: "Pilihan hemat elegan untuk undangan pernikahan simpel & lengkap.",
    features: ["Masa Aktif 6 Bulan", "Pilihan 1 Musik Bebas", "Hitung Mundur Hari H", "Navigasi Google Maps", "Galeri Hingga 5 Foto", "Bebas Kirim Tanpa Batas", "Revisi Teks & Foto 3x"],
  },
  {
    id: "pkg-premium",
    name: "Paket Premium Royal Suite",
    price: 129000,
    priceOriginal: 249000,
    badge: "✦ PALING POPULER",
    isFeatured: true,
    description: "Paket paling diminati calon pengantin dengan fitur Smart Dashboard lengkap.",
    features: ["Masa Aktif 1 Tahun Penuh", "Smart Dashboard Manajemen Tamu", "1-Klik Generator Sebar WA Otomatis", "Buku Tamu Digital QR Scanner", "Amplop Digital & Rekening Hadiah", "Live RSVP & Moderasi Ucapan Doa", "Galeri Sinematik Hingga 15 Foto", "Bebas Revisi Sepuasnya (Unlimited)"],
  },
  {
    id: "pkg-exclusive",
    name: "Paket Exclusive Custom Domain",
    price: 249000,
    priceOriginal: 499000,
    badge: "✦ VIP EXCLUSIVE",
    isFeatured: false,
    description: "Tingkat tertinggi kemewahan dengan nama domain website pribadi kedua mempelai.",
    features: ["Semua Fitur Paket Premium", "Custom Domain Pribadi (.com / .id)", "Sertifikat Keamanan SSL Otomatis", "Video Teaser Prewedding HD", "Filter Instagram Story 'Add Yours'", "Customer Support Prioritas VIP 24/7", "Pengerjaan Kilat Express (6 Jam)"],
  },
];

const ADDONS_DATA: Addon[] = [
  { id: "addon-domain", name: "Custom Domain Pribadi (.com / .id)", price: 125000, desc: "Tautan website unik nama pengantin (cth: rayhan-aisyah.com)" },
  { id: "addon-filter-ig", name: "Custom Filter Instagram Story 'Add Yours'", price: 50000, desc: "Filter estetik bertuliskan nama pengantin untuk tamu di IG Story" },
  { id: "addon-priority", name: "Pengerjaan Kilat Express 6 Jam Selesai", price: 45000, desc: "Prioritas pengerjaan kilat siap sebar dalam hitungan jam" },
  { id: "addon-soundtrack", name: "Custom Mix Lagu Romantis Suara Sendiri", price: 35000, desc: "Sisipkan rekaman voice note pembuka atau lagu rekaman pribadi" },
];

const CATEGORY_TABS = [
  { value: "all", label: "Semua Tema" },
  { value: "wedding-syari", label: "Wedding Syar'i" },
  { value: "wedding-modern", label: "Wedding Modern" },
  { value: "wedding-rustic", label: "Rustic & Floral" },
  { value: "birthday", label: "Sweet 17 / Birthday" },
];

const FEATURES = [
  { icon: <Music className="w-6 h-6 text-amber-300" />, bg: "bg-[#2f3b90]", title: "Custom Backsound Musik", desc: "Bebas pilih lagu romantis atau nasyid pilihan, lengkap dengan tombol kontrol putar & jeda yang elegan." },
  { icon: <MessageCircle className="w-6 h-6 text-white" />, bg: "bg-[#161d52]", title: "Live RSVP & Kolom Ucapan", desc: "Tamu dapat memberikan ucapan doa restu dan konfirmasi kehadiran secara real-time langsung di undangan." },
  { icon: <Clock className="w-6 h-6" />, bg: "bg-amber-500", title: "Countdown Timer Acara", desc: "Hitung mundur otomatis menuju waktu akad dan resepsi agar para tamu tidak melewatkan momen penting." },
  { icon: <Gift className="w-6 h-6 text-amber-300" />, bg: "bg-[#2f3b90]", title: "Amplop Digital & Hadiah", desc: "Memudahkan tamu mengirimkan tanda kasih melalui transfer rekening bank atau QRIS dengan fitur 1-klik salin." },
  { icon: <MapPin className="w-6 h-6 text-amber-300" />, bg: "bg-[#161d52]", title: "Integrasi Google Maps", desc: "Petunjuk arah navigasi akurat ke venue acara dengan tombol rute langsung yang terhubung ke Google Maps." },
  { icon: <Globe className="w-6 h-6 text-amber-300" />, bg: "bg-[#2f3b90]", title: "Custom Domain Pribadi", desc: "Tampilkan link undangan eksklusif dengan nama kedua mempelai (contoh: www.rayhan-aisyah.com)." },
];

const FAQS = [
  { q: "Berapa lama proses pembuatan undangan digital?", a: "Proses pengerjaan normal rata-rata 1 x 24 jam setelah foto dan informasi acara kami terima lengkap. Kami juga menyediakan opsi ekspres 6 jam jika Anda membutuhkan undangan dalam waktu cepat." },
  { q: "Apakah ada batasan jumlah pengiriman link undangan?", a: "TIDAK ADA BATASAN! Anda bebas menyebarkan link undangan ke ribuan tamu keluarga, sahabat, maupun kolega kerja tanpa biaya tambahan." },
  { q: "Bagaimana jika ada perubahan susunan acara atau foto prewedding?", a: "Kami memberikan garansi Bebas Revisi Sepuasnya. Tim desainer kami siap memperbarui teks, rundown, ataupun foto kapan pun Anda butuhkan sebelum hari H." },
  { q: "Berapa lama masa aktif website undangan digital?", a: "Masa aktif undangan berlaku hingga 1 tahun penuh setelah tanggal pernikahan, sehingga buku ucapan dan galeri kenangan Anda tetap dapat dibuka kapan saja." },
];

const WA_ADMIN = "6282223551205";

// ---------------------------------------------------------------------------
// SMALL PIECES
// ---------------------------------------------------------------------------
function StatCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const speed = target / 50;
          let current = 0;
          const step = () => {
            current += speed;
            if (current < target) {
              setCount(Math.floor(current));
              requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };
          step();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref}>
      <span className="font-display font-black text-2xl text-white block">{count.toLocaleString("id-ID")}+</span>
      <span className="text-[11px] font-mono text-blue-200">{label}</span>
    </div>
  );
}

function TemplateCard({ t, onDemo, onOrder }: { t: Template; onDemo: () => void; onOrder: () => void }) {
  return (
    <div className="pop-card bg-white text-slate-900 rounded-3xl overflow-hidden flex flex-col justify-between group">
      <div className="relative h-64 overflow-hidden bg-slate-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold bg-[#2f3b90] text-white px-2.5 py-1 rounded-md shadow border border-white/40">
              {t.categoryLabel}
            </span>
            {t.badge && (
              <span className="text-[10px] font-mono font-bold bg-amber-400 text-black px-2.5 py-1 rounded-md shadow border border-black">
                {t.badge}
              </span>
            )}
          </div>
          <div>
            <span className="text-xs text-amber-300 font-mono font-bold flex items-center gap-1">
              ★ {t.rating} ({t.reviewsCount} ulasan)
            </span>
            <h3 className="font-serifLuxury text-2xl text-white font-bold tracking-wide">{t.title}</h3>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col justify-between flex-1 space-y-4 text-left">
        <p className="text-xs text-slate-600 leading-relaxed font-sans">{t.subtitle}</p>

        <div className="space-y-1.5 text-xs text-slate-700 font-sans border-t border-slate-100 pt-3">
          {t.features.slice(0, 3).map((f) => (
            <div key={f} className="flex items-center gap-2">
              <span className="text-[#2f3b90] font-bold">✦</span>
              <span>{f}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 line-through font-mono">Rp {t.priceOriginal.toLocaleString("id-ID")}</span>
            <div className="font-display text-2xl text-[#2f3b90] font-bold">Rp {t.price.toLocaleString("id-ID")}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={onDemo} title="Lihat Live Demo" className="btn-pop-white py-2 px-3 rounded-xl text-xs font-bold">
              <Eye className="w-4 h-4" />
              <span>Demo</span>
            </button>
            <button onClick={onOrder} className="btn-pop-dark py-2 px-3 rounded-xl text-xs font-bold">
              Pesan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export default function HomePage() {
  const [currentCategory, setCurrentCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedPackageId, setSelectedPackageId] = useState("pkg-premium");
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set(["addon-priority"]));
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function showToast(message: string) {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3000);
  }

  const filteredTemplates = useMemo(() => {
    let list = [...INVITATION_TEMPLATES];
    if (currentCategory !== "all") list = list.filter((t) => t.category === currentCategory);
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q));
    if (sortBy === "price-low") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [currentCategory, searchQuery, sortBy]);

  const selectedPackage = useMemo(
    () => PACKAGES_DATA.find((p) => p.id === selectedPackageId) ?? PACKAGES_DATA[1],
    [selectedPackageId]
  );

  const totalPrice = useMemo(() => {
    let total = selectedPackage.price;
    selectedAddonIds.forEach((id) => {
      const a = ADDONS_DATA.find((item) => item.id === id);
      if (a) total += a.price;
    });
    return total;
  }, [selectedPackage, selectedAddonIds]);

  function toggleAddon(id: string) {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openDemo(_templateId: string) {
    // TODO: sambungkan ke simulator setelah simulator.js dikonversi
    showToast("👀 Fitur demo interaktif akan segera hadir di versi Next.js ini.");
  }

  function orderSingleTemplate(template: Template) {
    const message = `Halo Admin Bluevite.id,\n\nSaya tertarik untuk memesan tema undangan:\n*${template.title}* (${template.categoryLabel})\nHarga Promo: Rp ${template.price.toLocaleString("id-ID")}\n\nBisa dibantu untuk konsultasi pengisian datanya?`;
    window.open(`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(message)}`, "_blank");
  }

  function checkoutViaWhatsApp() {
    const addonsArr = Array.from(selectedAddonIds)
      .map((id) => {
        const a = ADDONS_DATA.find((item) => item.id === id);
        return a ? `• ${a.name} (+Rp ${a.price.toLocaleString("id-ID")})` : "";
      })
      .filter(Boolean);

    const message = `Halo Admin Bluevite.id,\n\nSaya ingin memesan Undangan Digital Website dengan rincian berikut:\n\n💍 *Paket:* ${selectedPackage.name} (Rp ${selectedPackage.price.toLocaleString("id-ID")})\n✨ *Fitur Tambahan (Add-ons):*\n${addonsArr.length > 0 ? addonsArr.join("\n") : "- Tidak ada"}\n\n💰 *Total Biaya:* Rp ${totalPrice.toLocaleString("id-ID")}\n\nMohon dibantu proses pembuatannya ya, terima kasih!`;
    window.open(`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <div className="bg-[#2f3b90] text-white selection:bg-white selection:text-[#2f3b90] min-h-screen">
      {/* TOP TICKER */}
      <div className="bg-[#161d52] text-white text-xs font-mono py-2.5 px-4 border-b border-white/20 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-6 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="text-amber-300">✦</span> THE DREAM WEDDING STATIONERY SUITE
          </span>
          <span className="hidden md:inline">• BEBAS REVISI SEPUASNYA</span>
          <span className="hidden lg:inline">• MASA AKTIF 1 TAHUN PENUH</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-bold">
          <span className="text-white/80">ID / IDR</span>
          <a
            href={`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent("Halo Admin Bluevite, saya ingin konsultasi undangan digital")}`}
            target="_blank"
            className="hover:text-amber-300 transition flex items-center gap-1"
          >
            <Phone className="w-3 h-3" /> +62 822-2355-1205
          </a>
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#2f3b90]/95 backdrop-blur-md border-b-2 border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#161d52] border-2 border-white font-serifLuxury text-xl text-[#2f3b90] font-bold">
              ✦
            </div>
            <div>
              <span className="font-display text-2xl tracking-wider text-white flex items-center gap-1 font-bold">
                CONCRETE BLOOM<span className="text-amber-300">.ID</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-blue-200 uppercase block -mt-1 font-bold">Wedding Dream</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 font-mono text-xs font-bold tracking-wide">
            <a href="#about" className="text-white hover:text-amber-300 transition">TENTANG</a>
            <a href="#catalog" className="text-white hover:text-amber-300 transition">KATALOG TEMA</a>
            <a href="#features" className="text-white hover:text-amber-300 transition">FITUR UNGGULAN</a>
            <a href="#pricing" className="text-white hover:text-amber-300 transition">PAKET HARGA</a>
            <a href="#faq" className="text-white hover:text-amber-300 transition">FAQ</a>
          </nav>

          <a
            href={`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent("Halo Admin Bluevite, saya ingin konsultasi undangan")}`}
            target="_blank"
            className="btn-pop-white py-2.5 px-5 rounded-xl text-xs uppercase font-display tracking-wider"
          >
            <MessageCircle className="w-4 h-4 text-[#2f3b90]" />
            <span>Konsultasi WA</span>
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-14 pb-20 overflow-hidden bg-gradient-to-b from-[#2f3b90] via-[#242f78] to-[#161d52]">
        <div className="absolute inset-0 halftone-ultramarine opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/40 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-white">
              <span className="text-amber-300">✦</span>
              <span>THE NEW STANDARD OF CONTEMPORARY WEDDING INVITATIONS</span>
            </div>
            <span className="text-xs font-mono text-white/90">⭐️ 4.9/5 dari 4.800+ Pasangan Bahagia</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 text-left space-y-6">
              <h1 className="font-serifLuxury text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight drop-shadow-xl">
                PAKET <br />
                <span className="font-display font-black text-white">UNDANGAN</span> <br />
                <span className="inline-block bg-white text-[#2f3b90] px-5 py-1 mt-2 rounded-2xl border-2 border-white shadow-[6px_6px_0px_#161d52] -rotate-1 font-serifLuxury italic font-normal">
                  PERNIKAHAN IMPIAN.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-blue-100 max-w-xl font-normal leading-relaxed font-sans">
                Wujudkan momen sakral terindah Kalian dengan undangan digital berbasis website Effortlessly Expressive, Cantik &amp; Berani Mengekspresikan Diri yang memukau para tamu undangan.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="#catalog" className="btn-pop-white py-3.5 px-7 rounded-2xl text-sm font-display uppercase tracking-wider shadow-[5px_5px_0px_#161d52]">
                  <BookOpen className="w-5 h-5" />
                  <span>Jelajahi Katalog Tema</span>
                </a>
                <button
                  onClick={() => openDemo("royal-ultramarine-01")}
                  className="btn-pop-dark py-3.5 px-6 rounded-2xl text-sm font-display uppercase tracking-wider shadow-[5px_5px_0px_#ffffff]"
                >
                  <Smartphone className="w-5 h-5 text-amber-300" />
                  <span>Coba Demo Interaktif</span>
                </button>
              </div>

              <div className="pt-6 border-t border-white/20 grid grid-cols-3 gap-4 max-w-lg">
                <StatCounter target={4890} label="Undangan Dibuat" />
                <StatCounter target={325000} label="Tamu Tersebar" />
                <StatCounter target={98400} label="Doa Restu Masuk" />
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              <div
                className="absolute -top-4 -right-2 px-4 py-2.5 rounded-2xl z-20 font-display text-xs uppercase cursor-pointer hover:scale-105 transition bg-amber-400 text-black border-2 border-black shadow-[3px_3px_0px_#000]"
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-amber-900">✦</span>
                  <span>ROYAL SUITE</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 z-20 bg-white text-[#2f3b90] border-2 border-white px-4 py-2 rounded-xl font-display text-xs uppercase shadow-[4px_4px_0px_#161d52] rotate-[-6deg] font-bold">
                ✨ Unlimited Revisions
              </div>

              <div className="pop-card-ultramarine rounded-3xl p-6 w-full max-w-md relative overflow-hidden bg-gradient-to-b from-[#2f3b90] to-[#161d52]">
                <div className="relative rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                    alt="Preview Undangan Digital"
                    className="w-full h-84 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5 text-left">
                    <span className="inline-block bg-white text-[#2f3b90] text-[10px] font-display font-bold px-2.5 py-0.5 rounded uppercase w-max mb-1">
                      ✦ THE ROYAL SUITE
                    </span>
                    <h3 className="font-serifLuxury text-3xl text-white font-bold tracking-wide">dr. Aisyah &amp; Rayhan</h3>
                    <p className="text-xs text-slate-300 font-mono">Minggu, 20 November 2026</p>
                    <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-white/20">
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold font-mono">
                        <Music className="w-3.5 h-3.5" />
                        <span>Audio &amp; RSVP Aktif</span>
                      </div>
                      <button onClick={() => openDemo("royal-ultramarine-01")} className="btn-pop-white py-1.5 px-3.5 rounded-lg text-xs font-bold uppercase">
                        Buka Demo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT / MANIFESTO */}
      <section id="about" className="py-20 bg-[#161d52] text-center relative border-y-2 border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <span className="font-serifLuxury italic text-2xl sm:text-3xl text-amber-300 block mb-2 font-normal">✦ CONCRETE BLOOM</span>
          <h2 className="font-serifLuxury text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight font-bold uppercase tracking-wide mb-6">
            Dibuat untuk mengabadikan momen indah kalian untuk dibagikan, dengan nuansa artistik, simple dan kehangatan.
          </h2>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-2xl mx-auto mb-8 font-sans">
            Setiap desain dirancang secara presisi dengan warna Ultramarine Blue #2F3B90, animasi mulus, dan kemudahan RSVP bagi seluruh tamu undangan Anda.
          </p>
          <a href="#catalog" className="btn-pop-white py-3 px-8 rounded-full text-xs font-display uppercase tracking-widest shadow-[4px_4px_0px_#161d52] inline-flex items-center gap-2">
            <span>JELAJAHI KOLEKSI KAMI</span>
            <ArrowRight className="w-4 h-4 text-[#2f3b90]" />
          </a>
        </div>
      </section>

      {/* 3 SHOWCASE CARDS */}
      <section className="py-20 bg-[#2f3b90] border-b-2 border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-white text-[#2f3b90] font-display text-xs uppercase rounded-md font-bold mb-2 shadow">✦ EXCITING HIGHLIGHTS</span>
            <h2 className="font-serifLuxury text-4xl sm:text-5xl text-white uppercase tracking-tight font-bold">KENAPA MEMILIH BLUEVITE ROYAL SUITE?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="pop-card-ultramarine rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#2f3b90] to-[#161d52]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serifLuxury italic text-amber-300 text-lg">Ready-to-Use</span>
                  <span className="text-[10px] font-mono bg-white text-[#2f3b90] px-2.5 py-0.5 rounded font-bold">50+ TEMA</span>
                </div>
                <h3 className="font-serifLuxury text-4xl text-white leading-none mb-4 font-bold">INSTANT THEMES DELIVERED</h3>
                <p className="text-xs text-blue-100 leading-relaxed mb-6 font-sans">
                  Pilihan tema lengkap dari Wedding Syar&apos;i, Modern Botanical, Rustic Vintage, hingga Sweet 17 siap pakai dalam hitungan jam.
                </p>
              </div>
              <div className="relative rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-slate-950 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80" alt="Instant Themes" className="w-full h-48 object-cover" />
              </div>
              <div className="text-center text-xs font-mono text-blue-200">✦ Fast &amp; Flawless Execution</div>
            </div>

            <div className="pop-card-ultramarine rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden bg-[#1e2666] halftone-ultramarine">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serifLuxury italic text-amber-300 text-lg">Romantic &amp; Chic</span>
                  <span className="text-[10px] font-mono bg-white text-[#2f3b90] px-2 py-0.5 rounded font-bold uppercase">TRENDING</span>
                </div>
                <h3 className="font-serifLuxury text-4xl text-white leading-none mb-4 font-bold">INTERACTIVE AUDIO &amp; RSVP</h3>
                <p className="text-xs text-blue-100 leading-relaxed mb-6 font-sans">
                  Dilengkapi pemutar musik dengan visualizer equalizer, formulir konfirmasi kehadiran, countdown timer hari H, dan navigasi peta.
                </p>
              </div>
              <div className="bg-[#161d52] border-2 border-white rounded-2xl p-5 text-center my-auto shadow-lg">
                <div className="flex items-center justify-center gap-1 h-8 mb-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="equalizer-bar" style={{ animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 uppercase">Seamless Wedding Experience</span>
              </div>
              <button onClick={() => openDemo("botanical-luxury-03")} className="btn-pop-white w-full py-2.5 rounded-xl text-xs font-bold uppercase mt-4">
                Lihat Contoh Live
              </button>
            </div>

            <div className="pop-card rounded-3xl p-6 flex flex-col justify-between relative bg-white text-slate-900 menu-card-clip">
              <div className="pt-2">
                <div className="flex justify-between items-center border-b-2 border-dashed border-slate-300 pb-3 mb-3">
                  <div>
                    <span className="font-serifLuxury text-xl text-[#161d52] font-bold">INVOICE PREVIEW</span>
                    <span className="text-[10px] font-mono text-slate-500 block">BLUEVITE ROYAL SUITE</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-[#2f3b90] font-bold px-2 py-1 rounded font-mono">ALL-INCLUSIVE</span>
                </div>
                <div className="space-y-2 text-xs font-mono text-slate-700 mb-4 text-left">
                  <div className="flex justify-between"><span>1x Premium Digital Web</span><span>Rp 129.000</span></div>
                  <div className="flex justify-between"><span>1x Live RSVP &amp; Ucapan</span><span className="text-emerald-600 font-bold">GRATIS</span></div>
                  <div className="flex justify-between"><span>1x Unlimited Sebar WA</span><span className="text-emerald-600 font-bold">GRATIS</span></div>
                </div>
                <div className="border-t-2 border-[#161d52] pt-3 flex justify-between items-baseline mb-4">
                  <span className="font-bold text-xs uppercase font-mono">TOTAL ESTIMASI:</span>
                  <span className="font-display text-3xl text-[#2f3b90] font-bold">Rp 129.000</span>
                </div>
                <div className="barcode-strip w-full justify-center border border-slate-300 rounded mb-4">
                  {[3, 1, 4, 2, 5, 2, 1, 4, 2, 3, 1, 5, 2, 3, 1].map((w, i) => (
                    <span key={i} style={{ width: `${w}px` }} />
                  ))}
                </div>
              </div>
              <a href="#pricing" className="btn-pop-dark w-full py-2.5 rounded-xl text-xs font-bold uppercase">
                Pesan Sekarang
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog" className="py-20 bg-[#161d52] border-b-2 border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-block px-3 py-1 bg-white text-[#2f3b90] font-display text-xs uppercase rounded-md font-bold mb-2 shadow">✦ KOLEKSI TEMA LENGKAP</span>
            <h2 className="font-serifLuxury text-4xl sm:text-5xl md:text-6xl text-white uppercase tracking-tight font-bold">PILIH TEMA UNDANGAN FAVORIT ANDA</h2>
            <p className="text-sm text-blue-200 mt-2 font-sans">Seluruh tema dapat disesuaikan foto prewedding, font, susunan acara, dan backsound lagu pilihan Anda.</p>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border-2 border-white/20 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setCurrentCategory(tab.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono shrink-0 transition ${
                    currentCategory === tab.value ? "bg-white text-[#2f3b90] border-2 border-white shadow" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <div className="relative w-full md:w-56">
                <input
                  type="text"
                  placeholder="Cari nama tema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-slate-900 pl-9 pr-3 py-2 rounded-xl text-xs font-medium border-2 border-white focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white text-slate-900 px-3 py-2 rounded-xl text-xs font-bold border-2 border-white focus:outline-none shrink-0"
              >
                <option value="popular">Terpopuler</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="col-span-full py-16 text-center text-white/80 font-mono text-sm bg-[#161d52]/60 rounded-3xl border border-white/20">
              <Star className="w-8 h-8 text-amber-300 mx-auto mb-2" />
              <span>Tidak ditemukan tema yang cocok dengan pencarian Anda.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((t) => (
                <TemplateCard key={t.id} t={t} onDemo={() => openDemo(t.id)} onOrder={() => orderSingleTemplate(t)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-[#2f3b90] border-b-2 border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 bg-white text-[#2f3b90] font-display text-xs uppercase rounded-md font-bold mb-2 shadow">✦ FITUR LENGKAP &amp; TERBAIK</span>
            <h2 className="font-serifLuxury text-4xl sm:text-5xl md:text-6xl text-white uppercase tracking-tight font-bold">SEMUA YANG ANDA BUTUHKAN DALAM 1 UNDANGAN</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="pop-card bg-white p-6 rounded-2xl text-left">
                <div className={`w-12 h-12 rounded-xl ${f.bg} text-white flex items-center justify-center mb-4 shadow`}>{f.icon}</div>
                <h3 className="font-serifLuxury text-2xl text-slate-900 font-bold mb-1">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 bg-[#161d52] border-b-2 border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 bg-white text-[#2f3b90] font-display text-xs uppercase rounded-md font-bold mb-2 shadow">✦ TRANSPARAN TANPA BIAYA TERSEMBUNYI</span>
            <h2 className="font-serifLuxury text-4xl sm:text-5xl md:text-6xl text-white uppercase tracking-tight font-bold">PILIHAN PAKET &amp; KALKULATOR HARGA</h2>
            <p className="text-sm text-blue-100 mt-2 font-sans">Pilih paket dasar, centang fitur tambahan sesuai kebutuhan Anda, dan lakukan pemesanan instan via WhatsApp.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {PACKAGES_DATA.map((pkg) => {
              const isSelected = pkg.id === selectedPackageId;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`cursor-pointer transition-all duration-300 ${
                    pkg.isFeatured ? "pop-card bg-white text-slate-900 border-4 border-amber-400 shadow-2xl relative scale-105" : "pop-card bg-white text-slate-900"
                  } rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-left`}
                >
                  <div>
                    {pkg.badge ? (
                      <span className="inline-block px-3 py-1 bg-amber-400 text-black text-[10px] font-mono font-bold uppercase rounded-full border border-black shadow mb-3">
                        {pkg.badge}
                      </span>
                    ) : (
                      <span className="inline-block h-6 mb-3" />
                    )}
                    <h3 className="font-serifLuxury text-3xl font-bold text-[#161d52]">{pkg.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">{pkg.description}</p>
                    <div className="mb-6">
                      <span className="text-xs text-slate-400 line-through font-mono">Rp {pkg.priceOriginal.toLocaleString("id-ID")}</span>
                      <div className="font-display text-4xl text-[#2f3b90] font-bold">Rp {pkg.price.toLocaleString("id-ID")}</div>
                    </div>
                    <div className="space-y-2.5 text-xs text-slate-700 font-sans border-t border-slate-100 pt-4">
                      {pkg.features.map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#2f3b90] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className={`w-full mt-6 ${isSelected ? "btn-pop-dark" : "btn-pop-white"} py-3 rounded-xl text-xs font-bold uppercase tracking-wider`}>
                    {isSelected ? "✓ Paket Terpilih" : "Pilih Paket Ini"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pop-card bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl">
            <div className="border-b border-slate-200 pb-4 mb-6 text-left">
              <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-[#2f3b90] text-[10px] font-mono font-bold uppercase rounded mb-1">KUSTOMISASI TAMBAHAN</span>
              <h3 className="font-serifLuxury text-3xl text-[#161d52] font-bold">Add-ons &amp; Kalkulator Harga Live</h3>
              <p className="text-xs text-slate-600 font-sans">Centang fitur tambahan di bawah untuk menghitung total biaya secara otomatis:</p>
            </div>

            <div className="space-y-3 mb-8">
              {ADDONS_DATA.map((addon) => {
                const isChecked = selectedAddonIds.has(addon.id);
                return (
                  <label
                    key={addon.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                      isChecked ? "bg-blue-50 border-[#2f3b90]" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <input type="checkbox" checked={isChecked} onChange={() => toggleAddon(addon.id)} className="w-4 h-4 text-[#2f3b90] rounded focus:ring-0 cursor-pointer" />
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{addon.name}</span>
                        <span className="text-[11px] text-slate-500 font-sans">{addon.desc}</span>
                      </div>
                    </div>
                    <span className="font-display text-sm font-bold text-[#2f3b90] shrink-0 ml-4 font-mono">+Rp {addon.price.toLocaleString("id-ID")}</span>
                  </label>
                );
              })}
            </div>

            <div className="bg-slate-50 border-2 border-[#161d52] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <span className="text-xs font-mono text-slate-500 uppercase block font-bold">Rincian Terpilih:</span>
                <div className="font-bold text-sm text-slate-900 font-sans">
                  <span>{selectedPackage.name}</span> • <span className="text-[#2f3b90]">{selectedAddonIds.size} Fitur Tambahan</span>
                </div>
                <div className="font-display text-4xl text-[#2f3b90] font-bold mt-1">Rp {totalPrice.toLocaleString("id-ID")}</div>
              </div>
              <button onClick={checkoutViaWhatsApp} className="btn-pop-white py-4 px-8 rounded-2xl text-sm font-display uppercase tracking-wider shadow-[5px_5px_0px_#161d52] w-full sm:w-auto shrink-0">
                <MessageCircle className="w-5 h-5 text-[#2f3b90]" />
                <span>Pesan Sekarang via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#2f3b90] border-b-2 border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-white text-[#2f3b90] font-display text-xs uppercase rounded-md font-bold mb-2 shadow">✦ PANDUAN &amp; BANTUAN</span>
            <h2 className="font-serifLuxury text-4xl sm:text-5xl text-white uppercase tracking-tight font-bold">PERTANYAAN YANG SERING DIAJUKAN (FAQ)</h2>
          </div>

          <div className="space-y-4 text-left">
            {FAQS.map((faq, idx) => (
              <div key={faq.q} className="pop-card bg-white rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-serifLuxury text-lg font-bold">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#2f3b90] transition-transform duration-300 shrink-0 ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed font-sans">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#161d52] text-white pt-12 pb-8 border-t-4 border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-left">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white text-[#2f3b90] font-bold flex items-center justify-center rounded-lg font-serifLuxury">✦</div>
                <span className="font-display text-2xl tracking-wider text-white font-bold">
                  CONCRETE BLOOM<span className="text-amber-300">.ID</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-sm leading-relaxed font-sans">
                Platform pembuatan undangan digital website premium #1 di Indonesia dengan tema Ultramarine Blue #2F3B90 &amp; Pure White yang anggun dan berkelas.
              </p>
              <div className="flex items-center gap-3 text-amber-300">
                <Camera className="w-5 h-5" />
                <ThumbsUp className="w-5 h-5" />
                <PlayCircle className="w-5 h-5" />
              </div>
            </div>

            <div>
              <h4 className="font-serifLuxury text-lg text-amber-300 font-bold mb-3">KATEGORI TEMA</h4>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li><a href="#catalog" className="hover:text-white">Royal Modern Wedding</a></li>
                <li><a href="#catalog" className="hover:text-white">Wedding Syar&apos;i (Islami)</a></li>
                <li><a href="#catalog" className="hover:text-white">Emerald Botanical Glasshouse</a></li>
                <li><a href="#catalog" className="hover:text-white">Sweet 17 / Birthday Party</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serifLuxury text-lg text-amber-300 font-bold mb-3">HUBUNGI KAMI</h4>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li>WhatsApp: +62 822-2355-1205</li>
                <li>Jam Layanan: 08:00 - 22:00 WIB</li>
                <li>Email: hello@bluevite.id</li>
                <li>Jakarta &amp; Surabaya, Indonesia</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-4 pt-6 border-t border-white/10">
            <span>© 2026 BLUEVITE.ID - All Rights Reserved.</span>
            <span>Crafted in Ultramarine Blue #2F3B90 &amp; Pure White.</span>
          </div>
        </div>
      </footer>

      {/* FLOATING WA BUTTON */}
      <a
        href={`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent("Halo Admin Bluevite, saya tertarik dengan undangan digital")}`}
        target="_blank"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-3.5 rounded-full border-2 border-white shadow-[4px_4px_0px_#161d52] flex items-center gap-2 transition hover:scale-105 active:scale-95 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-bold text-xs font-mono">
          Chat Admin WA
        </span>
      </a>

      {/* TOAST (sederhana, placeholder untuk demo) */}
      {toastMsg && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#161d52] text-white text-xs font-mono px-4 py-3 rounded-xl border border-white/10 shadow-xl max-w-xs">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

/**
 * CATATAN:
 *
 * 1. MODAL SIMULATOR HP (dulu di-trigger tombol "Coba Demo Interaktif" / "Demo")
 *    SENGAJA belum dikonversi — nunggu file simulator.js diupload. Untuk sekarang
 *    tombolnya cuma munculkan toast placeholder lewat fungsi openDemo().
 *
 * 2. Data INVITATION_TEMPLATES, PACKAGES_DATA, ADDONS_DATA di atas masih hardcode
 *    di file ini (duplikat dengan yang ada di dashboard-admin/page.tsx). Idealnya
 *    nanti dipindah ke satu file bersama (misal frontend/lib/data.ts) yang di-import
 *    di semua halaman, dan ujung-ujungnya fetch dari API Laravel — supaya kalau
 *    admin ubah harga/tema di dashboard-admin, otomatis berubah juga di landing page.
 */