import React from 'react';
import { Card, Button, ButtonGroup } from 'react-bootstrap';
import { useChallenge, useDispatch } from '../hooks';
import { randomSwapTitles, swapTitles } from '../stateSlice';

interface SwapTitlesProps {
    selectedUsers: Set<number>;
}

export default function SwapTitles({ selectedUsers }: SwapTitlesProps): JSX.Element {
    const challenge = useChallenge();
    const dispatch = useDispatch();

    function swap() {
        if (challenge !== undefined) {
            dispatch(swapTitles({
                challengeId: challenge.id,
                userIds: {
                    ids: [...selectedUsers.values()]
                }
            }));
        }
    }

    function randomSwap() {
        if (challenge !== undefined) {
            dispatch(randomSwapTitles({
                challengeId: challenge.id,
                userIds: {
                    ids: [...selectedUsers.values()]
                }
            }));
        }
    }

    if (!challenge?.isCreator || challenge.finishTime !== null)
        return (<></>);
    return (
        <Card className="mb-2">
            <Card.Body>
                <ButtonGroup>
                    <Button onClick={swap} disabled={selectedUsers.size !== 2}>Swap Titles</Button>
                    <Button onClick={randomSwap} disabled={selectedUsers.size <= 2}>Random Swap</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    );
}