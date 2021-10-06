import dotenv from 'dotenv';

export const env = dotenv.config().parsed ?? process.exit(333);