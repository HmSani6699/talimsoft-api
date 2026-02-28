const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth');

const authService = {
  /**
   * Hash a password
   * @param {string} password 
   * @returns {string} hashed password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  /**
   * Compare a password with a hash
   * @param {string} password 
   * @param {string} hash 
   * @returns {boolean} true if match
   */
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  },

  /**
   * Generate Access Token
   * @param {object} user - User object (should contain _id, role, madrasa_id)
   * @returns {string} JWT Token
   */
  generateAccessToken(user) {
    const payload = {
      userId: user._id,
      role: user.role,
      madrasa_id: user.madrasa_id,
      username: user.username
    };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiration });
  },

  /**
   * Generate Refresh Token
   * @param {object} user 
   * @returns {string} JWT Refresh Token
   */
  generateRefreshToken(user) {
    const payload = {
      userId: user._id,
      tokenType: 'refresh'
    };
    return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiration });
  },

  /**
   * Verify Access Token
   * @param {string} token 
   * @returns {object} Decoded payload
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      return null;
    }
  },

  /**
   * Verify Refresh Token
   * @param {string} token 
   * @returns {object} Decoded payload
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwtRefreshSecret);
    } catch (error) {
      return null;
    }
  }
};

module.exports = authService;
