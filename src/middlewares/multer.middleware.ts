import multer from 'multer';
import path from 'path';
import slugify from 'slugify';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'public'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '__' + slugify(file.originalname));
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/gif' && file.mimetype !== 'image/jpeg')
      return cb(null, false);
    cb(null, true);
  },
  limits: {
    fileSize: 8388608
  }
});