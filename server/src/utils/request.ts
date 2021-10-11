import { Request } from 'express';

export interface LoggedInUserRequest extends Request {
    userId?: number
}

export function getCid(req: Request): number {
    return parseInt(req.params['challengeId']);
}

export function getUid(req: LoggedInUserRequest): number {
    return req.userId as number;
}

export function getCidUid(req: LoggedInUserRequest): [number, number] {
    return [getCid(req), getUid(req)];
}