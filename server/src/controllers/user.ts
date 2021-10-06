import { Request, Response } from 'express';
import jwt_decode from 'jwt-decode';
import jwt from 'jsonwebtoken';
import { fetchUserById } from '../db/queries';
import { env } from '../env';

export async function getUser(req: Request, res: Response): Promise<Response> {
    return fetchUserById(parseInt(req.params['userId'])).then(x => res.json(x));
}

interface JwtPayload {
    id: number
}

export async function getLoggedInUser(req: Request, res: Response): Promise<Response> {
    const token: string | undefined = req.cookies['auth'];
    if (token === undefined || !jwt.verify(token, env['JWT_SECRET']))
        return res.json(null);
    const id = jwt_decode<JwtPayload>(token).id;
    return fetchUserById(id).then(x => res.json(x));
}