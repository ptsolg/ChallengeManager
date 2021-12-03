import './ProfilePage.css';
import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWheelchair, faTrophy, faHeart, faList } from '@fortawesome/free-solid-svg-icons';
import { UserStats } from '../../../common/api/models';
import { fetchUserStats } from '../api';
import DefaultLayout from '../components/layout/DefaultLayout';
import { useProfileId } from '../hooks';
import { Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export default function ProfilePage(): JSX.Element {
    const profileId = useProfileId();
    const [stats, setStats] = useState<UserStats>();

    useEffect(() => {
        fetchUserStats(profileId).then(setStats);
    }, []);

    if (stats === undefined)
        return (<></>);

    return (
        <DefaultLayout>
            <Row>
                <Col lg="3"></Col>
                <Col lg="7">
                    <Card>
                        <Card.Body>
                            <Row>
                                <Col lg="4" className="border-end">
                                    <h5 className="mb-3 text-center">{stats.user.name}</h5>
                                    <img className="rounded-circle mx-auto d-block mb-3"
                                        src={`https://cdn.discordapp.com/avatars/${stats.user.discordId}/${stats.user.avatarHash}?size=128`} />
                                    <div className="awards">
                                        {stats.awards.map(x => <img className="award" src={x} />)}
                                    </div>
                                </Col>
                                <Col lg="8">
                                    <table className="stats-table">
                                        <tr>
                                            <td>
                                                <strong className="title">AVG. SCORE</strong><br />
                                                <FontAwesomeIcon icon={faWheelchair} size="2x" /><br />
                                                <strong className="value">{stats.avgRate ?? '-'}</strong>
                                            </td>
                                            <td>
                                                <strong className="title">COMPLETED</strong><br />
                                                <FontAwesomeIcon icon={faTrophy} size="2x" /><br />
                                                <strong className="value">{stats.numCompleted}</strong>
                                            </td>
                                            <td>
                                                <strong className="title">KARMA</strong><br />
                                                <FontAwesomeIcon icon={faHeart} size="2x" /><br />
                                                <strong className="value">{stats.karma ?? '-'}</strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong className="title">TITLE SCORE</strong><br />
                                                <FontAwesomeIcon icon={faList} size="2x" /><br />
                                                <strong className="value">{stats.avgTitleScore?.toFixed(2) ?? '-'}</strong>
                                            </td>
                                            <td>
                                                <strong className="title">WATCHED</strong>
                                                <table className="users-scores-table">
                                                    {stats.mostWatched.map(x => (
                                                        <tr>
                                                            <td>{x.userName}</td>
                                                            <td>{x.count}</td>
                                                        </tr>
                                                    ))}
                                                </table>
                                            </td>
                                            <td>
                                                <strong className="title">SNIPED</strong>
                                                <table className="users-scores-table">
                                                    {stats.mostSniped.map(x => (
                                                        <tr>
                                                            <td>{x.userName}</td>
                                                            <td>{x.count}</td>
                                                        </tr>
                                                    ))}
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className="mt-2">
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.karmaHistory}>
                                    <XAxis dataKey="time" tickFormatter={(x: string) => x.slice(0, 7)} angle={-45} dy={15} height={60} />
                                    <YAxis />
                                    <Line dataKey="karma" />
                                    <Legend verticalAlign="top" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg="3"></Col>
            </Row>
        </DefaultLayout>
    );
}