import React, { useEffect, useState } from 'react';
import { ClientChallenge, Pool, Round, RoundExt } from '../../../common/api/models';
import { fetchClientChallenge, fetchPools, startRound } from '../api/challenge';
import DropdownPoolSelector from './DropdownPoolSelector';

interface StartFinishRoundProps {
    challengeId: number;
    rounds: Round[];
    onStart(round: RoundExt): void;
    onFinish(): void;
}

export default function StartFinishRound({ challengeId, rounds, onStart, onFinish }: StartFinishRoundProps): JSX.Element {
    const [challenge, setChallenge] = useState<ClientChallenge>();
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
        }).then(onStart);
    }

    useEffect(() => {
        fetchPools(challengeId).then(setPools);
        fetchClientChallenge(challengeId).then(setChallenge);
    }, []);

    if (challenge === undefined || !challenge.isCreator)
        return <></>;
    if (rounds.length === 0 || rounds[rounds.length - 1].isFinished)
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
    return (
        <div className="card card-body">
            <button className="btn btn-primary" onClick={onFinish}>Finish round</button>
        </div>
    );
}