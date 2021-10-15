import { Request, Response } from 'express';
import * as api from '../../../common/api/models';
import { User } from '../db/models';
import { getUid, LoggedInUserRequest } from '../utils/request';
import { JsonResponse } from '../utils/response';

export function getUser(req: Request, res: JsonResponse<api.User>): Promise<Response> {
    return User.fetch(parseInt(req.params['userId'])).then(x => res.json(x));
}

export function getLoggedInUser(req: LoggedInUserRequest, res: JsonResponse<api.User>): Promise<Response> {
    return User.fetch(getUid(req)).then(x => res.json(x));
}