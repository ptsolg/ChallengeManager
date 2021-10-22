import React, { useEffect, useState } from 'react';
import { ClientChallenge, CreateTitleParams, Pool } from '../../../common/api/models';
import DropdownPoolSelector from './DropdownPoolSelector';

interface AddTitleProps {
    pools: Pool[],
    challenge?: ClientChallenge,
    onAdd(poolName: string, title: CreateTitleParams): void
}

export default function AddTitle({ pools, challenge, onAdd }: AddTitleProps): JSX.Element {
    if (!challenge || !challenge.isParticipant)
        return (<></>);

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

    return (
        <div className="card card-body">
            <label className="mb-2" htmlFor="name">Title name:</label>
            <input className="form-control mb-2" id="name" onChange={update} required />
            <label className="mb-2" htmlFor="url">Title URL:</label>
            <input className="form-control mb-2" id="url" onChange={update} required />
            <label className="mb-2">Pool:</label>
            <DropdownPoolSelector className="mb-2" pools={pools} onSelect={(pool) => setPoolName(pool.name)} />
            <div className="row">
                <div className="col-8"></div>
                <div className="col-4">
                    <button className="btn btn-primary w-100" onClick={() => onAdd(poolName, title)}>Add</button>
                </div>
            </div>
        </div>
    );
}