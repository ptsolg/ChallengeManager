import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { ClientChallenge, User } from '../../../common/api/models';

interface ChallengeInfoProps {
    challenge?: ClientChallenge;
    user?: User;
    onJoin(): void;
    onLeave(): void;
}

export default function ChallengeInfo({ challenge, user, onJoin, onLeave }: ChallengeInfoProps): JSX.Element {
    if (challenge === undefined)
        return <></>;

    return (
        <Card>
            <Card.Body>
                <p className="mb-3 text-center"><strong>{challenge.name}</strong></p>
                <Row className="mb-2">
                    <Col lg="4"><dt>Start time</dt></Col>
                    <Col lg="8"><dd>{challenge?.startTime.toLocaleString()}</dd></Col>
                </Row>
                <Row className="mb-2">
                    <Col lg="4"><dt>Finish time</dt></Col>
                    <Col lg="8"><dd>{challenge?.finishTime ? challenge.finishTime.toLocaleString() : '-'}</dd></Col>
                </Row>
                <Row className="mb-2">
                    <Col lg="4"><dt>Allow hidden</dt></Col>
                    <Col lg="8"><dd>{challenge?.allowHidden ? 'Allow' : 'Disallow'}</dd></Col>
                </Row>
                <Row className="mb-2">
                    <Col lg="4"><dt>Award</dt></Col>
                    <Col lg="8">
                        <dd>
                            <div className="ms-auto me-auto" style={{ width: "48px" }}>
                                <img className="img-fluid" src={challenge?.awardUrl ?? ''}></img>
                            </div>
                        </dd>
                    </Col>
                </Row>
                <Row>
                    <Col sm="4"></Col>
                    <Col sm="4">
                        {
                            user !== undefined && user.id == challenge.creatorId && challenge.finishTime === null
                                ?
                                <LinkContainer to={`/edit-challenge/${challenge.id}`}>
                                    <Button className="w-100">Edit</Button>
                                </LinkContainer>
                                :
                                null
                        }
                    </Col>
                    <Col sm="4">
                        {
                            challenge.isParticipant
                                ?
                                <Button onClick={onLeave} variant="danger" className="w-100">Leave</Button>
                                :
                                <Button
                                    onClick={onJoin}
                                    variant={challenge.canJoin ? 'success' : 'secondary'}
                                    className="w-100"
                                    disabled={!challenge.canJoin}>Join</Button>
                        }
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}