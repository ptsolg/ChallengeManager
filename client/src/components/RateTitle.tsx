import React, { useState } from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap';
import { useChallengeId, useDispatch, useLastRound, useParticipants, useUser } from '../hooks';
import { rateTitle } from '../stateSlice';
import NumericControl from './NumericControl';

export default function RateTitle(): JSX.Element {
    const cid = useChallengeId();
    const user = useUser();
    const participant = useParticipants().find(x => x.userId === user?.id);
    const round = useLastRound();
    const dispatch = useDispatch();
    const [score, setScore] = useState<number>();

    function rate() {
        console.log('aBOBA', score);
        if (score !== undefined) {
            dispatch(rateTitle({
                challengeId: cid, params: {
                    score: score
                }
            }));
        }
    }

    const roll = round?.rolls.find(x => x.participantId === participant?.id);
    if (user === undefined || round === undefined || roll === undefined)
        return (<></>);

    return (
        <Card>
            <Card.Body>
                <Row>
                    <Form.Label>Score</Form.Label>
                    <Col lg="7">
                        <NumericControl onChange={setScore} />
                    </Col>
                    <Col lg="5">
                        <Button className="w-100" onClick={rate}>Rate Title</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}