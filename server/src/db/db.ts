import { createPool } from 'slonik';
import { env } from '../env';

export const db = createPool(env['PG_URI'], {
    typeParsers: [
        {
            name: 'int8',
            parse: (x: string) => x
        }
    ]
});