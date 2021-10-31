import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Pagination, Table } from 'react-bootstrap';
import { RollExt } from '../../../common/api/models';
import { fetchRolls } from '../api';
import DefaultLayout from '../components/layout/DefaultLayout';
import StartFinishRound from '../components/StartFinishRound';
import { useChallengeId, useDispatch, useRounds } from '../hooks';
import { fetchRounds } from '../stateSlice';

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
                    <StartFinishRound />
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