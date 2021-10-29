import React, { useEffect, useState } from 'react';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import ChallengeNavbar from './ChallengeNavbar';

interface DefaultLayoutProps {
    challengeId?: number;
    errors?: string[];
    children?: React.ReactNode;
}

export default function DefaultLayout({ challengeId, errors, children }: DefaultLayoutProps): JSX.Element {
    const [showLastErr, setShowLastErr] = useState(false);

    useEffect(() => setShowLastErr(errors !== undefined && errors.length > 0), [errors]);

    return (
        <div>
            {
                challengeId === undefined
                    ? null
                    : <ChallengeNavbar challengeId={challengeId} />
            }

            <Container className="mt-2">
                {children}
            </Container>
            <ToastContainer className="position-fixed bottom-0 start-50 translate-middle-x mb-2">
                <Toast onClose={() => setShowLastErr(false)} show={showLastErr}>
                    <Toast.Header>
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>
                        {errors && errors.length > 0 ? errors[errors.length - 1] : ''}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}