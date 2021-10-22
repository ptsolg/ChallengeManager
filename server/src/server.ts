import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import router from './router';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { env } from './env';
import { Error } from './utils/error';

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDates(object: any) {
    if (object === null || object === undefined || typeof object != 'object')
        return object;
    // 2019-02-22T20:18:00.000Z
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    for (const k of Object.keys(object)) {
        const val = object[k];
        if (val && typeof val == 'string' && dateRegex.test(val)) {
            object[k] = new Date(val);
        } else {
            parseDates(val);
        }
    }
}

async function handleError(err: unknown, req: Request, res: Response, _: NextFunction): Promise<Response> {
    if (err instanceof Error) {
        return res.status(err.responseCode).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
}

process.on('unhandledRejection', (err) => {
    console.error(err);
});

process.on('uncaughtException', (err) => {
    console.error(err);
});

const app = express();
app.use(cors(corsOptions))
    .use(bodyParser.json())
    .use(cookieParser())
    .use(function (req, _res, next) {
        parseDates(req.body);
        next();
    })
    .use('/api', router)
    .use(handleError)
    .listen(env['PORT'], () => {
        console.log('ok');
    });