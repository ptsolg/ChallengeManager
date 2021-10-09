import { Request, Response } from 'express';
import { Challenge } from '../../../common/api/models';
import { fetchChallenges, fetchChallenge, fetchParticipants, fetchPools, fetchRounds, createChallenge } from '../db/queries';

function getChallengeId(req: Request): number {
    return parseInt(req.params['challengeId']);
}

export async function getChallenges(req: Request, res: Response): Promise<Response> {
    return fetchChallenges().then(x => res.json(x));
}

export async function getPools(req: Request, res: Response): Promise<Response> {
    return fetchPools(getChallengeId(req)).then(x => res.json(x));
}

export async function getChallenge(req: Request, res: Response): Promise<Response> {
    return fetchChallenge(getChallengeId(req)).then(x => res.json(x));
}

export async function getParticipants(req: Request, res: Response): Promise<Response> {
    return fetchParticipants(getChallengeId(req)).then(x => res.json(x));
}

export async function getRounds(req: Request, res: Response): Promise<Response> {
    return fetchRounds(getChallengeId(req)).then(x => res.json(x));
}

export async function newChallenge(req: Request, res: Response): Promise<Response> {
    return createChallenge(req.body as Challenge).then(x => res.json({ id: x.id }));
}