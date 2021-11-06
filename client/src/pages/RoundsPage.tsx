import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Pagination, Table } from 'react-bootstrap';
import { RollExt } from '../../../common/api/models';
import { fetchRolls } from '../api';
import DefaultLayout from '../components/layout/DefaultLayout';
import ManageRound from '../components/ManageRound';
import { useChallengeId, useDispatch, useRounds } from '../hooks';
import { fetchChallenge, fetchRounds } from '../stateSlice';

export default function RoundsPage(): JSX.Element {
    const cid = useChallengeId();
    const rounds = useRounds();
    const dispatch = useDispatch();
    const [rolls, setRolls] = useState<RollExt[]>([]);
    const [selectedRoundNum, setSelectedRoundNum] = useState(-1);

    function selectRound(roundNum: number) {
        setSelectedRoundNum(roundNum);
        fetchRolls(cid, roundNum).then(setRolls);
    }

    useEffect(() => {
        dispatch(fetchChallenge(cid));
        dispatch(fetchRounds(cid));
    }, []);

    useEffect(() => {
        if (rounds.length > 0 && selectedRoundNum == -1)
            selectRound(rounds[0].num);
    }, [rounds]);

    return (
        <DefaultLayout>
            <Row>
                <Col sm="3">
                    <ManageRound className="mb-2" />
                </Col>
                <Col sm="7">
                    <Card>
                        <Card.Body>
                            <Pagination>
                                {
                                    rounds.map(x =>
                                        <Pagination.Item
                                            onClick={() => selectRound(x.num)}
                                            active={x.num === selectedRoundNum}>
                                            {x.num + 1}
                                        </Pagination.Item>)
                                }
                            </Pagination>
                            <hr />
                            <Row className="mb-2">
                                <Col lg="2"><dt>Start Time</dt></Col>
                                <Col lg="4"><dd>{selectedRoundNum === -1 ? '' : formatDate(rounds[selectedRoundNum].startTime)}</dd></Col>
                            </Row>
                            <Row className="mb-3">
                                <Col lg="2"><dt>Finish Time</dt></Col>
                                <Col lg="4"><dd>{selectedRoundNum === -1 ? '' : formatDate(rounds[selectedRoundNum].finishTime)}</dd></Col>
                            </Row>
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
                                        rolls.map((x, i) =>
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