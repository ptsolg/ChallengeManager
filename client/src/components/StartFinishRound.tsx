import React, { useState } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { useChallenge, useDispatch } from '../hooks';
import { finishRound, startRound } from '../stateSlice';
import DropdownPoolSelector from './DropdownPoolSelector';

export default function StartFinishRound(): JSX.Element {
    const challenge = useChallenge();
    const dispatch = useDispatch();
    const [poolName, setPoolName] = useState('');
    const [numDays, setNumDays] = useState('7');

    function update(e: React.ChangeEvent<HTMLInputElement>) {
        if (!/^\d*$/.test(e.target.value))
            return;
        setNumDays(e.target.value);
    }

    function start() {
        if (challenge !== undefined) {
            const finish = new Date(Date.now());
            finish.setDate(finish.getDate() + parseInt(numDays));
            dispatch(startRound({
                challengeId: challenge.id, params: {
                    poolName: poolName,
                    finishTime: finish.toISOString()
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
            <Card>
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
                                    <Form.Control onChange={update} value={numDays.toString()} required />
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
    // todo: Prolong round
    return (
        <Card>
            <Card.Body>
                <Button onClick={finish}>Finish round</Button>
            </Card.Body>
        </Card>
    );
}