import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Challenge, CreateChallengeParams } from '../../../common/api/models';
import { editChallenge, fetchChallenge } from '../api/challenge';
import CreateOrEditChallenge from '../components/CreateOrEditChallenge';
import DefaultLayout from '../components/layout/DefaultLayout';
import { getPageParams } from '../utils/page';

export default function EditChallengePage(): JSX.Element {
    const history = useHistory();
    const challengeId = getPageParams().challengeId;
    const [challenge, setChallenge] = useState<Challenge>();

    async function save(params: CreateChallengeParams) {
        if (challenge !== undefined)
            editChallenge({ ...challenge, ...params }).then(c => history.push(`/challenge/${c.id}`));
    }

    useEffect(() => {
        fetchChallenge(challengeId).then(setChallenge);
    }, []);

    return (
        <DefaultLayout>
            <CreateOrEditChallenge onSubmit={save} challenge={challenge} />
        </DefaultLayout>
    );
}