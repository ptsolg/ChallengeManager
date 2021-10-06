import React, { useEffect, useState } from 'react';
import { Participant } from '../../../common/api/models';
import { fetchParticipants } from '../api/challenge';
import DefaultLayout from '../components/layout/DefaultLayout';
import { getPageParams } from '../utils/page';

export default function ParticipantsPage(): JSX.Element {
    const challengeId = getPageParams().challengeId;
    const [participants, setParticipants] = useState<Participant[]>([]);
    useEffect(() => {
        fetchParticipants(challengeId).then(setParticipants);
    }, []);

    return (
        <DefaultLayout challengeId={challengeId} >
            <div className="row">
                <div className="col-sm-2">
                </div>
                <div className="col-sm-8">
                    <div className="card card-body">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Karma</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    participants.map((x, i) =>
                                        <tr>
                                            <td scope="row">{i}</td>
                                            <td>{x.user.name}</td>
                                            <td>{x.user.karma}</td>
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