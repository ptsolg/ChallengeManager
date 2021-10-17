import axios, { AxiosError } from 'axios';
import { env } from '../env';

export interface DiscordToken {
    access_token: string,
    expires_in: number,
    refresh_token: string,
    scope: string,
    token_type: string
}

export interface DiscordUser {
    id: string,
    username: string,
    avatar: string | null,
    discriminator: string,
}

export interface DiscordError {
    message: string
}

export async function getDiscordToken(authorizationCode: string): Promise<DiscordToken> {
    const params = new URLSearchParams({
        client_id: env['DISCORD_CLIENT_ID'],
        client_secret: env['DISCORD_CLIENT_SECRET'],
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: env['DISCORD_REDIRECT_URI']
    });
    return axios.post<DiscordToken>('https://discordapp.com/api/oauth2/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
        .then(x => x.data)
        .catch((err: AxiosError) => {
            throw {
                message: err.response?.data['error_description'],
            };
        });
}

export async function getDiscordUser(token: DiscordToken): Promise<DiscordUser> {
    return axios.get<DiscordUser>('https://discordapp.com/api/users/@me', {
        headers: {
            'authorization': `${token.token_type} ${token.access_token}`
        }
    })
        .then(x => x.data)
        .catch((err: AxiosError) => {
            throw {
                message: err.response?.data['message']
            };
        });
}