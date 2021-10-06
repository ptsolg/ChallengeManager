import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../../../common/api/models';

interface HeaderProps {
    user: User | undefined,
    logout(): void
}

export default function Header({ user, logout }: HeaderProps): JSX.Element {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark justify-content-end">
            <div className="collapse navbar-collapse ms-5 me-5">
                <ul className="navbar-nav">
                    <li className="nav-item active">
                        <Link className="nav-link" to="/">Challenges</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/">Ladder</Link>
                    </li>
                </ul>
                {
                    user === undefined
                        ? <a
                            className="btn btn-outline-info my-2 my-sm-0 ms-auto me-0"
                            href="https://discord.com/api/oauth2/authorize?client_id=892509954957791282&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code&scope=identify">
                            Login
                        </a>
                        :
                        <div className="dropdown ms-auto me-0 my-2 my-sm-0">
                            <a className="" role="button" id="dropdownMenu" data-bs-toggle="dropdown" aria-expanded="false">
                                <img className="rounded-circle"
                                    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatarHash}?size=48`}></img>
                            </a>
                            <div className="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="dropdownMenu">
                                <button onClick={logout} className="dropdown-item" type="button">Log out</button>
                            </div>
                        </div>
                }
            </div>
        </nav >
    );
}