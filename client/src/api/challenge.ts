import { Challenge, Participant, Pool, Round } from '../../../common/api/models';
import api from './api';

export async function fetchChallenges(): Promise<Challenge[]> {
    return api.get('/challenge').then(x => x.data);
}

export async function fetchChallenge(challengeId: number): Promise<Challenge | undefined> {
    return api.get(`/challenge/${challengeId}`).then(x => x.data);
}

export async function fetchParticipants(challengeId: number): Promise<Participant[]> {
    return api.get(`/challenge/${challengeId}/participants`).then(x => x.data);
}

export async function fetchPools(challengeId: number): Promise<Pool[]> {
    return api.get(`/challenge/${challengeId}/pools`).then(x => x.data);
}

export async function fetchRounds(challengeId: number): Promise<Round[]> {
    return api.get(`/challenge/${challengeId}/rounds`).then(x => x.data);
}

export async function newChallenge(challenge: Challenge): Promise<number> {
    return api.post('/challenge', challenge, { withCredentials: true }).then(x => x.data['id']);
}