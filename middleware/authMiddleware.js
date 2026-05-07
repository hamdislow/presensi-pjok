const { supabase } = require('../services/supabaseService');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ message: 'Invalid token' });
  req.user = data.user;
  next();
}

module.exports = { requireAuth };
