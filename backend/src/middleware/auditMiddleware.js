const AuditLog = require('../models/AuditLog');

const logAdminAction = (action, moduleName) => {
  return async (req, res, next) => {
    // Intercept finish to record log after successful execution
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          await AuditLog.create({
            actor: req.user._id,
            actorRole: req.user.role,
            action,
            module: moduleName,
            targetId: req.params.id || req.body.id || null,
            targetModel: moduleName,
            changes: req.method !== 'GET' ? req.body : {},
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
            userAgent: req.headers['user-agent'] || ''
          });
        } catch (err) {
          console.error('Failed to write audit log:', err.message);
        }
      }
    });
    next();
  };
};

module.exports = {
  logAdminAction
};
