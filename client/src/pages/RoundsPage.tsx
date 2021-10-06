import React, { useEffect, useState } from 'react';
import { Round, Roll } from '../../../common/api/models';
import { fetchRounds } from '../api/challenge';
import { fetchRolls } from '../api/round';
import DefaultLayout from '../components/layout/DefaultLayout';
import { getPageParams } from '../utils/page';

export default function RoundsPage(): JSX.Element {
    const challengeId = getPageParams().challengeId;
    const [rounds, setRounds] = useState<Round[]>([]);
    const [rolls, setRolls] = useState<Roll[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState(-1);

    function selectRound(roundId: number) {
        setSelectedRoundId(roundId);
        fetchRolls(roundId).then(setRolls);
    }

    useEffect(() => {
        fetchRounds(challengeId).then(x => {
            setRounds(x);
            if (x.length > 0)
                selectRound(x[0].id);
        });
    }, []);

    return (
        <DefaultLayout challengeId={challengeId}>
            <div className="row">
                <div className="col-sm-2"></div>
                <div className="col-sm-8">
                    <div className="card card-body">
                        <nav>
                            <ul className="pagination flex-wrap">
                                {
                                    rounds.map(x =>
                                        <li className={`page-item ${x.id === selectedRoundId ? 'active' : ''}`}>
                                            <button
                                                id={x.id.toString()}
                                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => selectRound(parseInt(e.currentTarget.id))}
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
                                            <td>{x.userName}</td>
                                            <td>{x.titleName}</td>
                                            <td>{x.score}</td>
                                        </tr>)
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="col-sm-2"></div>
            </div>
        </DefaultLayout >
    );
}