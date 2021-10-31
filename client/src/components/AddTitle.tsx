import React, { useEffect, useState } from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import { CreateTitleParams } from '../../../common/api/models';
import { useSelector } from '../hooks';
import DropdownPoolSelector from './DropdownPoolSelector';

interface AddTitleProps {
    onAdd(poolName: string, title: CreateTitleParams): void
}

export default function AddTitle({ onAdd }: AddTitleProps): JSX.Element {
    const challenge = useSelector(state => state.challenge);
    const pools = useSelector(state => state.pools);
    const [title, setTitle] = useState<CreateTitleParams>({
        name: '',
        url: '',
        isHidden: false,
    });
    const [poolName, setPoolName] = useState<string>('');

    async function update(e: React.ChangeEvent<HTMLInputElement>) {
        setTitle({
            ...title,
            [e.target.id]: e.target.value
        });
    }

    useEffect(() => {
        if (pools.length > 0 && poolName === '')
            setPoolName(pools[0].name);
    }, [pools]);

    if (!challenge || !challenge.isParticipant)
        return (<></>);
    return (
        <Card>
            <Card.Body>
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    onAdd(poolName, title);
                }}>
                    <Form.Group className="mb-2">
                        <Form.Label>Title name</Form.Label>
                        <Form.Control id="name" onChange={update} required />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Title URL</Form.Label>
                        <Form.Control id="url" onChange={update} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Pool</Form.Label>
                        <DropdownPoolSelector onSelect={(pool) => setPoolName(pool.name)} />
                    </Form.Group>
                    <Row>
                        <Col lg="7"></Col>
                        <Col lg="5">
                            <Button type="submit" className="w-100">Add Title</Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
}