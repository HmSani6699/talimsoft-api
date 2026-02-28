const authService = require('../services/auth.service');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token.' 
      });
    }

    // Attach user info to request
    req.user = decoded;
    
    // Legacy support (optional, if existing code uses req.headers.user)
    req.headers.user = {
        userId: decoded.userId,
        email: decoded.email, // Might be undefined if not in payload
        role: decoded.role,
        madrasa_id: decoded.madrasa_id
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication.' 
    });
  }
};

module.exports = authMiddleware;
