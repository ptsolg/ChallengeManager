import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { CreatePoolParams } from '../../../common/api/models';
import { useChallenge, useDispatch } from '../hooks';
import { addPool } from '../stateSlice';

export default function AddPool(): JSX.Element {
    const challenge = useChallenge();
    const dispatch = useDispatch();
    const [pool, setPool] = useState<CreatePoolParams>({ name: '' });

    async function update(e: React.ChangeEvent<HTMLInputElement>) {
        setPool({ ...pool, name: e.target.value });
    }

    if (!challenge?.isCreator)
        return (<></>);
    return (
        <Form className="mt-2" onSubmit={(e) => {
            e.preventDefault();
            dispatch(addPool({ challengeId: challenge.id, params: pool }));
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