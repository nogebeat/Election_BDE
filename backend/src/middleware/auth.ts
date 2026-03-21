import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
        req.user = { userId: payload.userId, role: payload.role };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
