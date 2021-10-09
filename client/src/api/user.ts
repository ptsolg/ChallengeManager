import { User } from '../../../common/api/models';
import api from './api';

export async function fetchCurrentUser(): Promise<User | undefined> {
    return api.get('/user/me', { withCredentials: true })
        .then(x => x.data).catch(_ => undefined);
}