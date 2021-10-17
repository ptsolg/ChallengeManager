import { Response } from 'express';

type Send<ResBody = unknown, T = Response<ResBody>> = (body?: ResBody) => T;

export interface JsonResponse<T> extends Response {
    json: Send<T, this>
}

export class Message {
    message: string;
    constructor(msg: string) {
        this.message = msg;
    }

    static ok(): Message {
        return new Message('ok');
    }
}