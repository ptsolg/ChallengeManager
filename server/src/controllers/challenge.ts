import { Request, Response } from 'express';
import { getCid, getCidUid, LoggedInUserRequest } from '../utils/request';

export async function getChallenges(req: Request, res: Response): Promise<Response> {
    return fetchChallenges().then(x => res.json(x));
}

export async function getPools(req: Request, res: Response): Promise<Response> {
    return fetchPools(getCid(req)).then(x => res.json(x));
}

export async function getChallenge(req: Request, res: Response): Promise<Response> {
    return fetchChallenge(getCid(req)).then(x => res.json(x));
}

export async function editChallenge(req: Request, res: Response): Promise<Response> {
    return updateChallenge(req.body as Challenge).then(_ => res.json({ message: 'ok' }));
}

export async function getParticipants(req: Request, res: Response): Promise<Response> {
    return fetchParticipants(getCid(req)).then(x => res.json(x));
}

export async function getRounds(req: Request, res: Response): Promise<Response> {
    return fetchRounds(getCid(req)).then(x => res.json(x));
}

export async function newChallenge(req: Request, res: Response): Promise<Response> {
    return createChallenge(req.body as Challenge).then(x => res.json({ id: x.id }));
}