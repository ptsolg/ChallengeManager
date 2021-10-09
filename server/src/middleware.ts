import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import { env } from './env';

export interface LoggedInUserRequest extends Request {
    userId?: number
}

interface JwtPayload {
    id: number
}

export async function checkLoggedIn(req: LoggedInUserRequest, res: Response, next: NextFunction): Promise<void> {
    const token: string | undefined = req.cookies['auth'];
    if (token === undefined || !jwt.verify(token, env['JWT_SECRET'])) {
        res.status(401).json(null);
        return;
    }
    req.userId = jwt_decode<JwtPayload>(token).id;
    return next();
}