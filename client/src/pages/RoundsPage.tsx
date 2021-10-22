import React, { useEffect, useState } from 'react';
import { Round, RollExt, RoundExt } from '../../../common/api/models';
import { fetchRolls, fetchRounds } from '../api/challenge';
import DefaultLayout from '../components/layout/DefaultLayout';
import StartRound from '../components/StartRound';
import { getPageParams } from '../utils/page';

export default function RoundsPage(): JSX.Element {
    const challengeId = getPageParams().challengeId;
    const [rounds, setRounds] = useState<Round[]>([]);
    const [rolls, setRolls] = useState<RollExt[]>([]);
    const [selectedRoundNum, setSelectedRoundNum] = useState(-1);

    function selectRound(roundNum: number) {
        setSelectedRoundNum(roundNum);
        fetchRolls(challengeId, roundNum).then(setRolls);
    }

    function onNewRound(round: RoundExt) {
        setRounds([round, ...rounds]);
        setRolls(round.rolls);
    }

    useEffect(() => {
        fetchRounds(challengeId).then(x => {
            setRounds(x);
            if (x.length > 0)
                selectRound(x[0].num);
        });
    }, []);

    return (
        <DefaultLayout challengeId={challengeId}>
            <div className="row">
                <div className="col-sm-3">
                    <StartRound challengeId={challengeId} onNewRound={onNewRound} />
                </div>
                <div className="col-sm-6">
                    <div className="card card-body">
                        <nav>
                            <ul className="pagination flex-wrap">
                                {
                                    rounds.map(x =>
                                        <li className={`page-item ${x.num === selectedRoundNum ? 'active' : ''}`}>
                                            <button
                                                onClick={() => selectRound(x.num)}
                                                className="page-link">
                                                {x.num + 1}
                                            </button>
                                        </li>)
                                }
                            </ul>
                        </nav>
                        <hr />
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">User</th>
                                    <th scope="col">Title</th>
                                    <th scope="col">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    rolls.map((x, i) =>
                                        <tr>
                                            <td scope="row">{i}</td>
                                            <td>{x.watcher.name}</td>
                                            <td>{x.title.name}</td>
                                            <td>{x.score}</td>
                                        </tr>)
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="col-sm-3"></div>
            </div>
        </DefaultLayout >
    );
}