import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { ParticipantExt } from '../../../common/api/models';
import { fetchParticipants } from '../api';
import DefaultLayout from '../components/layout/DefaultLayout';
import { useChallengeId } from '../hooks';

export default function ParticipantsPage(): JSX.Element {
    const challengeId = useChallengeId();
    const [participants, setParticipants] = useState<ParticipantExt[]>([]);
    useEffect(() => {
        fetchParticipants(challengeId).then(setParticipants);
    }, []);

    return (
        <DefaultLayout >
            <Row>
                <Col md="2"></Col>
                <Col md="8">
                    <Card>
                        <Card.Body>
                            <Table striped>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Karma</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        participants.map((x, i) =>
                                            <tr>
                                                <td scope="row">{i}</td>
                                                <td>{x.user.name}</td>
                                                <td>{x.karma}</td>
                                            </tr>)
                                    }
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md="2"></Col>
            </Row>
        </DefaultLayout>
    );
}