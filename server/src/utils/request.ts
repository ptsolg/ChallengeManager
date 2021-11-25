import { Request } from 'express';
import { Error } from './error';

export interface LoggedInUserRequest extends Request {
    userId?: number
}

export function getCid(req: Request): number {
    Error.throwIf(req.params['challengeId'] === undefined, 400, 'challengeId is undefined');
    return parseInt(req.params['challengeId']);
}

export function getUid(req: LoggedInUserRequest): number {
    return req.userId as number;
}

export function getPoolName(req: Request): string {
    Error.throwIf(req.params['poolName'] === undefined, 400, 'poolName is undefined');
    return req.params['poolName'];
}

export function getTitleId(req: Request): number {
    Error.throwIf(req.params['titleId'] === undefined, 400, 'titleId is undefined');
    return parseInt(req.params['titleId']);
}

export function nonNull<T>(req: Request, key: string): T {
    if (req.body[key] === undefined || req.body[key] === null)
        throw `Key "${key}" is undefined | null`;
    return req.body[key];
}

export function maybeNull<T>(req: Request, key: string): T {
    if (req.body[key] === undefined)
        throw `Key "${key}" is undefined"`;
    return req.body[key];
}