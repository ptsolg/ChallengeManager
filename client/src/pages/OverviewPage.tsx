import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import showdown from 'showdown';
import { ClientChallenge } from '../../../common/api/models';
import { fetchClientChallenge, joinChallenge, leaveChallenge } from '../api/challenge';
import ChallengeInfo from '../components/ChallengeInfo';
import DefaultLayout from '../components/layout/DefaultLayout';
import { getPageParams, PageProps } from '../utils/page';

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
            <Row>
                <Col md="8">
                    <Card>
                        <Card.Body>
                            <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(challenge?.description ?? '') }}></div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md="4">
                    <ChallengeInfo challenge={challenge} user={user} onJoin={join} onLeave={leave} />
                </Col>
            </Row>
        </DefaultLayout>
    );
}