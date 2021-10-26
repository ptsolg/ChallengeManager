import { NextFunction, Response } from 'express';
import { db } from './db/db';
import { Challenge } from './db/models';
import { verifyToken } from './utils/auth';
import { Error } from './utils/error';
import { getCid, getUid, LoggedInUserRequest } from './utils/request';

export function checkLoggedIn(
    req: LoggedInUserRequest,
    _: Response,
    next: NextFunction
): void {
    const token = verifyToken(req);
    if (token === undefined)
        throw new Error(401, 'User is not logged in');
    req.userId = token.id;
    return next();
}

export function checkCanManageChallenge(
    req: LoggedInUserRequest,
    res: Response,
    next: NextFunction
): void {
    return checkLoggedIn(req, res, async () => {
        const c = await Challenge.require(db, getCid(req));
        Error.throwIf(c.creatorId !== getUid(req),
            401, "You don't have permissions to manage this challenge");
        return next();
    });
}

export function checkCanAddTitle(
    req: LoggedInUserRequest,
    res: Response,
    next: NextFunction
): void {
    return checkLoggedIn(req, res, async () => {
        const c = await Challenge.require(db, getCid(req));
        Error.throwIf(await c.hasStarted(), 400, 'Challenge has already started');
        Error.throwIf(!(await c.hasParticipant(getUid(req))),
            400, 'You are not participating in this challenge');
        return next();
    });
}