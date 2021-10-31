import React, { useEffect } from 'react';
import CreateOrEditChallenge from '../components/CreateOrEditChallenge';
import { useChallengeId, useDispatch } from '../hooks';
import { fetchChallenge } from '../stateSlice';

export default function EditChallengePage(): JSX.Element {
    const cid = useChallengeId();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchChallenge(cid));
    }, []);

    return (
        <CreateOrEditChallenge />
    );
}