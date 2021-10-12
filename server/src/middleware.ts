import { Response, NextFunction } from 'express';
import { isChallengeOwner } from './db/queries';
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

export async function checkCanEditChallenge(req: LoggedInUserRequest, res: Response, next: NextFunction): Promise<void> {
    return checkLoggedIn(req, res, async () => {
        const [cid, uid] = getCidUid(req);
        if (await isChallengeOwner(cid, uid))
            return next();
        return res.status(401).json({ message: "You don't have permissions to edit this challenge" });
    });
}