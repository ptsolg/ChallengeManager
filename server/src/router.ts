import { Router } from 'express';
import { getChallenges, getChallenge, getParticipants, getPools, getRounds, newChallenge } from './controllers/challenge';
import { handleLogin, handleLogout } from './controllers/auth';
import { getPoolTitles as getTitles } from './controllers/pool';
import { getRolls } from './controllers/round';
import { getLoggedInUser, getUser } from './controllers/user';
import { checkLoggedIn } from './middleware';

export default Router()
    .get('/challenge', getChallenges)
    .post('/challenge', checkLoggedIn, newChallenge)
    .get('/challenge/:challengeId(\\d+)', getChallenge)
    .get('/challenge/:challengeId(\\d+)/participants', getParticipants)
    .get('/challenge/:challengeId(\\d+)/pools', getPools)
    .get('/challenge/:challengeId(\\d+)/rounds', getRounds)
    .get('/user/me', checkLoggedIn, getLoggedInUser)
    .get('/user/:userId(\\d+)', getUser)
    .get('/pool/:poolId(\\d+)/titles', getTitles)
    .get('/round/:roundId(\\d+)/rolls', getRolls)
    .post('/auth/login', handleLogin)
    .post('/auth/logout', handleLogout);