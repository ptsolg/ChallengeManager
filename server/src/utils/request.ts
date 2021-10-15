import { Request } from 'express';

export interface LoggedInUserRequest extends Request {
    userId?: number
}

export function getCid(req: Request): number {
    if (req.params['challengeId'] === undefined)
        throw `challengeId is undefined`;
    return parseInt(req.params['challengeId']);
}

export function getUid(req: LoggedInUserRequest): number {
    return req.userId as number;
}

export function getPoolName(req: Request): string {
    return req.params['poolName'];
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