import { Request, Response } from 'express';
import { Challenge, ClientChallenge } from '../../../common/api/models';
import { fetchChallenges, fetchChallenge, fetchParticipants, fetchPools, fetchRounds, createChallenge, hasParticipant, createParticipant, deleteParticipant, updateChallenge } from '../db/queries';
import { verifyToken } from '../utils/auth';
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

async function checkCanJoinChallenge(cid: number, uid: number): Promise<string | undefined> {
    return fetchChallenge(cid).then(async c => {
        if (c === null)
            return 'Challenge does not exist';
        if (c.finishTime && Date.now() > c.finishTime?.getTime())
            return 'Challenge has ended';
        // todo: Dedicated query?
        if ((await fetchRounds(cid)).length > 0)
            return 'Challenge has already started';
        return hasParticipant(cid, uid).then(x => x ? 'User already participating in this challenge' : undefined);
    });
}

export async function getClientChallenge(req: Request, res: Response): Promise<Response> {
    let canJoin = false;
    let isParticipant = false;
    const token = verifyToken(req);
    const cid = getCid(req);
    if (token !== undefined) {
        canJoin = (await checkCanJoinChallenge(cid, token.id)) === undefined;
        isParticipant = await hasParticipant(cid, token.id);
    }

    return fetchChallenge(getCid(req)).then((c: Challenge): ClientChallenge => {
        return {
            ...c,
            canJoin: canJoin,
            isParticipant: isParticipant
        };
    }).then(x => res.json(x));
}

export async function joinChallenge(req: LoggedInUserRequest, res: Response): Promise<Response> {
    const [cid, uid] = getCidUid(req);
    return checkCanJoinChallenge(cid, uid).then(err => {
        if (err !== undefined)
            return res.status(400).json({ message: err });
        return createParticipant(cid, uid).then(_ => res.json({ message: 'ok' }));
    });
}

export async function leaveChallenge(req: LoggedInUserRequest, res: Response): Promise<Response> {
    const [cid, uid] = getCidUid(req);
    return hasParticipant(cid, uid).then(x => {
        if (!x)
            return res.status(400).json({ message: 'User is not participant' });
        // todo: Set failed round id if started
        return deleteParticipant(cid, uid).then(_ => res.json({ message: 'ok' }));
    });
}