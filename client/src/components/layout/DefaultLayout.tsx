import React from 'react';
import { Container } from 'react-bootstrap';
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
            <Container className="mt-2">
                {children}
            </Container>
        </div>
    );
}