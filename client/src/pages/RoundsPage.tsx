import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Pagination, Table } from 'react-bootstrap';
import DefaultLayout from '../components/layout/DefaultLayout';
import RateTitle from '../components/RateTitle';
import ManageRound from '../components/ManageRound';
import { useChallengeId, useDispatch, useRounds } from '../hooks';
import { fetchChallenge, fetchParticipants, fetchPools, fetchRounds } from '../stateSlice';

export default function RoundsPage(): JSX.Element {
    const cid = useChallengeId();
    const rounds = useRounds();
    const dispatch = useDispatch();
    const [selectedRoundNum, setSelectedRoundNum] = useState(-1);

    useEffect(() => {
        dispatch(fetchChallenge(cid));
        dispatch(fetchRounds(cid));
        dispatch(fetchParticipants(cid));
        dispatch(fetchPools(cid));
    }, []);

    useEffect(() => {
        if (rounds.length > 0 && selectedRoundNum == -1)
            setSelectedRoundNum(rounds[0].num);
    }, [rounds]);

    return (
        <DefaultLayout>
            <Row>
                <Col sm="3">
                    <ManageRound className="mb-2" />
                    <RateTitle />
                </Col>
                <Col sm="7">
                    <Card>
                        <Card.Body>
                            <Pagination>
                                {
                                    rounds.map(x =>
                                        <Pagination.Item
                                            onClick={() => setSelectedRoundNum(x.num)}
                                            active={x.num === selectedRoundNum}>
                                            {x.num + 1}
                                        </Pagination.Item>)
                                }
                            </Pagination>
                            <hr />
                            <Table striped>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>User</th>
                                        <th>Title</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        selectedRoundNum === -1
                                            ?
                                            null
                                            :
                                            rounds[selectedRoundNum].rolls.
                                                map((x, i) =>
                                                    <tr>
                                                        <td>{i}</td>
                                                        <td>{x.watcher.name}</td>
                                                        <td>{x.title.name}</td>
                                                        <td>{x.score}</td>
                                                    </tr>)
                                    }
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col></Col>
            </Row>
        </DefaultLayout >
    );
}