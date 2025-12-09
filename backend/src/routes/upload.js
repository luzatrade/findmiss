const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const { compressImage } = require('../services/imageCompression');

const router = express.Router();

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

// POST /api/upload - Upload singolo file
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nessun file caricato' });
    }

    const file = req.file;
    const isVideo = file.mimetype.startsWith('video');
    const type = isVideo ? 'videos' : 'images';
    
    // URL relativo per accesso
    const fileUrl = `/uploads/${type}/${file.filename}`;
    
    let thumbnailUrl = null;
    
    // Per le immagini, comprimi se necessario
    if (!isVideo && compressImage) {
      try {
        await compressImage(file.path);
      } catch (err) {
        console.warn('Compressione immagine fallita:', err.message);
      }
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
});

// POST /api/upload/multiple - Upload multiplo
router.post('/multiple', authenticate, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Nessun file caricato' });
    }

    const results = await Promise.all(req.files.map(async (file) => {
      const isVideo = file.mimetype.startsWith('video');
      const type = isVideo ? 'videos' : 'images';
      const fileUrl = `/uploads/${type}/${file.filename}`;

      // Comprimi immagini
      if (!isVideo && compressImage) {
        try {
          await compressImage(file.path);
        } catch (err) {
          console.warn('Compressione immagine fallita:', err.message);
        }
      }

      return {
        url: fileUrl,
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
