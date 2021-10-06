import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getDiscordToken, getDiscordUser, DiscordError } from '../utils/discord';
import { env } from '../env';
import { fetchOrCreateUser } from '../db/queries';

export async function handleLogin(req: Request, res: Response): Promise<Response> {
    if (!('code' in req.body)) {
        return res.json({ message: 'Missing "code" property' });
    }
    return getDiscordToken(req.body['code'])
        .then(getDiscordUser)
        .then(fetchOrCreateUser)
        .then(u => {
            const token = jwt.sign({ id: u.id }, env['JWT_SECRET']);
            return res
                .cookie('auth', token, {
                    expires: new Date(Date.now() + 2629800000), // 1 Month
                    httpOnly: true
                })
                .json({ message: 'ok' });
        })
        .catch((err: DiscordError) => {
            console.error(`Discord oauth2 error: ${err.message}`);
            return res.status(400).json({ message: "Couldn't authenticate" });
        });
}

export async function handleLogout(req: Request, res: Response): Promise<Response> {
    return res.clearCookie('auth').json({ message: "ok" });
}