// frontend/lib/auth.ts
//
// Helper untuk komunikasi dengan Laravel Sanctum (SPA cookie-based auth).
// Semua fetch di sini pakai credentials: "include" supaya cookie sesi
// otomatis terkirim/tersimpan antara Next.js (localhost:3000) dan
// Laravel (localhost:8000).

const LARAVEL_URL = "http://localhost:8000";

/**
 * Ambil satu nilai cookie by name (dipakai untuk baca XSRF-TOKEN).
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * WAJIB dipanggil sebelum login/logout — minta Laravel taruh cookie
 * XSRF-TOKEN di browser. Sanctum butuh ini untuk proteksi CSRF.
 */
export async function getCsrfCookie(): Promise<void> {
  await fetch(`${LARAVEL_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
}

/**
 * Login admin. Return { success: true, user } atau { success: false, message }.
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<{ success: true; user: any } | { success: false; message: string }> {
  await getCsrfCookie();

  const xsrfToken = getCookie("XSRF-TOKEN");

  const res = await fetch(`${LARAVEL_URL}/api/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Sanctum membaca header ini untuk verifikasi CSRF.
      ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
    },
    body: JSON.stringify({ email, password }),
  });

  if (res.ok) {
    const data = await res.json();
    return { success: true, user: data.user };
  }

  if (res.status === 422 || res.status === 401) {
    const data = await res.json().catch(() => null);
    const message =
      data?.errors?.email?.[0] || data?.message || "Email atau password salah.";
    return { success: false, message };
  }

  return { success: false, message: `Terjadi kesalahan (${res.status}). Coba lagi.` };
}

/**
 * Logout admin yang sedang login.
 */
export async function logoutAdmin(): Promise<void> {
  const xsrfToken = getCookie("XSRF-TOKEN");
  await fetch(`${LARAVEL_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
    },
  });
}

/**
 * Cek siapa yang sedang login (dipanggil saat halaman dimuat, untuk tahu
 * apakah user masih punya sesi valid atau perlu login ulang).
 */
export async function getCurrentUser(): Promise<any | null> {
  const res = await fetch(`${LARAVEL_URL}/api/me`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

// ---------------------------------------------------------------------------
// PORTAL (LOGIN KLIEN) — beda mekanisme dari admin, pakai passcode
// ---------------------------------------------------------------------------

/**
 * Login klien pakai kode undangan / nomor WA.
 */
export async function loginPortal(
  passcode: string
): Promise<{ success: true; invitation: any } | { success: false; message: string }> {
  await getCsrfCookie();
  const xsrfToken = getCookie("XSRF-TOKEN");

  const res = await fetch(`${LARAVEL_URL}/api/portal/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
    },
    body: JSON.stringify({ passcode }),
  });

  if (res.ok) {
    const data = await res.json();
    return { success: true, invitation: data.invitation };
  }

  const data = await res.json().catch(() => null);
  return {
    success: false,
    message: data?.message || "Kode Undangan atau Nomor WhatsApp tidak terdaftar!",
  };
}

/**
 * Logout klien.
 */
export async function logoutPortal(): Promise<void> {
  const xsrfToken = getCookie("XSRF-TOKEN");
  await fetch(`${LARAVEL_URL}/api/portal/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
    },
  });
}

/**
 * Cek undangan mana yang sedang login di sesi ini.
 */
export async function getCurrentInvitation(): Promise<any | null> {
  const res = await fetch(`${LARAVEL_URL}/api/portal/me`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.invitation ?? null;
}