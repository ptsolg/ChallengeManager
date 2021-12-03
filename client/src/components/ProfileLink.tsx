import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../../common/api/models';
import Avatar from './Avatar';

interface ProfileLinkProps {
    user: User;
}

export default function ProfileLink({ user }: ProfileLinkProps): JSX.Element {
    return (
        <div>
            <Avatar user={user} size={32} className="me-2" />
            <Link to={`/profile/${user.id}`}>
                {user.name}
            </Link>
        </div>
    );
}