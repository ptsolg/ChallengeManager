import { Response, NextFunction } from 'express';
import { verifyToken } from './utils/auth';
import { getCidUid, LoggedInUserRequest } from './utils/request';

export async function checkLoggedIn(req: LoggedInUserRequest, res: Response, next: NextFunction): Promise<void> {
    const token = verifyToken(req);
    if (token === undefined) {
        res.status(401).json({ message: 'User is not logged id' });
        return;
    }
    req.userId = token.id;
    return next();
}
