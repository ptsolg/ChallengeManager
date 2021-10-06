import { useParams } from 'react-router';
import { User } from '../../../common/api/models';

export interface PageProps {
    user?: User
}

export interface PageParams {
    challengeId: number
}

interface Params {
    challengeId: string
}

export function getPageParams(): PageParams {
    return {
        challengeId: parseInt(useParams<Params>().challengeId)
    };
}