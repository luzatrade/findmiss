const fs = require('fs');
const path = require('path');

const MAX_WIDTH = 1920;
const THUMB_WIDTH = 480;
const WEBP_QUALITY = 82;
const THUMB_QUALITY = 72;

let sharp = null;
try {
  sharp = require('sharp');
} catch {
  console.warn('Sharp non disponibile: le immagini verranno salvate senza ottimizzazione.');
}

function uploadsUrl(typeFolder, filename) {
  return `/uploads/${typeFolder}/${filename}`;
}

async function processImage(filePath) {
  if (!sharp) {
    const filename = path.basename(filePath);
    return {
      url: uploadsUrl('images', filename),
      thumbnail_url: null,
      filename,
    };
  }

  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  const mainFilename = `${base}-opt.webp`;
  const thumbFilename = `${base}-thumb.webp`;
  const mainPath = path.join(dir, mainFilename);
  const thumbPath = path.join(dir, thumbFilename);

  await sharp(filePath)
    .rotate()
    .resize({
      width: MAX_WIDTH,
      height: MAX_WIDTH,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(mainPath);

  await sharp(filePath)
    .rotate()
    .resize({
      width: THUMB_WIDTH,
      height: THUMB_WIDTH,
      fit: 'cover',
      position: 'attention',
    })
    .webp({ quality: THUMB_QUALITY, effort: 3 })
    .toFile(thumbPath);

  if (fs.existsSync(filePath) && filePath !== mainPath) {
    fs.unlinkSync(filePath);
  }

  return {
    url: uploadsUrl('images', mainFilename),
    thumbnail_url: uploadsUrl('images', thumbFilename),
    filename: mainFilename,
  };
}

async function compressImage(filePath) {
  return processImage(filePath);
}

module.exports = { compressImage, processImage };
