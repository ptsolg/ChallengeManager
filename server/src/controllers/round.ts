import { Request, Response } from 'express';
import { fetchRolls } from '../db/queries';

export async function getRolls(req: Request, res: Response): Promise<Response> {
    return fetchRolls(parseInt(req.params['roundId'])).then(x => res.json(x));
}