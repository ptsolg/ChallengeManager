import { Request, Response } from 'express';
import { getDiscordToken, getDiscordUser, DiscordError } from '../utils/discord';
import { createToken } from '../utils/auth';
import { User } from '../db/models';
import { JsonResponse, Message } from '../utils/response';
import { Error } from '../utils/error';
import { db } from '../db/db';

export async function handleLogin(req: Request, res: JsonResponse<User>): Promise<Response> {
    Error.throwIf(!('code' in req.body), 400, 'Missing "code" property');
    return getDiscordToken(req.body['code'])
        .then(getDiscordUser)
        .then(u => User.fetchOrCreate(db, u))
        .then(u => {
            const token = createToken(u.id);
            return res
                .cookie('auth', token, {
                    expires: new Date(Date.now() + 2629800000), // 1 Month
                    httpOnly: true
                })
                .json(u);
        })
        .catch((err: DiscordError) => {
            console.error(`Discord oauth2 error: ${err.message}`);
            throw new Error(400, "Couldn't authenticate");
        });
}

export async function handleLogout(req: Request, res: JsonResponse<Message>): Promise<Response> {
    return res.clearCookie('auth').json(Message.ok());
}