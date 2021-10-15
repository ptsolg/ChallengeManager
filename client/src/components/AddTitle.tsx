import React, { useEffect, useState } from 'react';
import { ClientChallenge, CreateTitleParams, Pool } from '../../../common/api/models';

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
    const [pool, setPool] = useState({
        id: -1,
        name: ''
    });

    async function update(e: React.ChangeEvent<HTMLInputElement>) {
        setTitle({
            ...title,
            [e.target.id]: e.target.value
        });
    }

    useEffect(() => {
        if (pools.length > 0 && pool.id == -1)
            setPool({ id: pools[0].id, name: pools[0].name });
    }, [pools]);

    return (
        <div className="card card-body">
            <label className="mb-2" htmlFor="name">Title name:</label>
            <input className="form-control mb-2" id="name" onChange={update} required />
            <label className="mb-2" htmlFor="url">Title URL:</label>
            <input className="form-control mb-2" id="url" onChange={update} required />
            <label className="mb-2" htmlFor="url">Pool:</label>
            <div className="input-group mb-2">
                <input type="text" className="form-control" disabled value={pool.name} />
                <div className="input-group-append">
                    <button className="btn btn-primary dropdown-toggle dropdown-toggle-split" id="dropdownButton" data-bs-toggle="dropdown"></button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownButton">
                        {pools.map(x => <li className="dropdown-item" onClick={() => setPool({ id: x.id, name: x.name })}>{x.name}</li>)}
                    </ul>
                </div>
            </div>
            <div className="row">
                <div className="col-8"></div>
                <div className="col-4">
                    <button className="btn btn-primary w-100" onClick={() => onAdd(pool.name, title)}>Add</button>
                </div>
            </div>
        </div>
    );
}