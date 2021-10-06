import React from 'react';
import { Link } from 'react-router-dom';

interface ChallengeNavbarProps {
    challengeId: number
}

export default function ChallengeNavbar({ challengeId }: ChallengeNavbarProps): JSX.Element {
    const url = `/challenge/${challengeId}`;
    return (
        <nav className="navbar navbar-expand-sm navbar-dark bg-black py-0">
            <div className="collapse navbar-collapse">
                <ul className="navbar-nav mx-auto">
                    <li className="nav-item me-5">
                        <Link className="nav-link py-1" to={`${url}/`}>Overview</Link>
                    </li>
                    <li className="nav-item me-5">
                        <Link className="nav-link py-1" to={`${url}/rounds`}>Rounds</Link>
                    </li>
                    <li className="nav-item me-5">
                        <Link className="nav-link py-1" to={`${url}/pools`}>Pools</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link py-1" to={`${url}/participants`}>Participants</Link>
                    </li>
                </ul>
            </div>
        </nav >
    );
}