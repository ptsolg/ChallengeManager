import React, { useEffect, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import { TitleExt } from '../../../common/api/models';
import { fetchTitles } from '../api';
import { useChallengeId, useSelector } from '../hooks';

interface PoolSelectorProps {
    setTitles(titles: TitleExt[]): void,
    setPoolName(poolName: string): void,
}

export default function PoolSelector({ setTitles, setPoolName }: PoolSelectorProps): JSX.Element {
    const cid = useChallengeId();
    const pools = useSelector(state => state.pools);
    const [selectedPool, setSelectedPool] = useState('');

    function selectPool(poolName: string) {
        setSelectedPool(poolName);
        setPoolName(poolName);
        fetchTitles(cid, poolName).then(setTitles);
    }

    useEffect(() => {
        if (pools.length > 0 && selectedPool == '')
            selectPool(pools[0].name);
    }, [pools]);

    return (
        <ListGroup>
            {pools.map(x =>
                <ListGroup.Item
                    type="button"
                    active={selectedPool === x.name}
                    onClick={() => selectPool(x.name)}>
                    {x.name}
                </ListGroup.Item>)}
        </ListGroup>
    );
}