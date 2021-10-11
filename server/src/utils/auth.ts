import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env';

interface Payload {
    id: number
}

export function verifyToken(req: Request): Payload | undefined {
    if (!('auth' in req.cookies))
        return undefined;
    let result = undefined;
    jwt.verify(req.cookies['auth'] as string, env['JWT_SECRET'], (err, decoded) => {
        result = err == null ? decoded : undefined;
    });
    return result;
}

export function createToken(userId: number): string {
    const payload: Payload = {
        id: userId
    };
    return jwt.sign(payload, env['JWT_SECRET']);
}
