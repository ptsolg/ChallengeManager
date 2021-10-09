import React from 'react';
import { useHistory } from 'react-router';
import { Challenge } from '../../../common/api/models';
import { newChallenge } from '../api/challenge';
import CreateOrEditChallenge from '../components/CreateOrEditChallenge';
import DefaultLayout from '../components/layout/DefaultLayout';

export default function NewChallengePage(): JSX.Element {
    const history = useHistory();

    async function createChallenge(challenge: Challenge) {
        newChallenge(challenge).then(id => history.push(`/challenge/${id}`));
    }

    return (
        <DefaultLayout>
            <CreateOrEditChallenge onSubmit={createChallenge} />
        </DefaultLayout>
    );
}