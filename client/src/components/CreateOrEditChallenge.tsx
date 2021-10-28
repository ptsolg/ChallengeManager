import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Card, Button } from 'react-bootstrap';
import showdown from 'showdown';
import { CreateChallengeParams } from '../../../common/api/models';
import DefaultLayout from '../components/layout/DefaultLayout';

interface CreateOrEditChallengeProps {
    challenge?: CreateChallengeParams,
    onSubmit(params: CreateChallengeParams): void
}

export default function CreateOrEditChallenge(props: CreateOrEditChallengeProps): JSX.Element {
    const [challenge, setChallenge] = useState<CreateChallengeParams>({
        name: '',
        allowHidden: true,
        description: '',
        awardUrl: null
    });
    const [preview, setPreview] = useState('');

    async function updateLivePreview(text: string) {
        const converter = new showdown.Converter({
            smoothLivePreview: true
        });
        setPreview(converter.makeHtml(text));
        setChallenge({
            ...challenge,
            description: text
        });
    }

    async function switchAllowHidden() {
        setChallenge({
            ...challenge,
            allowHidden: !challenge.allowHidden
        });
    }

    async function update(e: React.ChangeEvent<HTMLInputElement>) {
        setChallenge({
            ...challenge,
            [e.target.id]: e.target.value
        });
    }

    useEffect(() => {
        if (props.challenge) {
            updateLivePreview(props.challenge.description);
            setChallenge(props.challenge);
        }
    }, [props.challenge]);

    return (
        <DefaultLayout>
            <Row>
                <Col></Col>
                <Col xxl="8">
                    <Card>
                        <Card.Body>
                            <Form onSubmit={(e) => {
                                e.preventDefault();
                                props.onSubmit(challenge);
                            }}>
                                <Row className="mb-3">
                                    <Col md="6">
                                        <Form.Group >
                                            <Form.Label>Challenge Name</Form.Label>
                                            <Form.Control id="name" onChange={update} value={challenge.name} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md="6">
                                        <Form.Group >
                                            <Form.Label>Award URL</Form.Label>
                                            <Form.Control id="awardUrl" onChange={update} value={challenge.awardUrl ?? undefined} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        label="Allow hidden titles"
                                        onChange={switchAllowHidden}
                                        checked={challenge.allowHidden} />
                                </Form.Group>
                                <Row className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Col md="6">
                                        <Form.Control
                                            as="textarea"
                                            onChange={(e) => { updateLivePreview(e.target.value); }}
                                            value={challenge.description} />
                                    </Col>
                                    <Col md="6">
                                        <div className="border rounded h-100 p-2" dangerouslySetInnerHTML={{ __html: preview }}></div>
                                    </Col>
                                </Row>
                                <Button type="submit" className="float-end">
                                    {props.challenge === undefined ? 'Create' : 'Edit'} Challenge
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col></Col>
            </Row>
        </DefaultLayout>
    );
}