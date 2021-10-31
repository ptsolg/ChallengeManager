import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Table } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Challenge } from '../../../common/api/models';
import { fetchChallenges } from '../api';
import DefaultLayout from '../components/layout/DefaultLayout';
import { useUser } from '../hooks';

export default function IndexPage(): JSX.Element {
    const user = useUser();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    useEffect(() => {
        fetchChallenges().then(setChallenges);
    }, []);

    return (
        <DefaultLayout>
            <Row>
                <Col></Col>
                <Col xxl="8">
                    <Card>
                        <Card.Body>
                            {
                                user === undefined
                                    ?
                                    null
                                    :
                                    <LinkContainer to="/new-challenge">
                                        <Button variant="success" className="float-end">New Challenge</Button>
                                    </LinkContainer>
                            }
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th scope="col">Name</th>
                                        <th scope="col">Start time</th>
                                        <th scope="col">Finish time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        challenges.map(x =>
                                            <tr key={x.id}>
                                                <td>
                                                    <LinkContainer to={`/challenge/${x.id}`}>
                                                        <a>{x.name}</a>
                                                    </LinkContainer>
                                                </td>
                                                <td>{x.startTime.toLocaleString()}</td>
                                                <td>{x.finishTime ? x.finishTime.toLocaleString() : '-'}</td>
                                            </tr>)
                                    }
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col></Col>
            </Row>
        </DefaultLayout>
    );
}