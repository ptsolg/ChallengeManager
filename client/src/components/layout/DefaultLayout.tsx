import React from 'react';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useChallengeId, useSelector } from '../../hooks';
import { hideError } from '../../stateSlice';
import ChallengeNavbar from './ChallengeNavbar';

interface DefaultLayoutProps {
    children?: React.ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps): JSX.Element {
    const challengeId = useChallengeId();
    const errors = useSelector(state => state.errors);
    const dispatch = useDispatch();
    let toast = null;

    if (errors.length > 0) {
        const last = errors[errors.length - 1];
        toast = (
            <ToastContainer className="position-fixed bottom-0 start-50 translate-middle-x mb-2">
                <Toast onClose={() => dispatch(hideError(errors.length - 1))} show={last.show}>
                    <Toast.Header>
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>
                        {last.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        );
    }

    return (
        <div>
            {
                isNaN(challengeId)
                    ? null
                    : <ChallengeNavbar />
            }

            <Container className="mt-2">
                {children}
            </Container>
            {toast}
        </div>
    );
}