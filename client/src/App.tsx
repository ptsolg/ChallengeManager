import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import EditChallengePage from './pages/EditChallengePage';
import IndexPage from './pages/IndexPage';
import NewChallengePage from './pages/NewChallengePage';
import OverviewPage from './pages/OverviewPage';
import ParticipantsPage from './pages/ParticipantsPage';
import PoolsPage from './pages/PoolsPage';
import RoundsPage from './pages/RoundsPage';
import { fetchCurrentUser, login } from './stateSlice';
import { useDispatch } from './hooks';
import ProfilePage from './pages/ProfilePage';

export default function App(): JSX.Element {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchCurrentUser()).then(action => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            if (action.payload === undefined && code !== null)
                dispatch(login(code));
        });
    }, []);

    return (
        <Router>
            <Header />
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
                <Route path="/edit-challenge/:challengeId(\d+)">
                    <EditChallengePage />
                </Route>
                <Route path="/profile/:profileId(\d+)">
                    <ProfilePage />
                </Route>
                <Route path="/">
                    <IndexPage />
                </Route>
            </Switch>
        </Router >
    );
}