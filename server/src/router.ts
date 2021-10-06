import { Router } from 'express';
import { getChallenges, getChallenge, getParticipants, getPools, getRounds } from './controllers/challenge';
import { handleLogin, handleLogout } from './controllers/auth';
import { getPoolTitles as getTitles } from './controllers/pool';
import { getRolls } from './controllers/round';
import { getLoggedInUser, getUser } from './controllers/user';

export default Router()
    .get('/challenge', getChallenges)
    .get('/challenge/:challengeId(\\d+)', getChallenge)
    .get('/challenge/:challengeId(\\d+)/participants', getParticipants)
    .get('/challenge/:challengeId(\\d+)/pools', getPools)
    .get('/challenge/:challengeId(\\d+)/rounds', getRounds)
    .get('/user/me', getLoggedInUser)
    .get('/user/:userId(\\d+)', getUser)
    .get('/pool/:poolId(\\d+)/titles', getTitles)
    .get('/round/:roundId(\\d+)/rolls', getRolls)
    .post('/auth/login', handleLogin)
    .post('/auth/logout', handleLogout);