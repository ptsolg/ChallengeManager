import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useChallengeId } from '../../hooks';

export default function ChallengeNavbar(): JSX.Element {
    const cid = useChallengeId();
    const url = `/challenge/${cid}`;
    return (
        <Navbar variant="dark" bg="black" className="py-0">
            <Navbar.Collapse>
                <Nav className="mx-auto">
                    <LinkContainer to={`${url}/`} exact={true}>
                        <Nav.Link className="me-2">Overview</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to={`${url}/rounds`}>
                        <Nav.Link className="me-2">Rounds</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to={`${url}/pools`}>
                        <Nav.Link className="me-2">Pools</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to={`${url}/participants`}>
                        <Nav.Link>Participants</Nav.Link>
                    </LinkContainer>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}