import React, { useState } from 'react';
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
        <div className="row mt-3">
            <div className="col-8 pe-0">
                <input className="form-control" value={pool.name} onChange={update}></input>
            </div>
            <div className="col-4">
                <button className="btn btn-primary w-100" onClick={() => onAdd(pool)}>Add</button>
            </div>
        </div>
    );
}