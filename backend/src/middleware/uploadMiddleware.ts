import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { ApiError } from '../utils/apiError';

// Ensure uploads directory exists
if (!fs.existsSync(config.upload.uploadDir)) {
  fs.mkdirSync(config.upload.uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
  'image/tif',
  'image/x-tiff',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.svs'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const safeName = `biopsy-${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mimeType) || mimeType.startsWith('image/');
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid image format (${ext || mimeType}). Only histology images (JPEG, PNG, TIFF, WebP, SVS) are accepted.`,
        'INVALID_FILE_TYPE'
      )
    );
  }
};

export const uploadBiopsyImage = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSize,
    files: 1,
  },
  fileFilter,
});
