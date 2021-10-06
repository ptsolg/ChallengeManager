import { Title } from '../../../common/api/models';
import api from './api';

export async function fetchTitles(poolId: number): Promise<Title[]> {
    return api.get(`/pool/${poolId}/titles`).then(x => x.data);
}