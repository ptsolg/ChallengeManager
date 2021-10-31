import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch, useChallengeId } from '../hooks';
import { leave, join } from '../stateSlice';

export default function ChallengeInfo(): JSX.Element {
    const cid = useChallengeId();
    const challenge = useSelector(state => state.challenge);
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();

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
                                <Button onClick={() => dispatch(leave(cid))} variant="danger" className="w-100">Leave</Button>
                                :
                                <Button
                                    onClick={() => dispatch(join(cid))}
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