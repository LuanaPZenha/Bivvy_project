'use strict';

const multer = require('multer');
const { ALLOWED_MIME } = require('../../../infrastructure/storage/LocalImageStore');

const maxBytes = Number(process.env.UPLOAD_MAX_BYTES) || 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      const err = new Error('Only JPEG, PNG, and WebP images are allowed');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

module.exports = { upload, listingImageUpload: upload.single('image') };
