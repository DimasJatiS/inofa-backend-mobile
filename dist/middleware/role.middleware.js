"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role) {
            res.status(403).json({
                success: false,
                message: 'Access denied. No role assigned.',
            });
            return;
        }
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
