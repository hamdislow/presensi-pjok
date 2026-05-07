const router = require('express').Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRoles, enforceRombel } = require('../middleware/roleMiddleware');
const { supabaseAdmin } = require('../services/supabaseService');

router.get('/active', requireAuth, async (req, res) => {
  const rombel = req.query.rombel_id || req.user.user_metadata?.rombel_id;
  const { data, error } = await supabaseAdmin.from('attendance_sessions').select('*').eq('rombel_id', rombel).eq('status_open', true).order('created_at', { ascending: false }).limit(1);
  if (error) return res.status(400).json({ message: error.message });
  res.json(data[0] || null);
});

router.post('/open', requireAuth, requireRoles('admin', 'pjmk'), enforceRombel, async (req, res) => {
  const body = req.body;
  const role = req.user.user_metadata.role;
  const rombel_id = role === 'admin' ? body.rombel_id : req.user.user_metadata.rombel_id;
  const payload = { rombel_id, status_open: true, lat_target: body.lat_target, long_target: body.long_target, radius_meter: body.radius_meter || 500, created_by: req.user.id };
  const { data, error } = await supabaseAdmin.from('attendance_sessions').insert(payload).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

router.post('/close/:id', requireAuth, requireRoles('admin', 'pjmk'), async (req, res) => {
  const { data, error } = await supabaseAdmin.from('attendance_sessions').update({ status_open: false }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

module.exports = router;
