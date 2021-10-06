import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { User } from '../../common/api/models';
import { login, logout } from './api/auth';
import { fetchCurrentUser } from './api/user';
import Header from './components/layout/Header';
import IndexPage from './pages/IndexPage';
import NewChallengePage from './pages/NewChallengePage';
import OverviewPage from './pages/OverviewPage';
import ParticipantsPage from './pages/ParticipantsPage';
import PoolsPage from './pages/PoolsPage';
import RoundsPage from './pages/RoundsPage';

export default function App(): JSX.Element {
    const [user, setUser] = useState<User | undefined>(undefined);

    useEffect(() => {
        fetchCurrentUser().then(u => {
            if (u !== undefined) {
                setUser(u);
                return;
            }
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            if (code !== null) {
                login(code).then(fetchCurrentUser).then(setUser);
            }
        });
    }, []);

    return (
        <Router>
            <Header user={user} logout={() => { logout().then(_ => setUser(undefined)); }} />
            <Switch>
                <Route path="/challenge/:challengeId(\d+)/rounds">
                    <RoundsPage />
                </Route>
                <Route path="/challenge/:challengeId(\d+)/participants">
                    <ParticipantsPage />
                </Route>
                <Route path="/challenge/:challengeId(\d+)/pools">
                    <PoolsPage />
                </Route>
                <Route path="/challenge/:challengeId(\d+)">
                    <OverviewPage />
                </Route>
                <Route path="/new-challenge">
                    <NewChallengePage />
                </Route>
                <Route path="/">
                    <IndexPage />
                </Route>
            </Switch>
        </Router>
    );
}