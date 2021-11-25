import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { CreateTitleParams, Message, Pool, TitleExt } from '../../../common/api/models';
import { fetchTitles, newTitle } from '../api';
import AddPool from '../components/AddPool';
import AddTitle from '../components/AddTitle';
import DefaultLayout from '../components/layout/DefaultLayout';
import PoolSelector from '../components/PoolSelector';
import TitleRow from '../components/TitleRow';
import { useChallengeId, useDispatch } from '../hooks';
import { emitError, fetchChallenge, fetchPools } from '../stateSlice';

export default function PoolsPage(): JSX.Element {
    const cid = useChallengeId();
    const dispatch = useDispatch();
    const [titles, setTitles] = useState<TitleExt[]>([]);
    const [pool, setPool] = useState<Pool>();

    function addTitle(poolName: string, title: CreateTitleParams) {
        newTitle(cid, poolName, title).then(t => {
            if (poolName === pool?.name)
                setTitles([...titles, t]);
        }).catch((err: Message) => dispatch(emitError(err.message)));
    }

    function selectPool(pool: Pool) {
        setPool(pool);
        fetchTitles(cid, pool.name).then(setTitles);
    }

    function setTitle(i: number, title: TitleExt) {
        const newTitles = [...titles];
        newTitles[i] = title;
        setTitles(newTitles);
    }

    function deleteTitle(i: number) {
        setTitles(titles.filter((_, j) => i !== j));
    }

    useEffect(() => {
        dispatch(fetchChallenge(cid));
        dispatch(fetchPools(cid));
    }, []);

    return (
        <DefaultLayout>
            <Row>
                <Col sm="3" className="mb-2">
                    <Card className="mb-2">
                        <Card.Body>
                            <PoolSelector onSelect={selectPool} />
                            <AddPool />
                        </Card.Body>
                    </Card>
                    <AddTitle onAdd={addTitle} />
                </Col>
                <Col sm="7">
                    <Card>
                        <Card.Body>
                            <Table striped>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Proposer</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {titles.map((x, i) =>
                                        <TitleRow
                                            num={i}
                                            title={x}
                                            setTitle={(t) => setTitle(i, t)}
                                            onDelete={() => deleteTitle(i)} />)}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </DefaultLayout>
    );
}