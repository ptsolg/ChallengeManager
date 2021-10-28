import React from 'react';
import { Nav, Navbar, Dropdown, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { User } from '../../../../common/api/models';

interface HeaderProps {
    user: User | undefined,
    logout(): void
}

export default function Header({ user, logout }: HeaderProps): JSX.Element {
    return (
        <Navbar expand="lg" variant="dark" bg="dark" className="justify-content-end">
            <Navbar.Collapse className="ms-5 me-5">
                <Nav>
                    <LinkContainer to="/" exact={true}>
                        <Nav.Link active={false}>Challenges</Nav.Link>
                    </LinkContainer>
                </Nav>
                {
                    user === undefined
                        ?
                        <Button
                            variant="outline-info"
                            className="my-2 my-sm-0 ms-auto me-0"
                            href="https://discord.com/api/oauth2/authorize?client_id=892509954957791282&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code&scope=identify">
                            Login
                        </Button>
                        :
                        <Dropdown className="ms-auto me-0 my-2 my-sm-0">
                            <Dropdown.Toggle as="a" bsPrefix="p-0">
                                <img className="rounded-circle"
                                    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatarHash}?size=48`}></img>
                            </Dropdown.Toggle>
                            <Dropdown.Menu variant="dark" align="end">
                                <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                }
            </Navbar.Collapse>
        </Navbar>
    );
}