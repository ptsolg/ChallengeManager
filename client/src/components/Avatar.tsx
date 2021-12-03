import React from 'react';
import { User } from '../../../common/api/models';

interface AvatarProps {
    user: User;
    className?: string;
    size?: number;
}

export default function Avatar({ user, className, size }: AvatarProps): JSX.Element {
    return (
        <img className={`rounded-circle ${className}`} width={size} height={size}
            src={user.avatarUrl ?? 'https://discord.com/assets/c09a43a372ba81e3018c3151d4ed4773.png'} />
    );
}