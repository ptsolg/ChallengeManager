import { Request, Response } from 'express';
import { getDiscordToken, getDiscordUser, DiscordError } from '../utils/discord';
import { createToken } from '../utils/auth';
import { User } from '../db/models';
import { JsonResponse, Message } from '../utils/response';

export async function handleLogin(req: Request, res: JsonResponse<Message>): Promise<Response> {
    if (!('code' in req.body)) {
        return res.json(new Message('Missing "code" property'));
    }
    return getDiscordToken(req.body['code'])
        .then(getDiscordUser)
        .then(User.fetchOrCreate)
        .then(u => {
            const token = createToken(u.id);
            return res
                .cookie('auth', token, {
                    expires: new Date(Date.now() + 2629800000), // 1 Month
                    httpOnly: true
                })
                .json(Message.ok());
        })
        .catch((err: DiscordError) => {
            console.error(`Discord oauth2 error: ${err.message}`);
            return res.status(400).json(new Message("Couldn't authenticate"));
        });
}

export async function handleLogout(req: Request, res: JsonResponse<Message>): Promise<Response> {
    return res.clearCookie('auth').json(Message.ok());
}