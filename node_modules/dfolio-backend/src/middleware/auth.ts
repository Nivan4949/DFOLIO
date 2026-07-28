import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dfolio_jwt_secret_2026_super_secure';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
};

export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User context missing' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]` });
    }

    next();
  };
};
