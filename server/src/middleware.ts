import { NextFunction, Response } from 'express';
import { db } from './db/db';
import { Challenge, Title } from './db/models';
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

export function checkCanManageTitle(
    req: LoggedInUserRequest,
    res: Response,
    next: NextFunction
): void {
    return checkLoggedIn(req, res, async () => {
        const c = await Challenge.require(db, getCid(req));
        Error.throwIf(await c.hasStarted(), 400, 'Challenge has already started');
        const uid = getUid(req);
        Error.throwIf(!(await c.hasParticipant(uid)),
            400, 'You are not participating in this challenge');

        const tid = req.params['titleId'];
        if (tid === undefined || uid === c.creatorId)
            return next();
        const title = await Title.require(db, parseInt(tid));
        const participant = await c.requireParticipant(uid);
        Error.throwIf(title.participantId !== participant.id,
            400, "You don't have permissions to edit this title");
        return next();
    });
}