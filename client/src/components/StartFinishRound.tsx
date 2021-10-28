import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { ClientChallenge, Pool, Round, RoundExt } from '../../../common/api/models';
import { fetchClientChallenge, fetchPools, startRound } from '../api/challenge';
import DropdownPoolSelector from './DropdownPoolSelector';

interface StartFinishRoundProps {
    challengeId: number;
    rounds: Round[];
    onStart(round: RoundExt): void;
    onFinish(): void;
}

export default function StartFinishRound({ challengeId, rounds, onStart, onFinish }: StartFinishRoundProps): JSX.Element {
    const [challenge, setChallenge] = useState<ClientChallenge>();
    const [pools, setPools] = useState<Pool[]>([]);
    const [poolName, setPoolName] = useState('');
    const [numDays, setNumDays] = useState('7');

    function update(e: React.ChangeEvent<HTMLInputElement>) {
        if (!/^\d*$/.test(e.target.value))
            return;
        setNumDays(e.target.value);
    }

    function start() {
        const finish = new Date(Date.now());
        finish.setDate(finish.getDate() + parseInt(numDays));
        startRound(challengeId, {
            poolName: poolName,
            finishTime: finish
        }).then(onStart);
    }

    useEffect(() => {
        fetchPools(challengeId).then(setPools);
        fetchClientChallenge(challengeId).then(setChallenge);
    }, []);

    if (challenge === undefined || !challenge.isCreator)
        return <></>;
    if (rounds.length === 0 || rounds[rounds.length - 1].isFinished)
        return (
            <Card>
                <Card.Body>
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        start();
                    }}>
                        <Form.Group>
                            <Form.Label>Pool {pools.length}</Form.Label>
                            <DropdownPoolSelector className="mb-2" pools={pools} onSelect={(pool) => setPoolName(pool.name)} />
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
                <Button onClick={onFinish}>Finish round</Button>
            </Card.Body>
        </Card>
    );
}