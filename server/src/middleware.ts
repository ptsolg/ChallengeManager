import { Response, NextFunction } from 'express';
import { Challenge } from './db/models';
import { verifyToken } from './utils/auth';
import { getCid, getUid, LoggedInUserRequest } from './utils/request';

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
        const c = await Challenge.fetch(getCid(req));
        return c.creatorId === getUid(req)
            ? next()
            : res.status(401).json({ message: "You don't have permissions to edit this challenge" });
    });
}

export async function checkCanAddTitle(req: LoggedInUserRequest, res: Response, next: NextFunction): Promise<void> {
    return checkLoggedIn(req, res, async () => {
        const c = await Challenge.fetch(getCid(req));
        if (await c.hasStarted())
            return res.status(401).json({ message: 'Challenge has already started' });
        if (!(c.hasParticipant(getUid(req))))
            return res.status(401).json({ message: 'You are not participating in this challenge' });
        return next();
    });
}