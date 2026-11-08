const path = require('path');

const UPLOADS_ROOT = process.env.UPLOADS_PATH
  ? path.resolve(process.env.UPLOADS_PATH)
  : path.join(__dirname, '../../uploads');

module.exports = { UPLOADS_ROOT };
