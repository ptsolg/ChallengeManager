import axios from 'axios';
import { Challenge, ClientChallenge, CreateChallengeParams, CreatePoolParams, CreateTitleParams, ExtendRoundParams, IdList, ParticipantExt, Pool, RateTitleParams, Round, RoundExt, StartRoundParams, TitleExt, UserStats } from '../../common/api/models';
import { User } from '../../common/api/models';

const api = axios.create({
    baseURL: `${process.env['REACT_APP_API_URL']}api/`,
});

api.interceptors.response.use(response => {
    return response;
}, err => {
    return Promise.reject(err.response.data);
});

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

export async function fetchRounds(challengeId: number): Promise<RoundExt[]> {
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

export async function newTitle(challengeId: number, poolName: string, params: CreateTitleParams): Promise<TitleExt> {
    return api.post(`/challenge/${challengeId}/pools/${poolName}`, params, { withCredentials: true }).then(x => x.data);
}

export async function rateTitle(challengeId: number, params: RateTitleParams): Promise<void> {
    return api.post(`/challenge/${challengeId}/rateTitle`, params, { withCredentials: true }).then(_ => { return; });
}

export async function startRound(challengeId: number, params: StartRoundParams): Promise<RoundExt> {
    return api.post(`/challenge/${challengeId}/startRound`, params, { withCredentials: true }).then(x => x.data);
}

export async function finishRound(challengeId: number): Promise<RoundExt> {
    return api.get(`/challenge/${challengeId}/finishRound`, { withCredentials: true }).then(x => x.data);
}

export async function extendRound(challengeId: number, params: ExtendRoundParams): Promise<Round> {
    return api.post(`/challenge/${challengeId}/extendRound`, params, { withCredentials: true }).then(x => x.data);
}

export async function swapTitles(challengeId: number, userIds: IdList): Promise<RoundExt> {
    return api.post(`/challenge/${challengeId}/swap`, userIds, { withCredentials: true }).then(x => x.data);
}

export async function randomSwapTitles(challengeId: number, userIds: IdList): Promise<RoundExt> {
    return api.post(`/challenge/${challengeId}/randomSwap`, userIds, { withCredentials: true }).then(x => x.data);
}

export async function login(authorizationCode: string): Promise<User> {
    return api.post('/auth/login', { code: authorizationCode }, { withCredentials: true }).then(x => x.data);
}

export async function logout(): Promise<void> {
    return api.post('/auth/logout', {}, { withCredentials: true })
        .then(_ => { return; })
        .catch(_ => { return; });
}

export async function fetchCurrentUser(): Promise<User | undefined> {
    return api.get('/user/me', { withCredentials: true })
        .then(x => x.data).catch(_ => undefined);
}

export async function fetchUserStats(userId: number): Promise<UserStats> {
    return api.get(`/user/${userId}/stats`).then(x => x.data);
}
