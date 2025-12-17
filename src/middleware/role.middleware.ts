import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

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
