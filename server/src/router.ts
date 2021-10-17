import { Router } from 'express';
import { getChallenges, getChallenge, getParticipants, getPools, getRounds, newChallenge, joinChallenge, getClientChallenge, leaveChallenge, editChallenge, getPoolTitles, newPool, newTitle, getRolls } from './controllers/challenge';
import { handleLogin, handleLogout } from './controllers/auth';
import { getLoggedInUser, getUser } from './controllers/user';
import { checkCanAddTitle, checkCanManageChallenge, checkLoggedIn } from './middleware';

export default Router()
    .get('/challenge', getChallenges)
    .post('/challenge', checkLoggedIn, newChallenge)
    .get('/challenge/:challengeId(\\d+)', getChallenge)
    .put('/challenge/:challengeId(\\d+)', checkCanManageChallenge, editChallenge)
    .get('/challenge/:challengeId(\\d+)/participants', getParticipants)
    .get('/challenge/:challengeId(\\d+)/pools', getPools)
    .get('/challenge/:challengeId(\\d+)/pools/:poolName', getPoolTitles)
    .post('/challenge/:challengeId(\\d+)/pools/:poolName', checkCanAddTitle, newTitle)
    .post('/challenge/:challengeId(\\d+)/pools', checkCanManageChallenge, newPool)
    .get('/challenge/:challengeId(\\d+)/rounds', getRounds)
    .get('/challenge/:challengeId(\\d+)/rounds/:roundNum', getRolls)
    .get('/challenge/:challengeId(\\d+)/join', checkLoggedIn, joinChallenge)
    .get('/challenge/:challengeId(\\d+)/leave', checkLoggedIn, leaveChallenge)
    .get('/challenge/:challengeId(\\d+)/client', getClientChallenge)
    .get('/user/me', checkLoggedIn, getLoggedInUser)
    .get('/user/:userId(\\d+)', getUser)
    .post('/auth/login', handleLogin)
    .post('/auth/logout', handleLogout);