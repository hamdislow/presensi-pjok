const multer = require('multer');
const maxSize = (parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10)) * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/', 'application/pdf'];
    if (!allowed.some((x) => file.mimetype.startsWith(x))) return cb(new Error('Invalid file type'));
    cb(null, true);
  }
});

module.exports = { upload };
