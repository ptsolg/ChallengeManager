import './IconButton.css';
import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';

interface IconButtonProps {
    icon: IconDefinition;
    size?: SizeProp;
    className?: string;
    onClick?: () => void;
    color?: string;
}

export default function IconButton({ icon, size, className, onClick, color }: IconButtonProps): JSX.Element {
    return (
        <div className={`d-inline ${className}`}>
            <a type="button" className="icon-button" onClick={onClick}>
                <FontAwesomeIcon icon={icon} size={size} color={color} />
            </a>
        </div>
    );
}