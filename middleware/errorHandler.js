const AppError = require('../utils/errors');

module.exports = (err, req, res, next) => {
  // Log full error in dev
  console.error('❌ Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ success: false, error: message });
};
