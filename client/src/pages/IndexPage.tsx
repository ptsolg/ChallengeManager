import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Challenge } from '../../../common/api/models';
import { fetchChallenges } from '../api/challenge';
import DefaultLayout from '../components/layout/DefaultLayout';
import { PageProps } from '../utils/page';

export default function IndexPage({ user }: PageProps): JSX.Element {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    useEffect(() => {
        fetchChallenges().then(setChallenges);
    }, []);

    return (
        <DefaultLayout>
            <div className="row">
                <div className="col-sm-2">
                </div>
                <div className="col-sm-8">
                    <div className="card card-body">
                        {
                            user === undefined
                                ? null
                                : <Link to="/new-challenge" className="btn btn-success w-25 ms-auto me-0">
                                    New Challenge
                                </Link>
                        }
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Start time</th>
                                    <th scope="col">Finish time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    challenges.map(x =>
                                        <tr key={x.id}>
                                            <td>
                                                <Link to={`/challenge/${x.id}`}>{x.name}</Link>
                                            </td>
                                            <td>{x.startTime.toLocaleString()}</td>
                                            <td>{x.finishTime ? x.finishTime.toLocaleString() : '-'}</td>
                                        </tr>)
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="col-sm-2">
                </div>
            </div>
        </DefaultLayout>
    );
}