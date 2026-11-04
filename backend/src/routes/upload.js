const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { processImage } = require('../services/imageCompression');

const router = express.Router();
const prisma = new PrismaClient();

const UPLOADS_ROOT = process.env.UPLOADS_PATH
  ? path.resolve(process.env.UPLOADS_PATH)
  : path.join(__dirname, '../../uploads');

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);
const allowedVideoTypes = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

function defaultExtension(mimetype, originalname) {
  const fromName = path.extname(originalname || '');
  if (fromName) return fromName;
  if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') return '.jpg';
  if (mimetype === 'image/png') return '.png';
  if (mimetype === 'image/webp') return '.webp';
  if (mimetype === 'image/gif') return '.gif';
  if (mimetype === 'image/heic' || mimetype === 'image/heif') return '.heic';
  if (mimetype === 'video/mp4') return '.mp4';
  if (mimetype === 'video/webm') return '.webm';
  if (mimetype === 'video/quicktime') return '.mov';
  return '.bin';
}

function isAllowedUpload(file) {
  const mimetype = (file.mimetype || '').toLowerCase();
  if (allowedImageTypes.has(mimetype) || allowedVideoTypes.has(mimetype)) {
    return true;
  }
  const name = (file.originalname || '').toLowerCase();
  if (mimetype === 'application/octet-stream' || mimetype === '') {
    return /\.(jpe?g|png|webp|gif|heic|heif|mp4|webm|mov)$/i.test(name);
  }
  return false;
}

function saveMulterFileToDisk(file) {
  const mimetype = (file.mimetype || '').toLowerCase();
  const isVideo = mimetype.startsWith('video') || /\.(mp4|webm|mov)$/i.test(file.originalname || '');
  const folder = isVideo ? 'videos' : 'images';
  const uploadPath = path.join(UPLOADS_ROOT, folder);
  fs.mkdirSync(uploadPath, { recursive: true });

  const ext = defaultExtension(mimetype, file.originalname);
  const filename = `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const fullPath = path.join(uploadPath, filename);

  if (!file.buffer || !file.buffer.length) {
    throw new Error('File vuoto o upload interrotto');
  }

  fs.writeFileSync(fullPath, file.buffer);
  file.path = fullPath;
  file.filename = filename;
  file.mimetype = mimetype || file.mimetype;
  return file;
}

const fileFilter = (req, file, cb) => {
  if (isAllowedUpload(file)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo file non supportato. Usa JPG, PNG, WebP o MP4.'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 10,
  },
});

const handleSingleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nessun file caricato' });
    }

    const file = saveMulterFileToDisk(req.file);
    const isVideo = file.mimetype.startsWith('video');
    let fileUrl = `/uploads/${isVideo ? 'videos' : 'images'}/${file.filename}`;
    let thumbnailUrl = null;

    if (!isVideo) {
      const optimized = await optimizeUploadedImage(file);
      fileUrl = optimized.fileUrl;
      thumbnailUrl = optimized.thumbnailUrl;
    }

    res.json({
      success: true,
      data: {
        url: fileUrl,
        thumbnail_url: thumbnailUrl,
        type: isVideo ? 'video' : 'image',
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
      },
    });
  } catch (error) {
    console.error('Errore upload:', error);
    const message =
      error.message?.includes('interrotto') || error.message?.includes('Unexpected end of form')
        ? 'Upload interrotto. Riprova con JPG/PNG (max 12MB) e connessione stabile.'
        : 'Errore upload';
    res.status(500).json({ success: false, error: message });
  }
};

async function optimizeUploadedImage(file) {
  let fileUrl = `/uploads/images/${file.filename}`;
  let thumbnailUrl = null;

  try {
    const processed = await processImage(file.path);
    fileUrl = processed.url;
    thumbnailUrl = processed.thumbnail_url;
  } catch (err) {
    console.warn('Ottimizzazione immagine fallita:', err.message);
  }

  return { fileUrl, thumbnailUrl };
}

async function buildUploadedFileRecord(file, index, basePosition, hasPrimary, isReel) {
  const saved = saveMulterFileToDisk(file);
  const isVideo = saved.mimetype.startsWith('video');
  let fileUrl = `/uploads/${isVideo ? 'videos' : 'images'}/${saved.filename}`;
  let thumbnailUrl = null;

  if (!isVideo) {
    const optimized = await optimizeUploadedImage(saved);
    fileUrl = optimized.fileUrl;
    thumbnailUrl = optimized.thumbnailUrl;
  }

  return {
    type: isVideo ? 'video' : 'image',
    url: fileUrl,
    thumbnail_url: thumbnailUrl,
    position: basePosition + index,
    is_primary: !hasPrimary && index === 0 && !isVideo,
    is_reel: Boolean(isReel && isVideo),
    isVideo,
  };
}

async function persistAnnouncementMedia(req, res) {
  try {
    const files = req.files?.length ? req.files : req.file ? [req.file] : [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'Nessun file caricato' });
    }

    const { announcement_id, is_reel } = req.body;
    if (!announcement_id) {
      return res.status(400).json({ success: false, error: 'announcement_id richiesto' });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcement_id },
      include: {
        media: {
          select: { id: true, is_primary: true, position: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Annuncio non trovato' });
    }

    if (announcement.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Non autorizzato' });
    }

    const basePosition = announcement.media.length;
    let hasPrimary = announcement.media.some((item) => item.is_primary);
    let hasVideo = announcement.has_video;
    const reelUpload = is_reel === 'true' || is_reel === true;
    const createdMedia = [];

    for (let index = 0; index < files.length; index += 1) {
      const prepared = await buildUploadedFileRecord(
        files[index],
        index,
        basePosition,
        hasPrimary,
        reelUpload
      );

      if (prepared.isVideo) {
        hasVideo = true;
      }
      if (prepared.is_primary) {
        hasPrimary = true;
      }

      const record = await prisma.media.create({
        data: {
          announcement_id,
          type: prepared.type,
          url: prepared.url,
          thumbnail_url: prepared.thumbnail_url,
          position: prepared.position,
          is_primary: prepared.is_primary,
          is_reel: prepared.is_reel,
          metadata_removed: prepared.type === 'image',
        },
      });

      createdMedia.push(record);
    }

    await prisma.announcement.update({
      where: { id: announcement_id },
      data: { has_video: hasVideo },
    });

    return res.json({ success: true, data: createdMedia });
  } catch (error) {
    console.error('Errore upload media annuncio:', error);
    const message =
      error.message?.includes('interrotto') || error.message?.includes('Unexpected end of form')
        ? 'Upload interrotto. Riprova con JPG/PNG (max 12MB).'
        : 'Errore upload media';
    return res.status(500).json({ success: false, error: message });
  }
}

router.post('/', authenticate, upload.single('file'), handleSingleUpload);
router.post('/media', authenticate, upload.array('files', 10), persistAnnouncementMedia);
router.post('/media/single', authenticate, upload.single('file'), persistAnnouncementMedia);

router.post('/multiple', authenticate, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Nessun file caricato' });
    }

    const results = await Promise.all(
      req.files.map(async (file) => {
        const saved = saveMulterFileToDisk(file);
        const isVideo = saved.mimetype.startsWith('video');
        let fileUrl = `/uploads/${isVideo ? 'videos' : 'images'}/${saved.filename}`;
        let thumbnailUrl = null;

        if (!isVideo) {
          const optimized = await optimizeUploadedImage(saved);
          fileUrl = optimized.fileUrl;
          thumbnailUrl = optimized.thumbnailUrl;
        }

        return {
          url: fileUrl,
          thumbnail_url: thumbnailUrl,
          type: isVideo ? 'video' : 'image',
          filename: saved.filename,
          size: saved.size,
          mimetype: saved.mimetype,
        };
      })
    );

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Errore upload multiplo:', error);
    res.status(500).json({ success: false, error: 'Errore upload' });
  }
});

router.delete('/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const { type = 'images' } = req.query;

    const filePath = path.join(UPLOADS_ROOT, type, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'File non trovato' });
    }
  } catch (error) {
    console.error('Errore eliminazione file:', error);
    res.status(500).json({ success: false, error: 'Errore eliminazione' });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File troppo grande (max 50MB)' });
    }
    return res.status(400).json({ success: false, error: error.message });
  }
  if (error.message === 'Tipo file non supportato. Usa JPG, PNG, WebP o MP4.') {
    return res.status(400).json({ success: false, error: error.message });
  }
  if (error.message?.includes('Unexpected end of form')) {
    return res.status(400).json({
      success: false,
      error: 'Upload interrotto. Riprova con JPG/PNG e connessione stabile.',
    });
  }
  next(error);
});

module.exports = router;
