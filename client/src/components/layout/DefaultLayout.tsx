import React from 'react';
import ChallengeNavbar from './ChallengeNavbar';

interface DefaultLayoutProps {
    challengeId?: number,
    children?: React.ReactNode
}

export default function DefaultLayout({ challengeId, children }: DefaultLayoutProps): JSX.Element {
    return (
        <div>
            {challengeId === undefined
                ? null
                : <ChallengeNavbar challengeId={challengeId} />}
            <div className="container mt-2">
                {children}
            </div>
        </div>
    );
}