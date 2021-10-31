import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
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

async function handleError(err: unknown, req: Request, res: Response, _: NextFunction): Promise<Response> {
    if (err instanceof Error) {
        console.log(err);
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
    .use('/api', router)
    .use(handleError)
    .listen(env['PORT'], () => {
        console.log('ok');
    });