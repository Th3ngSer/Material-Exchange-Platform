import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { diskStorage, type Options as MulterOptions } from 'multer';
import { v4 as uuidv4 } from 'uuid';

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const maxImageSize = 5 * 1024 * 1024;
const maxImageCount = 10;

function ensureUploadDirectory() {
  const uploadDir = join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}

export function createPostUploadOptions(): MulterOptions {
  const uploadDir = ensureUploadDirectory();

  return {
    storage: diskStorage({
      destination: (_req, _file, callback) => callback(null, uploadDir),
      filename: (_req, file, callback) => {
        callback(null, `${uuidv4()}${extname(file.originalname).toLowerCase()}`);
      },
    }),
    limits: {
      fileSize: maxImageSize,
      files: maxImageCount,
    },
    fileFilter: (_req, file, callback) => {
      if (!allowedImageTypes.has(file.mimetype)) {
        callback(null, false);
        return;
      }

      callback(null, true);
    },
  };
}
