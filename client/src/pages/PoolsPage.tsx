import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { CreateTitleParams, Message, Pool, TitleExt } from '../../../common/api/models';
import { fetchTitles, newTitle } from '../api';
import AddPool from '../components/AddPool';
import AddTitle from '../components/AddTitle';
import DefaultLayout from '../components/layout/DefaultLayout';
import PoolSelector from '../components/PoolSelector';
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
                                        <th>Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        titles.map((x, i) =>
                                            <tr>
                                                <td scope="row">{i}</td>
                                                <td><a href={x.url ?? ''}>{x.name}</a></td>
                                                <td>{x.proposer.name}</td>
                                                <td>{x.duration}</td>
                                            </tr>)
                                    }
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </DefaultLayout>
    );
}