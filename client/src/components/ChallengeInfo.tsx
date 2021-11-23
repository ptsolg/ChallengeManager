import React from 'react';
import { Card, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { formatDate } from '../date';
import { useDispatch, useChallenge, useChallengeId } from '../hooks';
import { leave, join, finishChallenge } from '../stateSlice';

export default function ChallengeInfo(): JSX.Element {
    const cid = useChallengeId();
    const challenge = useChallenge();
    const dispatch = useDispatch();

    if (challenge === undefined)
        return <></>;
    return (
        <Card>
            <Card.Body>
                <p className="mb-3 text-center"><strong>{challenge.name}</strong></p>
                <Row className="mb-2">
                    <Col lg="4"><dt>Start time</dt></Col>
                    <Col lg="8"><dd>{formatDate(challenge.startTime)}</dd></Col>
                </Row>
                <Row className="mb-2">
                    <Col lg="4"><dt>Finish time</dt></Col>
                    <Col lg="8"><dd>{formatDate(challenge.finishTime)}</dd></Col>
                </Row>
                <Row className="mb-2">
                    <Col lg="4"><dt>Allow hidden</dt></Col>
                    <Col lg="8"><dd>{challenge.allowHidden ? 'Allow' : 'Disallow'}</dd></Col>
                </Row>
                <Row className="mb-2">
                    <Col lg="4"><dt>Award</dt></Col>
                    <Col lg="8">
                        <dd>
                            <div className="ms-auto me-auto" style={{ width: "48px" }}>
                                <img className="img-fluid" src={challenge.awardUrl ?? ''}></img>
                            </div>
                        </dd>
                    </Col>
                </Row>
                <Row>
                    <ButtonGroup>
                        {
                            challenge.isCreator && challenge.finishTime === null
                                ?
                                <>
                                    <LinkContainer to={`/edit-challenge/${challenge.id}`}>
                                        <Button className="text-center">Edit</Button>
                                    </LinkContainer>
                                    <Button onClick={() => dispatch(finishChallenge(cid))}>End Challenge</Button>
                                </>
                                :
                                null
                        }
                        {
                            challenge.isParticipant
                                ?
                                challenge.finishTime != null
                                    ? <></>
                                    : <Button onClick={() => dispatch(leave(cid))} variant="danger">Leave</Button>
                                :
                                <Button
                                    onClick={() => dispatch(join(cid))}
                                    variant={challenge.canJoin ? 'success' : 'secondary'}
                                    disabled={!challenge.canJoin}>Join</Button>
                        }
                    </ButtonGroup>
                </Row>
            </Card.Body>
        </Card>
    );
}