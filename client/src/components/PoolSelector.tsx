import React, { useEffect, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import { Pool } from '../../../common/api/models';
import { usePools } from '../hooks';

interface PoolSelectorProps {
    onSelect(pool: Pool): void;
}

export default function PoolSelector({ onSelect }: PoolSelectorProps): JSX.Element {
    const pools = usePools();
    const [pool, setPool] = useState<Pool>();

    function selectPool(p: Pool) {
        setPool(p);
        onSelect(p);
    }

    useEffect(() => {
        if (pools.length > 0) {
            console.log('change', pool, pools);
            selectPool(pools[0]);
        }
    }, [pools]);

    return (
        <ListGroup>
            {pools.map(x =>
                <ListGroup.Item
                    type="button"
                    active={pool?.id === x.id}
                    onClick={() => selectPool(x)}>
                    {x.name}
                </ListGroup.Item>)}
        </ListGroup>
    );
}