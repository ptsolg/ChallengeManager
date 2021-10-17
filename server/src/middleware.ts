import { NextFunction } from 'express';
import { Challenge } from './db/models';
import { verifyToken } from './utils/auth';
import { getCid, getUid, LoggedInUserRequest } from './utils/request';
import { JsonResponse, Message } from './utils/response';

export async function checkLoggedIn(
    req: LoggedInUserRequest,
    res: JsonResponse<Message>,
    next: NextFunction
): Promise<void> {
    const token = verifyToken(req);
    if (token === undefined) {
        res.status(401).json(new Message('User is not logged id'));
        return;
    }
    req.userId = token.id;
    return next();
}

export async function checkCanManageChallenge(
    req: LoggedInUserRequest,
    res: JsonResponse<Message>,
    next: NextFunction
): Promise<void> {
    return checkLoggedIn(req, res, async () => {
        const c = await Challenge.fetch(getCid(req));
        return c.creatorId === getUid(req)
            ? next()
            : res.status(401).json(new Message("You don't have permissions to manage this challenge"));
    });
}

export async function checkCanAddTitle(
    req: LoggedInUserRequest,
    res: JsonResponse<Message>,
    next: NextFunction
): Promise<void> {
    return checkLoggedIn(req, res, async () => {
        const c = await Challenge.fetch(getCid(req));
        if (await c.hasStarted())
            return res.status(401).json(new Message('Challenge has already started'));
        if (!(c.hasParticipant(getUid(req))))
            return res.status(401).json(new Message('You are not participating in this challenge'));
        return next();
    });
}