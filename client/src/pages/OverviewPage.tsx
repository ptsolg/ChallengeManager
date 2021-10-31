import React, { useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import showdown from 'showdown';
import ChallengeInfo from '../components/ChallengeInfo';
import DefaultLayout from '../components/layout/DefaultLayout';
import { useChallengeId, useDispatch, useSelector } from '../hooks';
import { fetchChallenge } from '../stateSlice';

export default function OverviewPage(): JSX.Element {
    const cid = useChallengeId();
    const converter = new showdown.Converter();
    const challenge = useSelector(state => state.challenge);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchChallenge(cid));
    }, []);

    return (
        <DefaultLayout>
            <Row>
                <Col md="8">
                    <Card>
                        <Card.Body>
                            <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(challenge?.description ?? '') }}></div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md="4">
                    <ChallengeInfo />
                </Col>
            </Row>
        </DefaultLayout>
    );
}