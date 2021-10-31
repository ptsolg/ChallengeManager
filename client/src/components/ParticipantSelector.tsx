import React, { useEffect, useState } from 'react';
import { InputGroup, FormControl, Dropdown } from 'react-bootstrap';
import { ParticipantExt } from '../../../common/api/models';
import { useChallengeId, useDispatch, useParticipants, useUser } from '../hooks';
import { fetchParticipants } from '../stateSlice';

interface ParticipantSelectorProps {
    onSelect(participant: ParticipantExt): void;
    className?: string;
}

export default function ParticipantSelector({ onSelect, className }: ParticipantSelectorProps): JSX.Element {
    const cid = useChallengeId();
    const participants = useParticipants();
    const user = useUser();
    const dispatch = useDispatch();
    const [participant, setParticipant] = useState<ParticipantExt>();

    function getName(p: ParticipantExt | undefined): string {
        if (p === undefined)
            return '';
        return p.userId === user?.id
            ? `${p.user.name} (me)` : p.user.name;
    }

    function select(p: ParticipantExt) {
        setParticipant(p);
        onSelect(p);
    }

    useEffect(() => {
        dispatch(fetchParticipants(cid));
    }, []);

    useEffect(() => {
        if (participant === undefined && participants.length > 0)
            setParticipant(participants.find(x => user && x.userId === user.id));
    }, [participants]);

    return (
        <InputGroup className={className}>
            <FormControl value={getName(participant)} disabled />
            <Dropdown>
                <Dropdown.Toggle />
                <Dropdown.Menu>
                    {participants.map(x => <Dropdown.Item onClick={() => select(x)}>{getName(x)}</Dropdown.Item>)}
                </Dropdown.Menu>
            </Dropdown>
        </InputGroup>
    );
}