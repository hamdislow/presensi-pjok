const router = require('express').Router();
const ExcelJS = require('exceljs');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRoles, enforceRombel } = require('../middleware/roleMiddleware');
const { supabaseAdmin } = require('../services/supabaseService');
const { sanitizeText } = require('../utils/helpers');
const { haversineDistance } = require('../utils/distanceCalculator');

router.post('/submit', requireAuth, requireRoles('student'), async (req, res) => {
  const { session_id, status, method, latitude, longitude, notes, file_link } = req.body;
  const { data: session } = await supabaseAdmin.from('attendance_sessions').select('*').eq('id', session_id).single();
  if (!session || !session.status_open) return res.status(400).json({ message: 'Session not active' });
  let distance = null;
  if (status === 'HADIR') {
    if (!latitude || !longitude) return res.status(400).json({ message: 'GPS required for HADIR' });
    distance = haversineDistance(Number(latitude), Number(longitude), Number(session.lat_target), Number(session.long_target));
    if (distance > 500) return res.status(400).json({ message: `Outside 500m (${Math.round(distance)}m)` });
  }
  const payload = {
    student_id: req.user.id,
    rombel_id: req.user.user_metadata.rombel_id,
    session_id,
    status,
    method,
    latitude,
    longitude,
    distance_meter: distance,
    file_link,
    notes: sanitizeText(notes)
  };
  const { data, error } = await supabaseAdmin.from('attendance_logs').insert(payload).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

router.get('/logs', requireAuth, requireRoles('admin', 'pjmk'), enforceRombel, async (req, res) => {
  const rombel = req.user.user_metadata.role === 'admin' ? req.query.rombel_id : req.user.user_metadata.rombel_id;
  const { data, error } = await supabaseAdmin.from('attendance_logs').select('*').eq('rombel_id', rombel).order('created_at', { ascending: false });
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

router.get('/export/csv', requireAuth, requireRoles('admin'), async (req, res) => {
  const { data } = await supabaseAdmin.from('attendance_logs').select('*').order('created_at', { ascending: false });
  const header = Object.keys(data[0] || {}).join(',');
  const rows = data.map((row) => Object.values(row).map((x) => `"${x ?? ''}"`).join(','));
  res.setHeader('Content-Type', 'text/csv');
  res.send([header, ...rows].join('\n'));
});

router.get('/export/excel', requireAuth, requireRoles('admin'), async (req, res) => {
  const { data } = await supabaseAdmin.from('attendance_logs').select('*').order('created_at', { ascending: false });
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('attendance');
  ws.columns = Object.keys(data[0] || {}).map((k) => ({ header: k, key: k }));
  ws.addRows(data);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');
  await wb.xlsx.write(res);
  res.end();
});

module.exports = router;
