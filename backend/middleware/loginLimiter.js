const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map();

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

module.exports = function loginLimiter(req, res, next) {
  const ip = clientIp(req);
  const now = Date.now();
  let rec = attempts.get(ip);

  if (!rec || now - rec.windowStart > WINDOW_MS) {
    rec = { count: 0, windowStart: now };
  }

  rec.count += 1;
  attempts.set(ip, rec);

  if (attempts.size > 2000) {
    for (const [key, value] of attempts) {
      if (now - value.windowStart > WINDOW_MS) attempts.delete(key);
    }
  }

  if (rec.count > MAX_ATTEMPTS) {
    return res.status(429).json({
      message: 'Demasiados intentos. Intente más tarde.'
    });
  }

  next();
};
