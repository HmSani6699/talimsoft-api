/**
 * Role-Based Access Control Middleware
 * @param {Array<string>} allowedRoles - List of roles allowed to access the route
 */
const rbacMiddleware = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Access denied. User not authenticated.' 
        });
      }
  
      if (allowedRoles.includes(req.user.role)) {
        next();
      } else {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. You do not have permission to perform this action.' 
        });
      }
    };
  };
  
  module.exports = rbacMiddleware;
