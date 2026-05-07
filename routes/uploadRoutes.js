const router = require('express').Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadToDrive } = require('../services/googleDriveService');
const { todayKey } = require('../utils/helpers');

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const rombelId = req.user.user_metadata.rombel_id;
  const result = await uploadToDrive({ file: req.file, rombelId, studentId: req.user.id, dateKey: todayKey() });
  res.json(result);
});

module.exports = router;
