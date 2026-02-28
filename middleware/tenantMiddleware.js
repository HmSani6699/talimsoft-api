/**
 * Tenant Middleware
 * Ensures the user belongs to a valid Madrasa (Tenant)
 * Skips check for Super Admin
 */
const tenantMiddleware = (req, res, next) => {
    const user = req.user;
  
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  
    // Super Admin does not belong to a specific tenant
    if (user.role === 'super_admin') {
      return next();
    }
  
    if (!user.madrasa_id) {
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied: No valid Madrasa associated with this user." 
      });
    }
  
    // Valid tenant found
    next();
  };
  
  module.exports = tenantMiddleware;
