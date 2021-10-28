import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Pagination, Table } from 'react-bootstrap';
import { Round, RollExt, RoundExt } from '../../../common/api/models';
import { fetchRolls, fetchRounds, finishRound } from '../api/challenge';
import DefaultLayout from '../components/layout/DefaultLayout';
import StartFinishRound from '../components/StartFinishRound';
import { getPageParams } from '../utils/page';

export default function RoundsPage(): JSX.Element {
    const challengeId = getPageParams().challengeId;
    const [rounds, setRounds] = useState<Round[]>([]);
    const [rolls, setRolls] = useState<RollExt[]>([]);
    const [selectedRoundNum, setSelectedRoundNum] = useState(-1);

    function selectRound(roundNum: number) {
        setSelectedRoundNum(roundNum);
        fetchRolls(challengeId, roundNum).then(setRolls);
    }

    function onStart(round: RoundExt) {
        setRounds([...rounds, round]);
        setRolls(round.rolls);
    }

    function onFinish() {
        finishRound(challengeId).then(round => {
            setRounds([...rounds.slice(0, -1), round]);
        });
    }

    useEffect(() => {
        fetchRounds(challengeId).then(x => {
            setRounds(x);
            if (x.length > 0)
                selectRound(x[0].num);
        });
    }, []);

    return (
        <DefaultLayout challengeId={challengeId}>
            <Row>
                <Col sm="3">
                    <StartFinishRound challengeId={challengeId} rounds={rounds} onStart={onStart} onFinish={onFinish} />
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