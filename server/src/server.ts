import express from 'express';
import cors from 'cors';
import router from './router';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { env } from './env';

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};

const app = express();
app.use(cors(corsOptions))
    .use(bodyParser.json())
    .use(cookieParser())
    .use('/api', router)
    .listen(env['PORT'], () => {
        console.log('ok');
    });