import { Request, Response } from 'express';
import { DatabaseTransactionConnectionType } from 'slonik';
import * as api from '../../../common/api/models';
import { db } from '../db/db';
import { Challenge, Participant, Round, Title, User } from '../db/models';
import { verifyToken } from '../utils/auth';
import { Error } from '../utils/error';
import { getCid, getPoolName, getUid, LoggedInUserRequest, maybeNull, nonNull } from '../utils/request';
import { JsonResponse, Message } from '../utils/response';

export function getChallenges(req: Request, res: JsonResponse<api.Challenge[]>): Promise<Response> {
    return Challenge.fetchAll(db).then(x => res.json(x));
}

export function getPools(req: Request, res: JsonResponse<api.Pool[]>): Promise<Response> {
    return Challenge.require(db, getCid(req))
        .then(c => c.fetchPools())
        .then(x => res.json(x));
}

export function getChallenge(req: Request, res: JsonResponse<api.Challenge>): Promise<Response> {
    return Challenge.require(db, getCid(req)).then(c => res.json(c));
}

function getChallengeParams(req: Request): api.CreateChallengeParams {
    return {
        name: nonNull(req, 'name'),
        awardUrl: maybeNull(req, 'awardUrl'),
        allowHidden: nonNull(req, 'allowHidden'),
        description: nonNull(req, 'description'),
    };
}

export async function editChallenge(req: Request, res: JsonResponse<Challenge>): Promise<Response> {
    const c = await Challenge.require(db, getCid(req));
    const params = getChallengeParams(req);
    c.name = params.name;
    c.awardUrl = params.awardUrl;
    c.allowHidden = params.allowHidden;
    c.description = params.description;
    await c.update();
    return res.json(c);
}

export function getParticipants(req: Request, res: JsonResponse<api.ParticipantExt[]>): Promise<Response> {
    return Challenge.require(db, getCid(req))
        .then(c => c.fetchParticipantsExt())
        .then(x => res.json(x));
}

export function getRounds(req: Request, res: JsonResponse<api.Round[]>): Promise<Response> {
    return Challenge.require(db, getCid(req))
        .then(c => c.fetchRounds())
        .then(x => res.json(x));
}

export function newChallenge(req: LoggedInUserRequest, res: JsonResponse<api.Challenge>): Promise<Response> {
    const params = getChallengeParams(req);
    return Challenge.create(db, params.name, params.awardUrl,
        getUid(req), params.allowHidden, params.description).then(x => res.json(x));
}

async function checkCanJoinChallenge(c: Challenge, uid: number): Promise<string | undefined> {
    if (c.finishTime && Date.now() > Date.parse(c.finishTime))
        return 'Challenge has ended';
    if (await c.hasStarted())
        return 'Challenge has already started';
    const p = await c.fetchParticipant(uid);
    if (p === undefined)
        return undefined;
    return p.failedRoundId === null
        ? 'User already participating in this challenge'
        : 'User has failed this challenge';
}

export async function getClientChallenge(req: Request, res: JsonResponse<api.ClientChallenge>): Promise<Response> {
    const token = verifyToken(req);
    const c = await Challenge.require(db, getCid(req));
    return res.json({
        ...c,
        canJoin: token !== undefined && (await checkCanJoinChallenge(c, token.id)) === undefined,
        isParticipant: token !== undefined && await c.hasParticipant(token.id),
        isCreator: token !== undefined && token.id === c.creatorId,
    });
}

export async function joinChallenge(req: LoggedInUserRequest, res: JsonResponse<Message>): Promise<Response> {
    const c = await Challenge.require(db, getCid(req));
    const err = await checkCanJoinChallenge(c, getUid(req));
    Error.throwIf(err !== undefined, 400, err as string);
    await c.addParticipant(getUid(req));
    return res.json(Message.ok());
}

export async function leaveChallenge(
    transaction: DatabaseTransactionConnectionType,
    req: LoggedInUserRequest,
    res: JsonResponse<Message>
): Promise<Response> {
    const c = await Challenge.require(transaction, getCid(req));
    const uid = getUid(req);
    if (await c.hasStarted()) {
        const lastRound = await c.requireLastRound();
        const participant = await c.requireParticipant(uid);
        participant.failedRoundId = lastRound.id;
        await participant.update();
    }
    else
        await c.deleteParticipant(uid);
    return res.json(Message.ok());
}

export function getPoolTitles(req: Request, res: JsonResponse<api.TitleExt[]>): Promise<Response> {
    return Challenge.require(db, getCid(req))
        .then(c => c.requirePool(getPoolName(req)))
        .then(p => p.fetchTitles())
        .then(x => res.json(x));
}

function getPoolParams(req: Request): api.CreatePoolParams {
    return {
        name: nonNull(req, 'name')
    };
}

export async function newPool(req: Request, res: JsonResponse<api.Pool>): Promise<Response> {
    const params = getPoolParams(req);
    const c = await Challenge.require(db, getCid(req));
    Error.throwIf(await c.hasPool(params.name), 400, `Pool "${params.name}" already exists`);
    return res.json(await c.addPool(params.name));
}

function getTitleParams(req: Request): api.CreateTitleParams {
    return {
        userId: maybeNull(req, 'userId'),
        name: nonNull(req, 'name'),
        url: maybeNull(req, 'url'),
        isHidden: nonNull(req, 'isHidden'),
    };
}

export async function newTitle(
    req: LoggedInUserRequest,
    res: JsonResponse<api.TitleExt>
): Promise<Response> {
    const params = getTitleParams(req);
    const c = await Challenge.require(db, getCid(req));
    const p = await c.requirePool(getPoolName(req));
    Error.throwIf(await c.hasTitle(params.name), 400, `Title "${params.name}" already exists"`);
    // todo: isHidden, score, duration, etc...
    let proposer = getUid(req);
    if (params.userId !== null) {
        Error.throwIf(getUid(req) !== c.creatorId, 400, "You don't have permissions to do that");
        proposer = params.userId;
    }
    const participant = await c.requireParticipant(proposer);
    const t = await p.addTitle(participant.id, params.name, params.url,
        params.isHidden, null, null, null, null);
    return res.json({
        ...t,
        proposer: await User.require(db, proposer)
    });
}

export function getRolls(req: Request, res: JsonResponse<api.RollExt[]>): Promise<Response> {
    return Challenge.require(db, getCid(req))
        .then(c => c.fetchRolls(parseInt(req.params['roundNum'])))
        .then(x => res.json(x));
}

function getStartRoundParams(req: Request): api.StartRoundParams {
    return {
        poolName: nonNull(req, 'poolName'),
        finishTime: nonNull(req, 'finishTime'),
    };
}

export async function startRound(
    transaction: DatabaseTransactionConnectionType,
    req: Request,
    res: JsonResponse<api.RoundExt>
): Promise<Response> {
    const params = getStartRoundParams(req);
    const c = await Challenge.require(transaction, getCid(req));
    const lastRound = await c.fetchLastRound();
    Error.throwIf(lastRound !== undefined && !lastRound.isFinished, 400, `Finish round ${lastRound?.num} first`);
    const pool = await c.requirePool(params.poolName);
    const participants = (await c.fetchParticipantsExt()).filter(p => p.failedRoundId === null);
    Error.throwIf(participants.length === 0, 400, 'Not enough participants to start a round');
    const titles = await pool.fetchUnusedTitles();
    Error.throwIf(titles.length < participants.length, 400, `Not enough titles in "${pool.name}" pool`);
    const round = await c.addRound(new Date(params.finishTime));

    const popRandomTitle = (): Title => {
        const n = Math.floor(Math.random() * titles.length);
        return titles.splice(n, 1)[0];
    };

    const randTitles = [...Array(participants.length).keys()].map(_ => popRandomTitle());
    const rolls: api.RollExt[] = [];
    for (const [p, t] of randTitles.map<[api.ParticipantExt, Title]>((t, i) => [participants[i], t])) {
        rolls.push({
            ...await round.addRoll(p.id, t.id),
            watcher: p.user,
            title: t,
        });
        t.isUsed = true;
        await t.update();
    }
    return res.json({ ...round, rolls: rolls });
}

export async function finishRound(
    transaction: DatabaseTransactionConnectionType,
    req: Request,
    res: JsonResponse<Round>
): Promise<Response> {
    const c = await Challenge.require(transaction, getCid(req));
    const lr = await c.requireLastRound();
    Error.throwIf(lr.isFinished, 400, 'Round has already been finished');
    const rolls = await c.fetchRolls(lr.num);
    const failedParticipants = rolls.filter(r => r.score === null).map(r => r.participantId);
    await Participant.fail(transaction, lr.id, failedParticipants);
    lr.isFinished = true;
    await lr.update();
    // todo: karma
    return res.json(lr);
}

function getExtendRoundParams(req: Request): api.ExtendRoundParams {
    return {
        numDays: nonNull(req, 'numDays'),
    };
}

export async function extendRound(req: Request, res: JsonResponse<api.Round>): Promise<Response> {
    const c = await Challenge.require(db, getCid(req));
    const lr = await c.requireLastRound();
    const params = getExtendRoundParams(req);
    const finish = new Date(lr.finishTime);
    finish.setDate(finish.getDate() + params.numDays);
    lr.finishTime = finish.toISOString();
    await lr.update();
    return res.json(lr);
}