import { Roll } from '../../../common/api/models';
import api from './api';

export async function fetchRolls(roundId: number): Promise<Roll[]> {
    return api.get(`/round/${roundId}/rolls`).then(x => x.data);
}