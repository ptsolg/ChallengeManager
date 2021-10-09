import { Request, Response } from 'express';
import { fetchUserById } from '../db/queries';
import { LoggedInUserRequest } from '../middleware';

export async function getUser(req: Request, res: Response): Promise<Response> {
    return fetchUserById(parseInt(req.params['userId'])).then(x => res.json(x));
}

export async function getLoggedInUser(req: LoggedInUserRequest, res: Response): Promise<Response> {
    return fetchUserById(req.userId ?? -1).then(x => res.json(x));
}