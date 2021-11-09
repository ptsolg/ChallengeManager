import { Request, Response } from 'express';
import * as api from '../../../common/api/models';
import { db } from '../db/db';
import { User, UserStats } from '../db/models';
import { getUid, LoggedInUserRequest } from '../utils/request';
import { JsonResponse } from '../utils/response';

export function getUser(req: Request, res: JsonResponse<api.User>): Promise<Response> {
    return User.require(db, parseInt(req.params['userId'])).then(x => res.json(x));
}

export function getLoggedInUser(req: LoggedInUserRequest, res: JsonResponse<api.User>): Promise<Response> {
    return User.require(db, getUid(req)).then(x => res.json(x));
}

export function getUserStats(req: Request, res: JsonResponse<api.UserStats>): Promise<Response> {
    return UserStats.fetch(db, parseInt(req.params['userId'])).then(x => res.json(x));
}