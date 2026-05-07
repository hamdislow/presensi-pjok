function todayKey() { return new Date().toISOString().slice(0, 10); }
function sanitizeText(s = '') { return String(s).replace(/[<>]/g, '').trim(); }
module.exports = { todayKey, sanitizeText };
