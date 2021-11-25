import React, { useState } from 'react';
import { ButtonGroup, FormControl, Row, Col } from 'react-bootstrap';
import { faTrashAlt, faCog, faSave } from '@fortawesome/free-solid-svg-icons';
import { EditTitleParams, TitleExt } from '../../../common/api/models';
import { useChallenge, useUser } from '../hooks';
import IconButton from './IconButton';
import { deleteTitle, editTitle } from '../api';

interface TitleRowProps {
    num: number;
    title: TitleExt;
    setTitle: (title: TitleExt) => void;
    onDelete: () => void;
}

export default function TitleRow({ num, title, setTitle, onDelete }: TitleRowProps): JSX.Element {
    const user = useUser();
    const challenge = useChallenge();
    const [isEditing, setIsEditing] = useState(false);
    const [params, setParams] = useState<EditTitleParams>({
        name: title.name,
        url: title.url,
        isHidden: title.isHidden
    });

    function edit() {
        if (isEditing && challenge !== undefined)
            editTitle(challenge.id, title.id, params).then(_ => setTitle({ ...title, ...params }));
        setIsEditing(!isEditing);
    }

    function del() {
        if (challenge !== undefined)
            deleteTitle(challenge?.id, title.id).then(_ => onDelete());
    }

    const controls = title.proposer.id === user?.id || challenge?.isCreator
        ?
        <td>
            <ButtonGroup>
                <IconButton onClick={edit} icon={isEditing ? faSave : faCog} />
                <IconButton onClick={del} icon={faTrashAlt} />
            </ButtonGroup>
        </td>
        :
        <td></td>;

    return (
        <tr>
            <td>{num}</td>
            {
                isEditing
                    ?
                    <td className="w-50">
                        <Row>
                            <Col>
                                <FormControl
                                    onChange={(e) => setParams({ ...params, name: e.target.value })}
                                    value={params.name} />
                            </Col>
                            <Col>
                                <FormControl
                                    onChange={(e) => setParams({ ...params, url: e.target.value })}
                                    value={params.url ?? ''} />
                            </Col>
                        </Row>
                    </td>
                    :
                    <td>
                        {
                            title.url === null || title.url === ''
                                ? <p>{title.name}</p>
                                : <a href={`//${title.url}`}>{title.name}</a>
                        }
                    </td>
            }

            <td>{title.proposer.name}</td>
            {controls}
        </tr>
    );


}