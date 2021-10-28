import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { ClientChallenge, CreateTitleParams, Pool, TitleExt } from '../../../common/api/models';
import { fetchClientChallenge, fetchPools, newPool, newTitle } from '../api/challenge';
import AddPool from '../components/AddPool';
import AddTitle from '../components/AddTitle';
import DefaultLayout from '../components/layout/DefaultLayout';
import PoolSelector from '../components/PoolSelector';
import { getPageParams, PageProps } from '../utils/page';


export default function PoolsPage({ user }: PageProps): JSX.Element {
    const challengeId = getPageParams().challengeId;
    const [titles, setTitles] = useState<TitleExt[]>([]);
    const [challenge, setChallenge] = useState<ClientChallenge>();
    const [pools, setPools] = useState<Pool[]>([]);
    const [selectedPoolName, setSelectedPoolName] = useState('');

    async function addPool(pool: Pool) {
        newPool(challengeId, pool)
            .then(pool => setPools([...pools, pool]))
            .catch(_ => {
                // todo
            });
    }

    async function addTitle(poolName: string, title: CreateTitleParams) {
        newTitle(challengeId, poolName, title).then(t => {
            if (poolName == selectedPoolName)
                setTitles([...titles, t]);
        }).catch(_ => {
            // todo
        });
    }

    useEffect(() => {
        fetchPools(challengeId).then(setPools);
        fetchClientChallenge(challengeId).then(setChallenge);
    }, []);

    return (
        <DefaultLayout challengeId={challengeId}>
            <Row>
                <Col sm="3" className="mb-2">
                    <Card className="mb-2">
                        <Card.Body>
                            <PoolSelector challengeId={challengeId} pools={pools} setTitles={setTitles} setPoolName={setSelectedPoolName} />
                            <AddPool user={user} challenge={challenge} onAdd={addPool} />
                        </Card.Body>
                    </Card>
                    <AddTitle pools={pools} challenge={challenge} onAdd={addTitle} />
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