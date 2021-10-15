import { Challenge, ClientChallenge, CreateChallengeParams, CreatePoolParams, CreateTitleParams, ParticipantExt, Pool, RollExt, Round, TitleExt } from '../../../common/api/models';
import api from './api';

export async function fetchChallenges(): Promise<Challenge[]> {
    return api.get('/challenge').then(x => x.data);
}

export async function fetchChallenge(challengeId: number): Promise<Challenge | undefined> {
    return api.get(`/challenge/${challengeId}`).then(x => x.data);
}

export async function fetchParticipants(challengeId: number): Promise<ParticipantExt[]> {
    return api.get(`/challenge/${challengeId}/participants`).then(x => x.data);
}

export async function fetchPools(challengeId: number): Promise<Pool[]> {
    return api.get(`/challenge/${challengeId}/pools`).then(x => x.data);
}

export async function fetchRounds(challengeId: number): Promise<Round[]> {
    return api.get(`/challenge/${challengeId}/rounds`).then(x => x.data);
}

export async function newChallenge(params: CreateChallengeParams): Promise<Challenge> {
    return api.post('/challenge', params, { withCredentials: true }).then(x => x.data);
}

export async function editChallenge(challenge: Challenge): Promise<Challenge> {
    return api.put(`/challenge/${challenge.id}`, challenge, { withCredentials: true }).then(x => x.data);
}

export async function fetchClientChallenge(challengeId: number): Promise<ClientChallenge> {
    return api.get(`/challenge/${challengeId}/client`, { withCredentials: true }).then(x => x.data);
}

export async function joinChallenge(challengeId: number): Promise<void> {
    return api.get(`/challenge/${challengeId}/join`, { withCredentials: true }).then(_ => { return; });
}

export async function leaveChallenge(challengeId: number): Promise<void> {
    return api.get(`/challenge/${challengeId}/leave`, { withCredentials: true }).then(_ => { return; });
}

export async function newPool(challengeId: number, params: CreatePoolParams): Promise<Pool> {
    return api.post(`/challenge/${challengeId}/pools`, params, { withCredentials: true }).then(x => x.data);
}

export async function fetchTitles(challengeId: number, poolName: string): Promise<TitleExt[]> {
    return api.get(`/challenge/${challengeId}/pools/${poolName}`).then(x => x.data);
}

export async function fetchRolls(challengeId: number, roundNum: number): Promise<RollExt[]> {
    return api.get(`/challenge/${challengeId}/rounds/${roundNum}`).then(x => x.data);
}

export async function newTitle(challengeId: number, poolName: string, params: CreateTitleParams): Promise<TitleExt> {
    return api.post(`/challenge/${challengeId}/pools/${poolName}`, params, { withCredentials: true }).then(x => x.data);
}