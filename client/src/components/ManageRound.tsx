import React, { useState } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { useChallenge, useDispatch } from '../hooks';
import { extendRound, finishRound, startRound } from '../stateSlice';
import DropdownPoolSelector from './DropdownPoolSelector';
import NumericControl from './NumericControl';

interface ManageRoundProps {
    className?: string;
}

export default function ManageRound(props: ManageRoundProps): JSX.Element {
    const challenge = useChallenge();
    const dispatch = useDispatch();
    const [poolName, setPoolName] = useState('');
    const [numDays, setNumDays] = useState<number>();

    function start() {
        if (challenge !== undefined && numDays !== undefined) {
            const finish = new Date(Date.now());
            finish.setDate(finish.getDate() + numDays);
            dispatch(startRound({
                challengeId: challenge.id, params: {
                    poolName: poolName,
                    finishTime: finish.toISOString()
                }
            }));
        }
    }

    function extend() {
        if (challenge !== undefined && numDays !== undefined) {
            dispatch(extendRound({
                challengeId: challenge.id, params: {
                    numDays: numDays
                }
            }));
        }
    }

    function finish() {
        if (challenge !== undefined)
            dispatch(finishRound(challenge.id));
    }

    if (challenge === undefined || !challenge.isCreator)
        return <></>;
    if (challenge.rounds.length === 0 || challenge.rounds[challenge.rounds.length - 1].isFinished)
        return (
            <Card className={props.className}>
                <Card.Body>
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        start();
                    }}>
                        <Form.Group>
                            <Form.Label>Pool</Form.Label>
                            <DropdownPoolSelector className="mb-2" onSelect={(pool) => setPoolName(pool.name)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Length (days)</Form.Label>
                            <Row>
                                <Col lg="6" className="mb-2">
                                    <NumericControl onChange={setNumDays} required />
                                </Col>
                                <Col lg="6">
                                    <Button type="submit" className="w-100">Start round</Button>
                                </Col>
                            </Row>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        );

    return (
        <Card className={props.className}>
            <Card.Body>
                <Form.Label>Length (days)</Form.Label>
                <Row className="mb-3">
                    <Col lg="6">
                        <NumericControl onChange={setNumDays} />
                    </Col>
                    <Col lg="6">
                        <Button className="w-100" onClick={extend}>Extend Round</Button>
                    </Col>
                </Row>
                <Row>
                    <Col lg="6" />
                    <Col lg="6">
                        <Button className="w-100" onClick={finish}>Finish round</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}