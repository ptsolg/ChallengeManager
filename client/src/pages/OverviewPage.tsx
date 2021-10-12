import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import showdown from 'showdown';
import { ClientChallenge, User } from '../../../common/api/models';
import { fetchClientChallenge, joinChallenge, leaveChallenge } from '../api/challenge';
import DefaultLayout from '../components/layout/DefaultLayout';
import { getPageParams, PageProps } from '../utils/page';

function createActionButton(user: User, cc: ClientChallenge,
    onJoin: () => Promise<void>, onLeave: () => void): JSX.Element {
    const css = "btn float-end w-25";
    if (cc?.isParticipant) {
        const enabled = cc.finishTime === null;
        return (<button className={`${css} ${enabled ? 'btn-danger' : 'btn-secondary'}`}
            onClick={onLeave} disabled={!enabled}>Leave</button>);
    } else {
        return (<button className={`${css} ${cc?.canJoin ? 'btn-success' : 'btn-secondary'}`}
            onClick={onJoin} disabled={!cc?.canJoin}>Join</button>);
    }
}

export default function OverviewPage({ user }: PageProps): JSX.Element {
    const challengeId = getPageParams().challengeId;
    const converter = new showdown.Converter();
    const [challenge, setChallenge] = useState<ClientChallenge>();

    async function update() {
        fetchClientChallenge(challengeId).then(setChallenge);
    }

    async function join() {
        if (challenge !== undefined)
            joinChallenge(challenge.id).then(_ => setChallenge({
                ...challenge,
                canJoin: false,
                isParticipant: true
            }));
    }

    async function leave() {
        if (challenge !== undefined)
            leaveChallenge(challenge.id).then(_ => update());
    }

    useEffect(() => { update(); }, []);

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

                            {user && challenge ? createActionButton(user, challenge, join, leave) : null}
                            {
                                user && challenge && user.id == challenge.creatorId && challenge.finishTime === null
                                    ? <Link to={`/edit-challenge/${challenge.id}`}
                                        className="btn btn-primary w-25 float-end me-2">Edit</Link>
                                    : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
}