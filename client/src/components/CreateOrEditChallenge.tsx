import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Card, Button } from 'react-bootstrap';
import { useHistory } from 'react-router';
import showdown from 'showdown';
import { CreateChallengeParams } from '../../../common/api/models';
import { editChallenge, newChallenge } from '../api';
import DefaultLayout from '../components/layout/DefaultLayout';
import { useSelector } from '../hooks';

export default function CreateOrEditChallenge(): JSX.Element {
    const history = useHistory();
    const oldChallenge = useSelector(state => state.challenge);
    const [challenge, setChallenge] = useState<CreateChallengeParams>({
        name: '',
        allowHidden: true,
        description: '',
        awardUrl: null
    });
    const [preview, setPreview] = useState('');

    function updateLivePreview(text: string) {
        const converter = new showdown.Converter({
            smoothLivePreview: true
        });
        setPreview(converter.makeHtml(text));
        setChallenge({
            ...challenge,
            description: text
        });
    }

    function switchAllowHidden() {
        setChallenge({
            ...challenge,
            allowHidden: !challenge.allowHidden
        });
    }

    function update(e: React.ChangeEvent<HTMLInputElement>) {
        setChallenge({
            ...challenge,
            [e.target.id]: e.target.value
        });
    }

    function onSubmit() {
        (oldChallenge === undefined
            ? newChallenge(challenge)
            : editChallenge({ ...oldChallenge, ...challenge }))
            .then(c => history.push(`/challenge/${c.id}`));
    }

    useEffect(() => {
        if (oldChallenge) {
            updateLivePreview(oldChallenge.description);
            setChallenge(oldChallenge);
        }
    }, [oldChallenge]);

    return (
        <DefaultLayout>
            <Row>
                <Col></Col>
                <Col xxl="8">
                    <Card>
                        <Card.Body>
                            <Form onSubmit={(e) => {
                                e.preventDefault();
                                onSubmit();
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
                                    {oldChallenge === undefined ? 'Create' : 'Edit'} Challenge
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