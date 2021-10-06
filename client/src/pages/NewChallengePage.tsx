import React from 'react';
import CreateOrEditChallenge from '../components/CreateOrEditChallenge';
import DefaultLayout from '../components/layout/DefaultLayout';

export default function NewChallengePage(): JSX.Element {
    return (
        <DefaultLayout>
            <CreateOrEditChallenge onSubmit={() => { return; }} />
        </DefaultLayout>
    );
}