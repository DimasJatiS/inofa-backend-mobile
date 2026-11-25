import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, '../../uploads');

function ensureUploadDirExists(): void {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (error) {
    // On serverless platforms, writing outside /tmp can throw; avoid crashing at import time.
    throw error;
  }
}

// Ekstensi dari MIME yang diizinkan: nama file pengirim bisa berakhiran .html dan disajikan sebagai halaman.
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      ensureUploadDirExists();
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = EXT_BY_MIME[file.mimetype];
    cb(null, 'img-' + uniqueSuffix + ext);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype in EXT_BY_MIME) {
    cb(null, true);
  } else {
    cb(Object.assign(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'), { status: 400 }));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Upload single image
router.post('/image', authMiddleware, upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
    });
  }
});

export default router;
