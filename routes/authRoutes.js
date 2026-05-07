const router = require('express').Router();
const { supabase } = require('../services/supabaseService');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

router.post('/logout', async (req, res) => {
  await supabase.auth.signOut();
  res.json({ message: 'Logged out' });
});

module.exports = router;
