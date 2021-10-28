import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { Challenge, CreatePoolParams, User } from '../../../common/api/models';

interface AddPoolProps {
    user?: User,
    challenge?: Challenge,
    onAdd(pool: CreatePoolParams): void
}

export default function AddPool({ user, challenge, onAdd }: AddPoolProps): JSX.Element {
    if (!user || !challenge || user.id != challenge.creatorId)
        return (<></>);

    const [pool, setPool] = useState<CreatePoolParams>({ name: '' });

    async function update(e: React.ChangeEvent<HTMLInputElement>) {
        setPool({ ...pool, name: e.target.value });
    }

    return (
        <Form className="mt-2" onSubmit={(e) => {
            e.preventDefault();
            onAdd(pool);
        }}>
            <Row>
                <Col lg="7" className="mt-1">
                    <Form.Control onChange={update} required />
                </Col>
                <Col lg="5" className="mt-1">
                    <Button type="submit" className="w-100">Add Pool</Button>
                </Col>
            </Row>
        </Form>
    );
}