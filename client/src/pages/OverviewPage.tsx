import React, { useEffect, useState } from 'react';
import showdown from 'showdown';
import { Challenge } from '../../../common/api/models';
import { fetchChallenge } from '../api/challenge';
import DefaultLayout from '../components/layout/DefaultLayout';
import { getPageParams } from '../utils/page';

export default function OverviewPage(): JSX.Element {
    const challengeId = getPageParams().challengeId;
    const converter = new showdown.Converter();
    const [challenge, setChallenge] = useState<Challenge>();

    useEffect(() => {
        fetchChallenge(challengeId).then(setChallenge);
    }, []);

    return (
        <DefaultLayout challengeId={challengeId}>
            <div className="row">
                <div className="col-sm-8">
                    <div className="card card-body">
                        <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(challenge?.description ?? '') }}></div>
                    </div>
                </div>
                <div className="col-sm-4">
                    <div className="card mb-3">
                        <div className="card-body">
                            <p className="mb-3 text-center"><strong>{challenge?.name}</strong></p>
                            <dl className="row">
                                <dt className="col-sm-4 mb-2">Start time</dt>
                                <dd className="col-sm-8">{challenge?.startTime.toLocaleString()}</dd>
                                <dt className="col-sm-4 mb-2">Finish time</dt>
                                <dd className="col-sm-8">{challenge?.finishTime ? challenge.finishTime.toLocaleString() : '-'}</dd>
                                <dt className="col-sm-4 mb-2">Allow hidden</dt>
                                <dd className="col-sm-8">{challenge?.allowHidden ? 'Allow' : 'Disallow'}</dd>
                                <dt className="col-sm-4 mb-2">Award</dt>
                                <dd className="col-sm-8 mx-auto">
                                    <div className="ms-auto me-auto" style={{ width: "48px" }}>
                                        <img className="img-fluid" src={challenge?.awardUrl ?? ''}></img>
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
}