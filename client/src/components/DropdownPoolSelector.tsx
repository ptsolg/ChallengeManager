import React, { useEffect, useState } from 'react';
import { Pool } from '../../../common/api/models';

interface DropdownPoolSelectorProps {
    pools: Pool[];
    className?: string;
    onSelect(pool: Pool): void;
}

export default function DropdownPoolSelector({ pools, className, onSelect }: DropdownPoolSelectorProps): JSX.Element {
    const [pool, setPool] = useState({
        id: -1,
        name: ''
    });

    function select(pool: Pool) {
        setPool({ id: pool.id, name: pool.name });
        onSelect(pool);
    }

    useEffect(() => {
        if (pools.length > 0)
            select(pools[0]);
    }, [pools]);

    return (
        <div className={`input-group ${className}`}>
            <input type="text" className="form-control" disabled value={pool.name} />
            <div className="input-group-append">
                <button className="btn btn-primary dropdown-toggle dropdown-toggle-split" id="dropdownButton" data-bs-toggle="dropdown"></button>
                <ul className="dropdown-menu" aria-labelledby="dropdownButton">
                    {pools.map(x => <li className="dropdown-item" onClick={() => select(x)}>{x.name}</li>)}
                </ul>
            </div>
        </div>
    );
}