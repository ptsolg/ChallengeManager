import React, { useEffect, useState } from 'react';
import { Pool, Title } from '../../../common/api/models';
import { fetchPools } from '../api/challenge';
import { fetchTitles } from '../api/pool';
import DefaultLayout from '../components/layout/DefaultLayout';
import { getPageParams } from '../utils/page';

export default function PoolsPage(): JSX.Element {
    const challengeId = getPageParams().challengeId;
    const [pools, setPools] = useState<Pool[]>([]);
    const [selectedPoolId, setSelectedPoolId] = useState<number>(-1);
    const [titles, setTitles] = useState<Title[]>([]);

    function selectPool(poolId: number) {
        setSelectedPoolId(poolId);
        fetchTitles(poolId).then(setTitles);
    }

    useEffect(() => {
        fetchPools(challengeId).then(x => {
            setPools(x);
            if (x.length > 1)
                selectPool(x[0].id);
        });
    }, []);

    return (
        <DefaultLayout challengeId={challengeId}>
            <div className="row">
                <div className="col-sm-4">
                    <div className="card card-body">
                        <div className="list-group">
                            {
                                pools.map(x =>
                                    <button
                                        id={x.id.toString()}
                                        type="button"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => selectPool(parseInt(e.currentTarget.id))}
                                        className={`list-group-item list-group-item-action ${selectedPoolId == x.id ? 'active' : ''}`}>
                                        {x.name}
                                    </button>)
                            }
                        </div>
                    </div>
                </div>
                <div className="col-sm-8">
                    <div className="card card-body">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Proposer</th>
                                    <th scope="col">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    titles.map((x, i) =>
                                        <tr>
                                            <td scope="row">{i}</td>
                                            <td><a href={x.url}>{x.name}</a></td>
                                            <td>{x.userName}</td>
                                            <td>{x.duration}</td>
                                        </tr>)
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
}