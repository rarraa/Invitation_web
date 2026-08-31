/**
 * BLUEVITE DATABASE ENGINE (Local & Cloud Sync Adapter with Security Layer)
 * Handles sanitized & persistent storage for Invitations, Guests, Wishes, and Orders.
 */

class BlueviteDatabase {
  constructor() {
    this.STORAGE_KEYS = {
      INVITATIONS: "bluevite_invitations",
      GUESTS: "bluevite_guests",
      WISHES: "bluevite_wishes",
      ORDERS: "bluevite_orders",
      AUTH_CLIENT: "bluevite_session_client",
      AUTH_ADMIN: "bluevite_session_admin"
    };

    this.initDefaultData();
  }

  initDefaultData() {
    // 1. Invitations / Accounts
    if (!localStorage.getItem(this.STORAGE_KEYS.INVITATIONS)) {
      const defaultInvitations = [
        {
          id: "inv-01",
          passcode: "RAYHAN-AISYAH",
          phone: "081234567890",
          slug: "rayhan-aisyah",
          url: "https://bluevite.id/v/rayhan-aisyah",
          bride: "dr. Aisyah Humaira, Sp.A",
          groom: "Muhammad Rayhan, S.T",
          eventDate: "2026-11-20T08:00:00",
          eventDateFormatted: "Minggu, 20 November 2026",
          akadTime: "08:00 - 10:00 WIB",
          resepsiTime: "11:00 - 14:00 WIB",
          locationName: "Grand Ballroom Hotel Mulia Senayan",
          locationAddress: "Jl. Asia Afrika No. 6, Senayan, Jakarta Pusat",
          mapsUrl: "https://maps.google.com/?q=Hotel+Mulia+Senayan",
          package: "Paket Premium Royal Suite",
          activeUntil: "20 November 2027",
          status: "LIVE ONLINE",
          customDomain: "rayhan-aisyah.com",
          accounts: [
            { bank: "BCA", number: "8830192841", name: "Muhammad Rayhan" },
            { bank: "Bank Syariah Indonesia (BSI)", number: "7192840192", name: "Aisyah Humaira" }
          ]
        },
        {
          id: "inv-02",
          passcode: "KEVIN-JESSICA",
          phone: "085712345678",
          slug: "kevin-jessica",
          url: "https://bluevite.id/v/kevin-jessica",
          bride: "Jessica Clarissa, B.A",
          groom: "Kevin Alexander, B.Eng",
          eventDate: "2026-12-12T10:00:00",
          eventDateFormatted: "Sabtu, 12 Desember 2026",
          akadTime: "10:00 - 11:30 WIB",
          resepsiTime: "18:00 - 21:00 WIB",
          locationName: "The Glass House Pavilion Kuningan",
          locationAddress: "Mega Kuningan Barat III No. 5, Jakarta Selatan",
          mapsUrl: "https://maps.google.com/?q=Mega+Kuningan+Jakarta",
          package: "Paket Eksklusif Custom Domain",
          activeUntil: "12 Desember 2027",
          status: "LIVE ONLINE",
          customDomain: "kevinjessicawedding.com",
          accounts: [
            { bank: "BCA", number: "5221394810", name: "Kevin Alexander" }
          ]
        }
      ];
      this.save(this.STORAGE_KEYS.INVITATIONS, defaultInvitations);
    }

    // 2. Guests Table
    if (!localStorage.getItem(this.STORAGE_KEYS.GUESTS)) {
      const defaultGuests = [
        { id: 1, invitationId: "inv-01", name: "Bpk. H. Sukirno & Ibu Hj. Marwah", group: "Keluarga", phone: "081234567890", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 3, checkin: false },
        { id: 2, invitationId: "inv-01", name: "Dra. Siti Nurhaliza, M.Pd", group: "Kolega Kantor", phone: "085712345678", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 1, checkin: false },
        { id: 3, invitationId: "inv-01", name: "Rian Hidayat & Partner", group: "Sahabat Kuliah", phone: "089612349876", status: "Sudah Terkirim", opened: false, rsvp: "Ragu-ragu", count: 0, checkin: false },
        { id: 4, invitationId: "inv-01", name: "dr. Andika Pratama, Sp.PD", group: "VIP Guest", phone: "081398765432", status: "Draft", opened: false, rsvp: "Belum Mengisi", count: 0, checkin: false },
        { id: 5, invitationId: "inv-01", name: "Ir. Bambang Trihatmodjo", group: "VIP Guest", phone: "081198765432", status: "Sudah Terkirim", opened: true, rsvp: "Hadir", count: 2, checkin: true, checkinTime: "08:15 WIB" },
        { id: 6, invitationId: "inv-01", name: "Fathur Rahman, S.Kom", group: "Sahabat Kuliah", phone: "082188765432", status: "Draft", opened: false, rsvp: "Belum Mengisi", count: 0, checkin: false }
      ];
      this.save(this.STORAGE_KEYS.GUESTS, defaultGuests);
    }

    // 3. Wishes Table
    if (!localStorage.getItem(this.STORAGE_KEYS.WISHES)) {
      const defaultWishes = [
        { id: 1, invitationId: "inv-01", name: "Budi Santoso & Keluarga", message: "Barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fii khair. Selamat menempuh hidup baru ya, semoga sakinah mawaddah warahmah!", time: "10 menit lalu", status: "active", pinned: true, likes: 12 },
        { id: 2, invitationId: "inv-01", name: "Dr. Farah Amelia", message: "Selamat untuk kedua mempelai! Semoga cinta dan kebahagiaan selalu menyertai perjalanan kalian. Sampai ketemu di resepsi!", time: "25 menit lalu", status: "active", pinned: false, likes: 8 },
        { id: 3, invitationId: "inv-01", name: "Rendra & Team Creative", message: "Happy wedding Rayhan & Aisyah! Lancar sampai hari H ya kawan!", time: "1 jam lalu", status: "active", pinned: false, likes: 5 }
      ];
      this.save(this.STORAGE_KEYS.WISHES, defaultWishes);
    }

    // 4. Orders Table (Admin)
    if (!localStorage.getItem(this.STORAGE_KEYS.ORDERS)) {
      const defaultOrders = [
        { orderId: "BLV-2026-0891", clientName: "Muhammad Rayhan & Aisyah", phone: "081234567890", template: "The Ultramarine Royal Suite", package: "Paket Premium Royal Suite", total: 179000, paymentStatus: "Lunas", workflowStatus: "Live", slug: "rayhan-aisyah", orderDate: "2026-08-28" },
        { orderId: "BLV-2026-0892", clientName: "Kevin Alexander & Jessica", phone: "085712345678", template: "Emerald Botanical Glasshouse", package: "Paket Eksklusif Custom Domain", total: 424000, paymentStatus: "Lunas", workflowStatus: "Live", slug: "kevin-jessica", orderDate: "2026-08-27" },
        { orderId: "BLV-2026-0893", clientName: "Fahri Al-Farizi & Fathiya", phone: "081398765432", template: "Pearl White Islamic Elegance", package: "Paket Basic", total: 99000, paymentStatus: "DP 50%", workflowStatus: "In Progress", slug: "fahri-fathiya", orderDate: "2026-08-29" },
        { orderId: "BLV-2026-0894", clientName: "Alyssa Valerie (Sweet 17)", phone: "089612349876", template: "Celestial Euphoria Birthday", package: "Paket Premium", total: 179000, paymentStatus: "Pending", workflowStatus: "Draft", slug: "alyssa-sweet17", orderDate: "2026-08-29" }
      ];
      this.save(this.STORAGE_KEYS.ORDERS, defaultOrders);
    }
  }

  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return [];
    }
  }

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
      return false;
    }
  }

  // --- CLIENT AUTH (With Rate Limiter & Sanitizer) ---
  loginClient(passcodeOrPhone) {
    // 1. Check Rate Limit
    const rateCheck = window.BlueviteSecurity.checkRateLimit("client_login");
    if (!rateCheck.allowed) {
      return { success: false, message: rateCheck.message };
    }

    const cleanInput = window.BlueviteSecurity.sanitizeInput(passcodeOrPhone).toUpperCase();
    const list = this.get(this.STORAGE_KEYS.INVITATIONS);
    const found = list.find(inv => 
      inv.passcode.toUpperCase() === cleanInput || 
      inv.slug.toUpperCase() === cleanInput ||
      inv.phone.replace(/[^0-9]/g, '').includes(cleanInput)
    );

    if (found) {
      window.BlueviteSecurity.resetFailedAttempts("client_login");
      const session = window.BlueviteSecurity.createSession(found, 6); // 6 hours
      localStorage.setItem(this.STORAGE_KEYS.AUTH_CLIENT, JSON.stringify(session));
      return { success: true, invitation: found };
    } else {
      const failed = window.BlueviteSecurity.recordFailedAttempt("client_login");
      const attemptsMsg = failed.attemptsLeft > 0 ? ` (Sisa percobaan: ${failed.attemptsLeft})` : "";
      return { success: false, message: `Kode Undangan atau Nomor WhatsApp tidak terdaftar!${attemptsMsg}` };
    }
  }

  getCurrentClient() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.AUTH_CLIENT);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (window.BlueviteSecurity.validateSession(session)) {
        return session.payload;
      }
      this.logoutClient();
      return null;
    } catch (e) {
      return null;
    }
  }

  logoutClient() {
    localStorage.removeItem(this.STORAGE_KEYS.AUTH_CLIENT);
  }

  // --- ADMIN AUTH (With Rate Limiter & SHA-256 Check) ---
  async loginAdmin(username, password) {
    // 1. Check Rate Limit
    const rateCheck = window.BlueviteSecurity.checkRateLimit("admin_login");
    if (!rateCheck.allowed) {
      return { success: false, message: rateCheck.message };
    }

    const cleanUser = window.BlueviteSecurity.sanitizeInput(username);
    const cleanPass = password.trim();

    // SHA-256 comparison simulation
    const passHash = await window.BlueviteSecurity.hashPassword(cleanPass);
    const expectedHash = await window.BlueviteSecurity.hashPassword("admin123");

    if (cleanUser === "admin" && passHash === expectedHash) {
      window.BlueviteSecurity.resetFailedAttempts("admin_login");
      const session = window.BlueviteSecurity.createSession({ role: "super_admin", user: "admin" }, 4); // 4 hours
      localStorage.setItem(this.STORAGE_KEYS.AUTH_ADMIN, JSON.stringify(session));
      return { success: true };
    } else {
      const failed = window.BlueviteSecurity.recordFailedAttempt("admin_login");
      const attemptsMsg = failed.attemptsLeft > 0 ? ` (Sisa percobaan: ${failed.attemptsLeft})` : "";
      return { success: false, message: `Kredensial Admin Salah!${attemptsMsg}` };
    }
  }

  getCurrentAdmin() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.AUTH_ADMIN);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (window.BlueviteSecurity.validateSession(session)) {
        return session.payload;
      }
      this.logoutAdmin();
      return null;
    } catch (e) {
      return null;
    }
  }

  logoutAdmin() {
    localStorage.removeItem(this.STORAGE_KEYS.AUTH_ADMIN);
  }

  // --- GUEST METHODS (Sanitized) ---
  getGuestsByInvitation(invId) {
    const list = this.get(this.STORAGE_KEYS.GUESTS);
    return list.filter(g => g.invitationId === invId);
  }

  addGuest(guestObj) {
    const sanitizedGuest = window.BlueviteSecurity.sanitizeObject(guestObj);
    const list = this.get(this.STORAGE_KEYS.GUESTS);
    sanitizedGuest.id = Date.now();
    list.unshift(sanitizedGuest);
    this.save(this.STORAGE_KEYS.GUESTS, list);
    return sanitizedGuest;
  }

  updateGuest(id, updateData) {
    const sanitizedUpdate = window.BlueviteSecurity.sanitizeObject(updateData);
    const list = this.get(this.STORAGE_KEYS.GUESTS);
    const idx = list.findIndex(g => g.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...sanitizedUpdate };
      this.save(this.STORAGE_KEYS.GUESTS, list);
      return list[idx];
    }
    return null;
  }

  deleteGuest(id) {
    let list = this.get(this.STORAGE_KEYS.GUESTS);
    list = list.filter(g => g.id !== id);
    this.save(this.STORAGE_KEYS.GUESTS, list);
  }

  // --- WISHES METHODS (Sanitized) ---
  getWishesByInvitation(invId) {
    const list = this.get(this.STORAGE_KEYS.WISHES);
    return list.filter(w => w.invitationId === invId);
  }

  addWish(wishObj) {
    const sanitizedWish = window.BlueviteSecurity.sanitizeObject(wishObj);
    const list = this.get(this.STORAGE_KEYS.WISHES);
    sanitizedWish.id = Date.now();
    sanitizedWish.likes = sanitizedWish.likes || 0;
    sanitizedWish.status = sanitizedWish.status || "active";
    list.unshift(sanitizedWish);
    this.save(this.STORAGE_KEYS.WISHES, list);
    return sanitizedWish;
  }

  // --- ORDERS METHODS (Sanitized) ---
  getOrders() {
    return this.get(this.STORAGE_KEYS.ORDERS);
  }

  addOrder(orderObj) {
    const sanitizedOrder = window.BlueviteSecurity.sanitizeObject(orderObj);
    const list = this.get(this.STORAGE_KEYS.ORDERS);
    list.unshift(sanitizedOrder);
    this.save(this.STORAGE_KEYS.ORDERS, list);
    return sanitizedOrder;
  }

  updateOrderStatus(orderId, workflowStatus, paymentStatus) {
    const list = this.get(this.STORAGE_KEYS.ORDERS);
    const found = list.find(o => o.orderId === orderId);
    if (found) {
      if (workflowStatus) found.workflowStatus = window.BlueviteSecurity.sanitizeInput(workflowStatus);
      if (paymentStatus) found.paymentStatus = window.BlueviteSecurity.sanitizeInput(paymentStatus);
      this.save(this.STORAGE_KEYS.ORDERS, list);
      return found;
    }
    return null;
  }
}

// Global Singleton DB Instance
window.BlueviteDB = new BlueviteDatabase();
