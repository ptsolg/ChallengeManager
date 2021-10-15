import React, { useEffect, useState } from 'react';
import { Pool, TitleExt } from '../../../common/api/models';
import { fetchTitles } from '../api/challenge';

interface PoolSelectorProps {
    challengeId: number,
    pools: Pool[],
    setTitles(titles: TitleExt[]): void,
    setPoolName(poolName: string): void,
}

export default function PoolSelector({ challengeId, pools, setTitles, setPoolName }: PoolSelectorProps): JSX.Element {
    const [selectedPool, setSelectedPool] = useState('');

    function selectPool(poolName: string) {
        setSelectedPool(poolName);
        setPoolName(poolName);
        fetchTitles(challengeId, poolName).then(setTitles);
    }

    useEffect(() => {
        if (pools.length > 0 && selectedPool == '')
            selectPool(pools[0].name);
    }, [pools]);

    return (
        <div className="list-group">
            {
                pools.map(x =>
                    <button
                        id={x.id.toString()}
                        type="button"
                        onClick={() => selectPool(x.name)}
                        className={`list-group-item list-group-item-action ${selectedPool == x.name ? 'active' : ''}`}>
                        {x.name}
                    </button>)
            }
        </div>
    );
}