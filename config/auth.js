require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-env',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-env',
  jwtExpiration: '1d', // Access token valid for 1 day
  jwtRefreshExpiration: '7d', // Refresh token valid for 7 days
};
