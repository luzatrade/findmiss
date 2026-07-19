const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { processImage } = require('../services/imageCompression');

const router = express.Router();
const prisma = new PrismaClient();

// Configura storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = file.mimetype.startsWith('video') ? 'videos' : 'images';
    const uploadPath = path.join(__dirname, '../../uploads', type);
    
    // Crea cartella se non esiste
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Filtro file
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo file non supportato'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  }
});

const handleSingleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nessun file caricato' });
    }

    const file = req.file;
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
        mimetype: file.mimetype
      }
    });
  } catch (error) {
    console.error('Errore upload:', error);
    res.status(500).json({ success: false, error: 'Errore upload' });
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
  const isVideo = file.mimetype.startsWith('video');
  let fileUrl = `/uploads/${isVideo ? 'videos' : 'images'}/${file.filename}`;
  let thumbnailUrl = null;

  if (!isVideo) {
    const optimized = await optimizeUploadedImage(file);
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
    return res.status(500).json({ success: false, error: 'Errore upload media' });
  }
}

// POST /api/upload - Upload singolo file
router.post('/', authenticate, upload.single('file'), handleSingleUpload);

// Upload media collegati a un annuncio (foto/video profilo, reel, ecc.)
router.post('/media', authenticate, upload.array('files', 10), persistAnnouncementMedia);

// Compatibilità: singolo file con campo "file" ma collegato all'annuncio
router.post('/media/single', authenticate, upload.single('file'), persistAnnouncementMedia);

// POST /api/upload/multiple - Upload multiplo
router.post('/multiple', authenticate, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Nessun file caricato' });
    }

    const results = await Promise.all(req.files.map(async (file) => {
      const isVideo = file.mimetype.startsWith('video');
      let fileUrl = `/uploads/${isVideo ? 'videos' : 'images'}/${file.filename}`;
      let thumbnailUrl = null;

      if (!isVideo) {
        const optimized = await optimizeUploadedImage(file);
        fileUrl = optimized.fileUrl;
        thumbnailUrl = optimized.thumbnailUrl;
      }

      return {
        url: fileUrl,
        thumbnail_url: thumbnailUrl,
        type: isVideo ? 'video' : 'image',
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
      };
    }));

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Errore upload multiplo:', error);
    res.status(500).json({ success: false, error: 'Errore upload' });
  }
});

// DELETE /api/upload/:filename - Elimina file
router.delete('/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const { type = 'images' } = req.query;
    
    const filePath = path.join(__dirname, '../../uploads', type, filename);
    
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

// Error handler per multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File troppo grande (max 50MB)' });
    }
    return res.status(400).json({ success: false, error: error.message });
  }
  if (error.message === 'Tipo file non supportato') {
    return res.status(400).json({ success: false, error: error.message });
  }
  next(error);
});

module.exports = router;
