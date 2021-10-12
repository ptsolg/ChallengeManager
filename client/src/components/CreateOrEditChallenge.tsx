import React, { useEffect, useState } from 'react';
import showdown from 'showdown';
import { Challenge } from '../../../common/api/models';
import DefaultLayout from '../components/layout/DefaultLayout';

interface CreateOrEditChallengeProps {
    challenge?: Challenge,
    onSubmit(challenge: Challenge): void
}

export default function CreateOrEditChallenge(props: CreateOrEditChallengeProps): JSX.Element {
    const [challenge, setChallenge] = useState<Challenge>({
        id: -1,
        name: '',
        creatorId: -1,
        startTime: new Date(Date.now()),
        finishTime: null,
        allowHidden: true,
        description: '',
        awardUrl: null
    });
    const [preview, setPreview] = useState('');

    async function updateLivePreview(text: string) {
        const converter = new showdown.Converter({
            smoothLivePreview: true
        });
        setPreview(converter.makeHtml(text));
        setChallenge({
            ...challenge,
            description: text
        });
    }

    async function switchAllowHidden() {
        setChallenge({
            ...challenge,
            allowHidden: !challenge.allowHidden
        });
    }

    async function update(e: React.ChangeEvent<HTMLInputElement>) {
        setChallenge({
            ...challenge,
            [e.target.id]: e.target.value
        });
    }

    useEffect(() => {
        if (props.challenge) {
            setChallenge(props.challenge);
            updateLivePreview(props.challenge.description);
        }
    }, [props.challenge]);

    return (
        <DefaultLayout>
            <div className="row">
                <div className="col-sm-1">
                </div>
                <div className="col-sm-10">
                    <div className="card card-body">
                        <form onSubmit={(event) => {
                            event.preventDefault();
                            props.onSubmit(challenge);
                        }}>
                            <div className="row mb-3">
                                <div className="col-sm-4">
                                    <label className="mb-2" htmlFor="name">Challenge Name</label>
                                    <input
                                        id="name"
                                        onChange={update}
                                        className="form-control mb-3"
                                        type="text"
                                        value={challenge.name}
                                        required />
                                    <div className="form-check form-switch">
                                        <label className="form-check-label" htmlFor="allowHidden">Allow hidden titles</label>
                                        <input
                                            id="allowHidden"
                                            onChange={switchAllowHidden}
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={challenge.allowHidden} />
                                    </div>
                                </div>
                                <div className="col-sm-4">
                                    <label className="mb-2" htmlFor="awardUrl">Award URL</label>
                                    <input id="awardUrl" className="form-control" onChange={update} type="text" />
                                </div>
                                <div className="col-sm-4"></div>
                            </div>
                            <div className="row mb-3">
                                <label className="mb-2" htmlFor={'description'}>Description</label>
                                <div className="col-sm-6">
                                    <textarea
                                        id="description"
                                        onChange={(e) => { updateLivePreview(e.target.value); }}
                                        className="form-control"
                                        rows={6}
                                        value={challenge.description} />
                                </div>
                                <div className="col-sm-6">
                                    <div className="border rounded h-100 p-2" dangerouslySetInnerHTML={{ __html: preview }}></div>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary float-end">
                                {props.challenge === undefined ? 'Create' : 'Edit'} Challenge
                            </button>
                        </form>
                    </div>
                </div>
                <div className="col-sm-1">
                </div>
            </div>
        </DefaultLayout>
    );
}