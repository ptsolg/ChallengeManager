import { Router } from 'express';
import { getChallenges, getChallenge, getParticipants, getPools, getRounds, newChallenge, joinChallenge, getClientChallenge, leaveChallenge, editChallenge, getPoolTitles, newPool, newTitle, startRound, finishRound, extendRound, rateTitle, swapTitles, randomSwapTitles, finishChallenge } from './controllers/challenge';
import { handleLogin, handleLogout } from './controllers/auth';
import { getLoggedInUser, getUser, getUserStats } from './controllers/user';
import { checkCanAddTitle, checkCanManageChallenge, checkLoggedIn } from './middleware';
import { db } from './db/db';
import { DatabaseTransactionConnectionType } from 'slonik';

function withTransaction<T, Req, Res>(
    f: (db: DatabaseTransactionConnectionType, req: Req, res: Res) => T
) {
    return (req: Req, res: Res) => {
        return db.transaction(async (transaction) => f(transaction, req, res));
    };
}

const challengeRouter = Router({ mergeParams: true })
    .get('/', getChallenge)
    .put('/', checkCanManageChallenge, editChallenge)
    .get('/participants', getParticipants)
    .get('/pools', getPools)
    .get('/pools/:poolName', getPoolTitles)
    .post('/pools/:poolName', checkCanAddTitle, newTitle)
    .post('/pools', checkCanManageChallenge, newPool)
    .get('/rounds', getRounds)
    .get('/join', checkLoggedIn, joinChallenge)
    .get('/leave', checkLoggedIn, withTransaction(leaveChallenge))
    .get('/client', getClientChallenge)
    .post('/startRound', checkCanManageChallenge, withTransaction(startRound))
    .get('/finishRound', checkCanManageChallenge, withTransaction(finishRound))
    .post('/extendRound', checkCanManageChallenge, extendRound)
    .post('/swap', checkCanManageChallenge, withTransaction(swapTitles))
    .post('/randomSwap', checkCanManageChallenge, withTransaction(randomSwapTitles))
    .post('/rateTitle', checkLoggedIn, rateTitle)
    .get('/finish', checkCanManageChallenge, withTransaction(finishChallenge));

export default Router()
    .get('/challenge', getChallenges)
    .post('/challenge', checkLoggedIn, newChallenge)
    .use('/challenge/:challengeId(\\d+)', challengeRouter)
    .get('/user/me', checkLoggedIn, getLoggedInUser)
    .get('/user/:userId(\\d+)/', getUser)
    .get('/user/:userId(\\d+)/stats', getUserStats)
    .post('/auth/login', handleLogin)
    .post('/auth/logout', handleLogout);