import * as api from '../../../common/api/models';

export class Error implements api.Message {
    message: string;
    responseCode: number;

    constructor(code: number, msg: string) {
        this.responseCode = code;
        this.message = msg;
    }

    static throwIf(condition: boolean, code: number, msg: string): void {
        if (condition)
            throw new Error(code, msg);
    }
}