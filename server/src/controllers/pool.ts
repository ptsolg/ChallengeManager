import { Request, Response } from 'express';
import { fetchPoolTitles } from '../db/queries';

export async function getPoolTitles(req: Request, res: Response): Promise<Response> {
    return fetchPoolTitles(parseInt(req.params['poolId'])).then(x => res.json(x));
}