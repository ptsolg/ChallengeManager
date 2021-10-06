import api from './api';

export async function login(authorizationCode: string): Promise<void> {
    return api.post('/auth/login', { code: authorizationCode }, { withCredentials: true })
        .then(_ => { return; })
        .catch(_ => { return; });
}

export async function logout(): Promise<void> {
    return api.post('/auth/logout', {}, { withCredentials: true })
        .then(_ => { return; })
        .catch(_ => { return; });
}