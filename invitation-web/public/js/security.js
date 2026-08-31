/**
 * BLUEVITE SECURITY ENGINE (Anti-Hacker & Enterprise Defense)
 * - SHA-256 Cryptographic Hashing (Web Crypto API)
 * - Anti-Brute-Force Rate Limiter & Lockout Guard
 * - Strict Anti-XSS (Cross-Site Scripting) & SQLi Sanitizer
 * - Cryptographic Random Session Token Generator with Expiry
 */

class BlueviteSecurity {
  constructor() {
    this.LOCKOUT_KEY_PREFIX = "bluevite_sec_lockout_";
    this.MAX_FAILED_ATTEMPTS = 5;
    this.LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes lockout
  }

  // --- 1. SHA-256 CRYPTOGRAPHIC HASH (Web Crypto API) ---
  async hashPassword(plainText, salt = "bluevite_salt_2026") {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(plainText + salt);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      return hashHex;
    } catch (e) {
      // Fallback simple hash for older environments
      let hash = 0;
      const str = plainText + salt;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return "fb_" + Math.abs(hash).toString(16);
    }
  }

  // --- 2. ANTI-BRUTE-FORCE & RATE-LIMITING ---
  checkRateLimit(scope) {
    const key = this.LOCKOUT_KEY_PREFIX + scope;
    const raw = localStorage.getItem(key);
    if (!raw) return { allowed: true, attemptsLeft: this.MAX_FAILED_ATTEMPTS };

    const state = JSON.parse(raw);
    const now = Date.now();

    if (state.lockedUntil && now < state.lockedUntil) {
      const remainingSeconds = Math.ceil((state.lockedUntil - now) / 1000);
      return { 
        allowed: false, 
        locked: true, 
        remainingSeconds: remainingSeconds,
        message: `⛔ Akses diblokir sementara karena ${this.MAX_FAILED_ATTEMPTS}x percobaan gagal. Coba lagi dalam ${Math.ceil(remainingSeconds / 60)} menit.`
      };
    }

    // Reset if lockout period expired
    if (state.lockedUntil && now >= state.lockedUntil) {
      localStorage.removeItem(key);
      return { allowed: true, attemptsLeft: this.MAX_FAILED_ATTEMPTS };
    }

    const attemptsLeft = Math.max(0, this.MAX_FAILED_ATTEMPTS - (state.failedAttempts || 0));
    return { allowed: true, attemptsLeft: attemptsLeft };
  }

  recordFailedAttempt(scope) {
    const key = this.LOCKOUT_KEY_PREFIX + scope;
    const raw = localStorage.getItem(key);
    const now = Date.now();
    let state = raw ? JSON.parse(raw) : { failedAttempts: 0 };

    state.failedAttempts = (state.failedAttempts || 0) + 1;
    state.lastAttempt = now;

    if (state.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      state.lockedUntil = now + this.LOCKOUT_DURATION_MS;
    }

    localStorage.setItem(key, JSON.stringify(state));
    return this.checkRateLimit(scope);
  }

  resetFailedAttempts(scope) {
    localStorage.removeItem(this.LOCKOUT_KEY_PREFIX + scope);
  }

  // --- 3. INPUT SANITIZATION (ANTI-XSS & ANTI-INJECTION) ---
  sanitizeInput(input) {
    if (typeof input !== "string") return input;

    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .replace(/data:/gi, "")
      .trim();
  }

  sanitizeObject(obj) {
    if (!obj || typeof obj !== "object") return obj;
    const sanitized = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        sanitized[key] = this.sanitizeInput(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  // --- 4. CRYPTOGRAPHIC SESSION TOKEN & EXPIRY ---
  generateSecureToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
  }

  createSession(payload, maxAgeHours = 4) {
    const token = this.generateSecureToken();
    const expiresAt = Date.now() + (maxAgeHours * 60 * 60 * 1000);
    return {
      token: token,
      payload: payload,
      expiresAt: expiresAt,
      created: Date.now()
    };
  }

  validateSession(sessionObj) {
    if (!sessionObj || !sessionObj.expiresAt || !sessionObj.token) return false;
    if (Date.now() > sessionObj.expiresAt) return false;
    return true;
  }
}

// Global Security Singleton Instance
window.BlueviteSecurity = new BlueviteSecurity();
