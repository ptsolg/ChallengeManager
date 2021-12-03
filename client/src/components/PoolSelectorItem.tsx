import React, { useState } from 'react';
import { FormControl, ListGroup } from 'react-bootstrap';
import { faTrashAlt, faCog, faSave } from '@fortawesome/free-solid-svg-icons';
import { CreatePoolParams, Pool } from '../../../common/api/models';
import IconButton from './IconButton';
import { useChallenge, useChallengeId, useDispatch } from '../hooks';
import { deletePool, editPool } from '../stateSlice';

interface PoolSelectorProps {
    pool: Pool;
    active?: boolean;
    onClick?: () => void;
}

export default function PoolSelectorItem({ pool, active, onClick }: PoolSelectorProps): JSX.Element {
    const cid = useChallengeId();
    const [isEditing, setIsEditing] = useState(false);
    const [params, setParams] = useState<CreatePoolParams>({
        name: pool.name
    });
    const dispatch = useDispatch();

    function edit() {
        setIsEditing(!isEditing);
        dispatch(editPool({
            challengeId: cid,
            name: pool.name,
            params: params
        }));
    }

    function del() {
        dispatch(deletePool({
            challengeId: cid,
            name: pool.name
        }));
    }

    const controls = useChallenge()?.isCreator
        ?
        <>
            <IconButton className="float-end" onClick={del} icon={faTrashAlt} />
            <IconButton className="float-end" onClick={edit} icon={isEditing ? faSave : faCog} />
        </>
        :
        <></>;

    return (
        <ListGroup.Item
            type="button"
            active={active}
            onClick={onClick}>
            {
                isEditing
                    ?
                    <FormControl
                        className="d-inline w-50"
                        onChange={(e) => setParams({ name: e.target.value })}
                        value={params.name} />
                    :
                    params.name
            }
            {controls}
        </ListGroup.Item>
    );
}