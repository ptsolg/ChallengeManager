import { createPool } from 'slonik';
import { env } from '../env';

export const db = createPool(env['PG_URI'], {
    typeParsers: [
        {
            name: 'int8',
            parse: (x: string) => x
        },
        {
            name: 'date',
            parse: (x: string) => x
        },
        {
            name: 'timestamp',
            parse: (x: string) => x
        }
    ]
});