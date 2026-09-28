/**
 * Login Brute-Force Protection Middleware
 * Tracks failed login attempts per IP address and enforces temporary lockout
 * after exceeding the maximum allowed failures (5 attempts → 15 min lockout).
 */
const failedAttempts = new Map(); // key: IP → value: { count, lockedUntil }

// Cleanup stale entries every 30 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of failedAttempts.entries()) {
    if (record.lockedUntil && now >= record.lockedUntil + 60 * 60 * 1000) {
      failedAttempts.delete(ip);
    }
  }
}, 30 * 60 * 1000);

const loginProtection = (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const record = failedAttempts.get(ip);

  // Check if IP is currently locked out
  if (record && record.lockedUntil && Date.now() < record.lockedUntil) {
    const minutesLeft = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return res.status(429).json({
      error: `Account temporarily locked due to too many failed login attempts. Try again in ${minutesLeft} minute(s).`,
      lockedUntil: new Date(record.lockedUntil).toISOString(),
    });
  }

  // Reset if lock has expired
  if (record && record.lockedUntil && Date.now() >= record.lockedUntil) {
    failedAttempts.delete(ip);
  }

  // Track response status after controller finishes
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Failed login (401 response)
    if (res.statusCode === 401) {
      const r = failedAttempts.get(ip) || { count: 0, lockedUntil: null };
      r.count++;
      if (r.count >= 5) {
        r.lockedUntil = Date.now() + 15 * 60 * 1000; // 15-minute lockout
        r.count = 0;
        console.warn(`🔒 Login lockout triggered for IP: ${ip} (too many failed attempts)`);
      }
      failedAttempts.set(ip, r);
    }
    // Successful login (200 response) → reset counter
    else if (res.statusCode === 200) {
      failedAttempts.delete(ip);
    }

    return originalJson(body);
  };

  next();
};

module.exports = loginProtection;
