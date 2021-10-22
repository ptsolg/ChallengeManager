import React, { useEffect, useState } from 'react';
import { Pool, RoundExt } from '../../../common/api/models';
import { fetchPools, startRound } from '../api/challenge';
import DropdownPoolSelector from './DropdownPoolSelector';

interface StartRoundProps {
    challengeId: number;
    onNewRound(round: RoundExt): void;
}

export default function StartRound({ challengeId, onNewRound }: StartRoundProps): JSX.Element {
    const [pools, setPools] = useState<Pool[]>([]);
    const [poolName, setPoolName] = useState('');
    const [numDays, setNumDays] = useState('7');

    function update(e: React.ChangeEvent<HTMLInputElement>) {
        if (!/^\d*$/.test(e.target.value))
            return;
        setNumDays(e.target.value);
    }

    function start() {
        const finish = new Date(Date.now());
        finish.setDate(finish.getDate() + parseInt(numDays));
        startRound(challengeId, {
            poolName: poolName,
            finishTime: finish
        }).then(onNewRound);
    }

    useEffect(() => {
        fetchPools(challengeId).then(setPools);
    }, []);

    return (
        <div className="card card-body">
            <label className="mb-2">Pool: {poolName}</label>
            <DropdownPoolSelector className="mb-2" pools={pools} onSelect={(pool) => setPoolName(pool.name)} />
            <label className="mb-2">Length (days):</label>
            <div className="row">
                <div className="col-sm-6 mb-2">
                    <input className="form-control" onChange={update} value={numDays.toString()} required></input>
                </div>
                <div className="col-sm-6">
                    <button className="btn btn-primary w-100" onClick={start}>Start round</button>
                </div>
            </div>
        </div>
    );
}