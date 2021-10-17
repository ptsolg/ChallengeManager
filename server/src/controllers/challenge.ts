import { Request, Response } from 'express';
import * as api from '../../../common/api/models';
import { Challenge, User } from '../db/models';
import { verifyToken } from '../utils/auth';
import { getCid, getPoolName, getUid, LoggedInUserRequest, maybeNull, nonNull } from '../utils/request';
import { JsonResponse, Message } from '../utils/response';

export function getChallenges(req: Request, res: JsonResponse<api.Challenge[]>): Promise<Response> {
    return Challenge.fetchAll().then(x => res.json(x));
}

export function getPools(req: Request, res: JsonResponse<api.Pool[]>): Promise<Response> {
    return Challenge.fetch(getCid(req))
        .then(c => c.fetchPools())
        .then(x => res.json(x));
}

export function getChallenge(req: Request, res: JsonResponse<api.Challenge>): Promise<Response> {
    return Challenge.fetch(getCid(req)).then(c => res.json(c));
}

function getChallengeParams(req: Request): api.CreateChallengeParams {
    return {
        name: nonNull(req, 'name'),
        awardUrl: maybeNull(req, 'awardUrl'),
        allowHidden: nonNull(req, 'allowHidden'),
        description: nonNull(req, 'description'),
    };
}

export async function editChallenge(req: Request, res: JsonResponse<Message>): Promise<Response> {
    const c = await Challenge.fetch(getCid(req));
    const params = getChallengeParams(req);
    c.name = params.name;
    c.awardUrl = params.awardUrl;
    c.allowHidden = params.allowHidden;
    c.description = params.description;
    await c.update();
    return res.json(Message.ok());
}

export function getParticipants(req: Request, res: JsonResponse<api.ParticipantExt[]>): Promise<Response> {
    return Challenge.fetch(getCid(req))
        .then(c => c.fetchParticipantsExt())
        .then(x => res.json(x));
}

export function getRounds(req: Request, res: JsonResponse<api.Round[]>): Promise<Response> {
    return Challenge.fetch(getCid(req))
        .then(c => c.fetchRounds())
        .then(x => res.json(x));
}

export function newChallenge(req: LoggedInUserRequest, res: JsonResponse<api.Challenge>): Promise<Response> {
    const params = getChallengeParams(req);
    return Challenge.create(params.name, params.awardUrl,
        getUid(req), params.allowHidden, params.description).then(x => res.json(x));
}

async function checkCanJoinChallenge(c: Challenge, uid: number): Promise<string | undefined> {
    if (c === null)
        return 'Challenge does not exist';
    if (c.finishTime && Date.now() > c.finishTime?.getTime())
        return 'Challenge has ended';
    // todo: Dedicated query?
    if ((await c.fetchRounds()).length > 0)
        return 'Challenge has already started';
    return c.hasParticipant(uid).then(x => x ? 'User already participating in this challenge' : undefined);
}

export async function getClientChallenge(req: Request, res: JsonResponse<api.ClientChallenge>): Promise<Response> {
    const token = verifyToken(req);
    const c = await Challenge.fetch(getCid(req));
    return res.json({
        ...c,
        canJoin: token !== undefined && (await checkCanJoinChallenge(c, token.id)) === undefined,
        isParticipant: token !== undefined && await c.hasParticipant(token.id)
    });
}

export async function joinChallenge(req: LoggedInUserRequest, res: JsonResponse<Message>): Promise<Response> {
    const c = await Challenge.fetch(getCid(req));
    const err = await checkCanJoinChallenge(c, getUid(req));
    if (err !== undefined)
        return res.status(400).json(new Message(err));
    await c.createParticipant(getUid(req));
    return res.json(Message.ok());
}

export async function leaveChallenge(req: LoggedInUserRequest, res: JsonResponse<Message>): Promise<Response> {
    const c = await Challenge.fetch(getCid(req));
    const uid = getUid(req);
    if (!(await c.hasParticipant(uid)))
        return res.status(400).json(new Message('User is not participant'));
    await c.deleteParticipant(uid);
    return res.json(Message.ok());
}

export function getPoolTitles(req: Request, res: JsonResponse<api.TitleExt[]>): Promise<Response> {
    return Challenge.fetch(getCid(req))
        .then(c => c.fetchPool(getPoolName(req)))
        .then(p => p.fetchTitles())
        .then(x => res.json(x));
}

function getPoolParams(req: Request): api.CreatePoolParams {
    return {
        name: nonNull(req, 'name')
    };
}

export async function newPool(req: Request, res: JsonResponse<api.Pool | Message>): Promise<Response> {
    const params = getPoolParams(req);
    const c = await Challenge.fetch(getCid(req));
    if (await c.hasPool(params.name))
        return res.status(400).json(new Message(`Pool "${params.name}" already exists`));
    const p = await c.addPool(params.name);
    return res.json(p);
}

function getTitleParams(req: Request): api.CreateTitleParams {
    return {
        name: nonNull(req, 'name'),
        url: maybeNull(req, 'url'),
        isHidden: nonNull(req, 'isHidden'),
    };
}

export async function newTitle(
    req: LoggedInUserRequest,
    res: JsonResponse<api.TitleExt | Message>
): Promise<Response> {
    const params = getTitleParams(req);
    const c = await Challenge.fetch(getCid(req));
    const p = await c.fetchPool(getPoolName(req));
    if (await c.hasTitle(params.name))
        return res.status(400).json(new Message(`Title "${params.name}" already exists"`));
    // todo: isHidden, score, duration, etc...
    const u = await User.fetch(getUid(req));
    const t = await p.addTitle(u.id, params.name, params.url,
        params.isHidden, null, null, null, null);
    return res.json({
        ...t,
        proposer: await User.fetch(getUid(req))
    });
}

export function getRolls(req: Request, res: JsonResponse<api.RollExt[]>): Promise<Response> {
    return Challenge.fetch(getCid(req))
        .then(c => c.fetchRolls(parseInt(req.params['roundNum'])))
        .then(x => res.json(x));
}