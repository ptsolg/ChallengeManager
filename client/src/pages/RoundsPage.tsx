import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Pagination, Table, FormCheck } from 'react-bootstrap';
import DefaultLayout from '../components/layout/DefaultLayout';
import RateTitle from '../components/RateTitle';
import ManageRound from '../components/ManageRound';
import { useChallengeId, useDispatch, useRounds, useChallenge } from '../hooks';
import { fetchChallenge, fetchParticipants, fetchPools, fetchRounds } from '../stateSlice';
import SwapTitles from '../components/SwapTitles';

export default function RoundsPage(): JSX.Element {
    const cid = useChallengeId();
    const challenge = useChallenge();
    const rounds = useRounds();
    const dispatch = useDispatch();
    const [selectedRoundNum, setSelectedRoundNum] = useState(-1);
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
    const canSelect = challenge?.isCreator && selectedRoundNum !== -1 && !rounds[selectedRoundNum].isFinished;

    function selectRound(num: number) {
        if (selectedRoundNum !== num) {
            setSelectedRoundNum(num);
            setSelectedUsers(new Set());
        }
    }

    function checkUser(userId: number) {
        const s = new Set(selectedUsers);
        if (selectedUsers.has(userId))
            s.delete(userId);
        else
            s.add(userId);
        setSelectedUsers(s);
    }

    useEffect(() => {
        dispatch(fetchChallenge(cid));
        dispatch(fetchRounds(cid));
        dispatch(fetchParticipants(cid));
        dispatch(fetchPools(cid));
    }, []);

    useEffect(() => {
        if (rounds.length > 0 && selectedRoundNum == -1)
            selectRound(rounds[rounds.length - 1].num);
    }, [rounds]);

    return (
        <DefaultLayout>
            <Row>
                <Col sm="3">
                    <ManageRound className="mb-2" />
                    <RateTitle className="mb-2" />
                    <SwapTitles selectedUsers={selectedUsers} />
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
                                        {canSelect ? <th></th> : null}
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
                                                        {
                                                            canSelect
                                                                ?
                                                                <td>
                                                                    <FormCheck
                                                                        checked={selectedUsers.has(x.watcher.id)}
                                                                        onChange={() => checkUser(x.watcher.id)} />
                                                                </td>
                                                                :
                                                                null
                                                        }
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