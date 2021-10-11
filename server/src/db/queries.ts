import { QueryResultRowType, sql, ValueExpressionType } from 'slonik';
import { Challenge, Participant, User, Pool, Title, Round, Roll } from '../../../common/api/models';
import { db } from '../db/db';
import { DiscordUser } from '../utils/discord';

function challengeFromRow(x: QueryResultRowType): Challenge {
    return {
        id: x['id'] as number,
        name: x['name'] as string,
        creatorId: x['creator_id'] as number,
        startTime: new Date(x['start_time'] as string),
        finishTime: x['finish_time'] ? new Date(x['finish_time'] as string) : null,
        awardUrl: x['award_url'] as string,
        allowHidden: x['allow_hidden'] as boolean,
        description: x['description'] as string,
    };
}

export async function fetchChallenges(): Promise<Challenge[]> {
    return db.query(sql`
        SELECT id, name, creator_id, start_time, finish_time, award_url, allow_hidden, description FROM challenge
        ORDER BY start_time DESC`)
        .then(result => result.rows.map(challengeFromRow));
}

export async function fetchChallenge(id: number): Promise<Challenge> {
    return db.one(sql`
        SELECT id, name, creator_id, start_time, finish_time, award_url, allow_hidden, description FROM challenge
        WHERE id = ${id}`)
        .then(challengeFromRow);
}

export async function createChallenge(c: Challenge): Promise<Challenge> {
    return db.oneFirst(sql`
        INSERT INTO challenge (name, start_time, award_url, allow_hidden, description)
        VALUES (${c.name}, ${c.startTime.toISOString()}, ${c.awardUrl}, ${c.allowHidden}, ${c.description})
        RETURNING id`)
        .then(id => {
            c.id = id as number;
            return c;
        });
}

export async function fetchParticipants(challengeId: number): Promise<Participant[]> {
    return db.query(sql`
        SELECT P.id, P.failed_round_id,
            U.id u_id, U.discord_id u_discord_id, U.name u_name, U.avatar_hash u_avatar_hash,
            (
                SELECT KH.karma FROM karma_history KH
                WHERE KH.user_id = U.id
                ORDER BY KH.time DESC
                LIMIT 1
            ) as u_karma
        FROM participant P
        INNER JOIN "user" U ON U.id = P.user_id
        WHERE challenge_id = ${challengeId}
        ORDER BY u_karma DESC`)
        .then(result => result.rows.map(p => {
            return {
                id: p['id'] as number,
                failedRoundId: p['failed_round_id'] as number,
                user: {
                    id: p['u_id'] as number,
                    discordId: p['u_discord_id'] as string,
                    name: p['u_name'] as string,
                    avatarHash: p['u_avatar_hash'] as string,
                    karma: p['u_karma'] as number,
                }
            };
        }));
}

export async function fetchPools(challengeId: number): Promise<Pool[]> {
    return db.query(sql`SELECT id, name FROM pool WHERE challenge_id = ${challengeId}`)
        .then(result => result.rows.map(p => {
            return {
                id: p['id'] as number,
                name: p['name'] as string
            };
        }));
}

export async function fetchPoolTitles(poolId: number): Promise<Title[]> {
    return db.query(sql`
        SELECT T.id, T.name, U.name u_name, T.url, T.score, T.duration, T.difficulty, T.num_of_episodes
        FROM title T
        INNER JOIN pool P ON P.id = T.pool_id
        INNER JOIN participant PT ON PT.id = T.participant_id
        INNER JOIN "user" U ON U.id = PT.user_id
        WHERE P.id = ${poolId}
        ORDER BY u_name`)
        .then(result => result.rows.map(t => {
            return {
                id: t['id'] as number,
                name: t['name'] as string,
                userName: t['u_name'] as string,
                url: t['url'] as string,
                score: t['score'] as number,
                duration: t['duration'] as number,
                difficulty: t['difficulty'] as number,
                numEpisodes: t['num_of_episodes'] as number,
            };
        }));
}

async function fetchUser(col: string, val: ValueExpressionType): Promise<User | null> {
    return db.maybeOne(sql`
        SELECT U.id, U.discord_id, U.name, U.avatar_hash,
            (
                SELECT KH.karma FROM karma_history KH
                WHERE KH.user_id = U.id
                ORDER BY KH.time DESC
                LIMIT 1
            ) as karma
        FROM "user" U
        WHERE U.${sql.identifier([col])} = ${val}`)
        .then(x => {
            return x === null ? null : {
                id: x['id'] as number,
                discordId: x['discord_id'] as string,
                name: x['name'] as string,
                avatarHash: x['avatar_hash'] as string,
                karma: x['karma'] as number
            };
        });
}

export async function fetchUserById(userId: number): Promise<User | null> {
    return fetchUser("id", userId);
}

export async function fetchUserByDiscordId(discordId: string): Promise<User | null> {
    return fetchUser("discord_id", discordId);
}

async function updateUser(user: DiscordUser): Promise<void> {
    return db.query(sql`
        UPDATE "user" SET
            name = ${`${user.username}#${user.discriminator}`},
            avatar_hash = ${user.avatar}
        WHERE discord_id = ${user.id}`).then(_ => { return; });
}

export async function fetchOrCreateUser(user: DiscordUser): Promise<User> {
    const name = `${user.username}#${user.discriminator}`;
    return updateUser(user)
        .then(_ => fetchUserByDiscordId(user.id))
        .then(u => {
            if (u !== null) {
                return u;
            }
            return db.oneFirst(sql`
            INSERT INTO "user" (discord_id, color, name, avatar_hash)
            VALUES (${user.id}, '#FFFFFF', ${name}, ${user.avatar})
            RETURNING id`).then(id => {
                return {
                    id: id as number,
                    discordId: user.id,
                    name: name,
                    avatarHash: user.avatar,
                    karma: null,
                };
            });
        });
}

export async function fetchRounds(challengeId: number): Promise<Round[]> {
    return db.query(sql`
        SELECT id, num, start_time, finish_time, is_finished FROM round
        WHERE challenge_id = ${challengeId}
        ORDER BY num DESC`)
        .then(result => result.rows.map(r => {
            return {
                id: r['id'] as number,
                num: r['num'] as number,
                startTime: new Date(r['start_time'] as string),
                finishTime: new Date(r['finish_time'] as string),
                isFinished: r['is_finished'] as boolean,
            };
        }));
}

export async function fetchRolls(roundId: number): Promise<Roll[]> {
    return db.query(sql`
        SELECT U.name u_name, T.name t_name, R.score FROM roll R
        INNER JOIN participant P ON P.id = R.participant_id
        INNER JOIN "user" U ON U.id = P.user_id
        INNER JOIN title T ON T.id = R.title_id
        WHERE R.round_id = ${roundId}
        ORDER BY u_name`)
        .then(result => result.rows.map(r => {
            return {
                userName: r['u_name'] as string,
                titleName: r['t_name'] as string,
                score: r['score'] as number
            };
        }));
}