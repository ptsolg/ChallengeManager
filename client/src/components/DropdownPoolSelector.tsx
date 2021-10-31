import React, { useEffect, useState } from 'react';
import { InputGroup, FormControl, Dropdown } from 'react-bootstrap';
import { Pool } from '../../../common/api/models';
import { useSelector } from '../hooks';

interface DropdownPoolSelectorProps {
    className?: string;
    onSelect(pool: Pool): void;
}

export default function DropdownPoolSelector({ className, onSelect }: DropdownPoolSelectorProps): JSX.Element {
    const pools = useSelector(state => state.pools);
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
        <InputGroup className={className}>
            <FormControl value={pool.name} disabled />
            <Dropdown>
                <Dropdown.Toggle />
                <Dropdown.Menu>
                    {pools.map(x => <Dropdown.Item onClick={() => select(x)}>{x.name}</Dropdown.Item>)}
                </Dropdown.Menu>
            </Dropdown>
        </InputGroup>
    );
}