import { QueryResultRowType, sql } from 'slonik';
import { DiscordUser } from '../utils/discord';
import { db } from './db';
import * as api from '../../../common/api/models';

function nonNull<T>(x: QueryResultRowType, key: string): T {
    if (!(key in x))
        throw `Key "${key}" does not exist`;
    if (x[key] === null)
        throw `Key "${key}" is null`;
    return x[key] as unknown as T;
}

function maybeNull<T>(x: QueryResultRowType, key: string): T {
    if (!(key in x))
        throw `Key "${key}" does not exist`;
    return x[key] as unknown as T;
}

class Columns {
    cols: string[];

    constructor(cols: string[]) {
        this.cols = cols;
    }

    join(tablePrefix = '', renamePrefix = '') {
        const ids = [];
        for (const col of this.cols) {
            const colName = tablePrefix === ''
                ? sql.identifier([col])
                : sql.identifier([tablePrefix, col]);
            if (renamePrefix === '')
                ids.push(sql`${colName}`);
            else
                ids.push(sql`${colName} as ${sql.identifier([`${renamePrefix}${col}`])}`);
        }
        return sql.join(ids, sql`, `);
    }
}

export class User implements api.User {
    static COLS = new Columns(['id', 'discord_id', 'color', 'name', 'avatar_hash']);
    id: number;
    discordId: string;
    color: string;
    name: string;
    avatarHash: string | null;

    constructor(id: number, discordId: string, color: string, name: string, avatarHash: string | null) {
        this.id = id;
        this.discordId = discordId;
        this.color = color;
        this.name = name;
        this.avatarHash = avatarHash;
    }

    static fromRow(row: QueryResultRowType, p = ''): User {
        return new User(
            nonNull(row, p + 'id'),
            nonNull(row, p + 'discord_id'),
            nonNull(row, p + 'color'),
            nonNull(row, p + 'name'),
            maybeNull(row, p + 'avatar_hash'));
    }

    static fetch(id: number): Promise<User> {
        return db.one(sql`SELECT ${this.COLS.join()} FROM "user" WHERE id = ${id}`)
            .then(User.fromRow);
    }

    static fetchByDiscordId(discordId: string): Promise<User> {
        return db.one(sql`SELECT ${this.COLS.join()} FROM "user" WHERE discord_id = ${discordId}`)
            .then(User.fromRow);
    }

    private static create(u: DiscordUser): Promise<User> {
        const color = '#FFFFFF';
        const name = `${u.username}#${u.discriminator}`;
        return db.oneFirst<number>(sql`
            INSERT INTO "user" (discord_id, color, name, avatar_hash)
            VALUES (${u.id}, ${color}, ${name}, ${u.avatar})
            RETURNING id`)
            .then(id => new User(id, u.id, color, name, u.avatar));
    }

    private update(u: DiscordUser): Promise<void> {
        return db.query(sql`
            UPDATE "user" SET
                name = ${`${u.username}#${u.discriminator}`},
                avatar_hash = ${u.avatar}
            WHERE id = ${this.id}`).then(_ => { return; });
    }

    static fetchOrCreate(user: DiscordUser): Promise<User> {
        return this.fetchByDiscordId(user.id)
            .catch(_ => User.create(user))
            .then(u => u.update(user).then(_ => u));
    }
}

export class Challenge implements api.Challenge {
    static COLS = new Columns(['id', 'name', 'start_time', 'finish_time',
        'award_url', 'creator_id', 'allow_hidden', 'description']);
    id: number;
    name: string;
    startTime: Date;
    finishTime: Date | null;
    awardUrl: string | null;
    creatorId: number;
    allowHidden: boolean;
    description: string;

    constructor(
        id: number,
        name: string,
        startTime: Date,
        finishTime: Date | null,
        awardUrl: string | null,
        creatorId: number,
        allowHidden: boolean,
        description: string,
    ) {
        this.id = id;
        this.name = name;
        this.startTime = startTime;
        this.finishTime = finishTime;
        this.awardUrl = awardUrl;
        this.creatorId = creatorId;
        this.allowHidden = allowHidden;
        this.description = description;
    }

    static fromRow(row: QueryResultRowType): Challenge {
        return new Challenge(
            nonNull(row, 'id'),
            nonNull(row, 'name'),
            new Date(nonNull(row, 'start_time')),
            row['finish_time']
                ? new Date(row['finish_time'] as string)
                : null,
            maybeNull(row, 'award_url'),
            nonNull(row, 'creator_id'),
            nonNull(row, 'allow_hidden'),
            nonNull(row, 'description'));
    }

    static fetch(id: number): Promise<Challenge> {
        return db.one(sql`SELECT ${this.COLS.join()} FROM challenge WHERE id = ${id}`)
            .then(Challenge.fromRow);
    }

    static fetchAll(): Promise<Challenge[]> {
        return db.query(sql`
            SELECT ${this.COLS.join()} FROM challenge
            ORDER BY start_time DESC`).then(result => result.rows.map(Challenge.fromRow));
    }

    static create(
        name: string,
        awardUrl: string | null,
        creatorId: number,
        allowHidden: boolean,
        description: string
    ): Promise<Challenge> {
        const startTime = new Date(Date.now());
        return db.oneFirst<number>(sql`
            INSERT INTO challenge (name, start_time, award_url, creator_id, allow_hidden, description)
            VALUES (${name}, ${startTime.toISOString()}, ${awardUrl},
                ${creatorId}, ${allowHidden}, ${description})
            RETURNING id`)
            .then(id => new Challenge(id, name, startTime, null, awardUrl,
                creatorId, allowHidden, description));
    }

    hasStarted(): Promise<boolean> {
        return db.oneFirst<number>(sql`
            SELECT COUNT(1) FROM challenge C
            INNER JOIN round R ON R.challenge_id = C.id
            WHERE C.id = ${this.id}`)
            .then(num_rounds => num_rounds === 0);
    }

    hasTitle(name: string): Promise<boolean> {
        return db.oneFirst<boolean>(sql`SELECT EXISTS(
            SELECT 1 FROM title T
            JOIN pool P ON P.id = T.pool_id
            WHERE P.challenge_id = ${this.id} AND T.name = ${name})`);
    }

    hasParticipant(userId: number): Promise<boolean> {
        return db.oneFirst<boolean>(sql`SELECT EXISTS(
            SELECT 1 FROM participant WHERE user_id = ${userId} AND challenge_id = ${this.id})`);
    }

    update(): Promise<void> {
        return db.query(sql`
            UPDATE challenge SET name = ${this.name}, award_url = ${this.awardUrl},
                allow_hidden = ${this.allowHidden}, description = ${this.description}
            WHERE id = ${this.id}`).then(_ => { return; });
    }

    fetchParticipantsExt(): Promise<api.ParticipantExt[]> {
        return db.query(sql`
            SELECT
                ${Participant.COLS.join('P', 'p_')},
                ${User.COLS.join('U', 'u_')},
                (
                    SELECT KH.karma FROM karma_history KH
                    WHERE KH.user_id = "U".id
                    ORDER BY KH.time DESC
                    LIMIT 1
                ) as karma
            FROM participant "P"
            INNER JOIN "user" "U" ON "U".id = "P".user_id
            WHERE "P".challenge_id = ${this.id}`)
            .then(result => result.rows.map(row => {
                return {
                    ...Participant.fromRow(row, 'p_'),
                    user: User.fromRow(row, 'u_'),
                    karma: maybeNull(row, 'karma'),
                };
            }));
    }

    createParticipant(userId: number): Promise<Participant> {
        return db.oneFirst<number>(sql`
            INSERT INTO participant (challenge_id, user_id)
            VALUES (${this.id}, ${userId})
            RETURNING id`)
            .then(id => new Participant(id, this.id, userId, null));
    }

    deleteParticipant(userId: number): Promise<void> {
        return db.query(sql`DELETE FROM participant WHERE challenge_id = ${this.id} AND user_id = ${userId}`)
            .then(_ => { return; });
    }

    addPool(name: string): Promise<Pool> {
        return db.oneFirst<number>(sql`
            INSERT INTO pool (challenge_id, name)
            VALUES (${this.id}, ${name})
            RETURNING id`).then(id => new Pool(id, this.id, name));
    }

    hasPool(name: string): Promise<boolean> {
        return db.oneFirst<boolean>(sql`SELECT EXISTS(
            SELECT 1 FROM pool WHERE challenge_id = ${this.id} AND name = ${name})`);
    }

    fetchPool(name: string): Promise<Pool> {
        return db.one(sql`
            SELECT ${Pool.COLS.join()} FROM pool
            WHERE challenge_id = ${this.id} AND name = ${name}`).then(Pool.fromRow);
    }

    fetchPools(): Promise<Pool[]> {
        return db.query(sql`
            SELECT ${Pool.COLS.join('P')} FROM pool "P"
            INNER JOIN challenge C ON C.id = "P".challenge_id
            WHERE C.id = ${this.id}`)
            .then(result => result.rows.map(Pool.fromRow));
    }

    fetchRounds(): Promise<Round[]> {
        return db.query(sql`
            SELECT ${Round.COLS.join()} FROM round
            WHERE challenge_id = ${this.id}`)
            .then(result => result.rows.map(Round.fromRow));
    }

    fetchRolls(roundNum: number): Promise<api.RollExt[]> {
        return db.query(sql`
            SELECT
                ${Roll.COLS.join('R', 'r_')},
                ${User.COLS.join('U', 'u_')},
                ${Title.COLS.join('T', 't_')}
            FROM roll "R"
            INNER JOIN participant P ON P.id = "R".participant_id
            INNER JOIN "user" "U" ON "U".id = P.user_id
            INNER JOIN title "T" ON "T".id = "R".title_id
            INNER JOIN round RND ON RND.id = "R".round_id
            WHERE RND.challenge_id = ${this.id} AND RND.num = ${roundNum}`)
            .then(result => result.rows.map(row => {
                return {
                    ...Roll.fromRow(row, 'r_'),
                    watcher: User.fromRow(row, 'u_'),
                    title: Title.fromRow(row, 't_'),
                };
            }));
    }
}

export class Pool implements api.Pool {
    static COLS = new Columns(['id', 'challenge_id', 'name']);
    id: number;
    challengeId: number;
    name: string;

    constructor(
        id: number,
        challengeId: number,
        name: string,
    ) {
        this.id = id;
        this.challengeId = challengeId;
        this.name = name;
    }

    static fromRow(row: QueryResultRowType): Pool {
        return new Pool(
            nonNull(row, 'id'),
            nonNull(row, 'challenge_id'),
            nonNull(row, 'name'));
    }

    update(): Promise<void> {
        return db.query(sql`UPDATE pool SET name = ${this.name} WHERE id= ${this.id}`)
            .then(_ => { return; });
    }

    addTitle(
        participantId: number,
        name: string,
        url: string | null,
        isHidden: boolean,
        score: number | null,
        duration: number | null,
        difficulty: number | null,
        numEpisodes: number | null
    ): Promise<Title> {
        return db.oneFirst<number>(sql`
            INSERT INTO title (pool_id, participant_id, name, url, is_hidden, score,
                duration, difficulty, num_of_episodes)
            VALUES (${this.id}, ${participantId}, ${name}, ${url}, ${isHidden},
                ${score}, ${duration}, ${difficulty}, ${numEpisodes})
            RETURNING id`)
            .then(id => {
                return new Title(id, this.id, participantId, name, url, false, isHidden,
                    score, duration, difficulty, numEpisodes);
            });
    }

    fetchTitles(): Promise<api.TitleExt[]> {
        return db.query(sql`
            SELECT 
                ${Title.COLS.join('T', 't_')},
                ${User.COLS.join('U', 'u_')}
            FROM title "T"
            INNER JOIN participant P ON P.id = "T".participant_id
            INNER JOIN "user" "U" ON "U".id = P.user_id
            WHERE "T".pool_id = ${this.id}
        `).then(result => result.rows.map(row => {
            return {
                ...Title.fromRow(row, 't_'),
                proposer: User.fromRow(row, 'u_'),
            };
        }));
    }
}

export class Participant implements api.Participant {
    static COLS = new Columns(['id', 'challenge_id', 'user_id', 'failed_round_id']);
    id: number;
    challengeId: number;
    userId: number;
    failedRoundId: number | null;

    constructor(
        id: number,
        challengeId: number,
        userId: number,
        failedRoundId: number | null,
    ) {
        this.id = id;
        this.challengeId = challengeId;
        this.userId = userId;
        this.failedRoundId = failedRoundId;
    }

    static fromRow(row: QueryResultRowType, p = ''): Participant {
        return new Participant(
            nonNull(row, p + 'id'),
            nonNull(row, p + 'challenge_id'),
            nonNull(row, p + 'user_id'),
            maybeNull(row, p + 'failed_round_id'));
    }
}


export class Title implements api.Title {
    static COLS = new Columns(['id', 'pool_id', 'participant_id', 'name',
        'url', 'is_used', 'is_hidden', 'score', 'duration', 'difficulty', 'num_of_episodes']);
    id: number;
    poolId: number;
    participantId: number;
    name: string;
    url: string | null;
    isUsed: boolean;
    isHidden: boolean;
    score: number | null;
    duration: number | null;
    difficulty: number | null;
    numEpisodes: number | null;

    constructor(
        id: number,
        poolId: number,
        participantId: number,
        name: string,
        url: string | null,
        isUsed: boolean,
        isHidden: boolean,
        score: number | null,
        duration: number | null,
        difficulty: number | null,
        numEpisodes: number | null,
    ) {
        this.id = id;
        this.poolId = poolId;
        this.participantId = participantId;
        this.name = name;
        this.url = url;
        this.isUsed = isUsed;
        this.isHidden = isHidden;
        this.score = score;
        this.duration = duration;
        this.difficulty = difficulty;
        this.numEpisodes = numEpisodes;
    }

    static fromRow(row: QueryResultRowType, p = ''): Title {
        return new Title(
            nonNull(row, p + 'id'),
            nonNull(row, p + 'pool_id'),
            nonNull(row, p + 'participant_id'),
            nonNull(row, p + 'name'),
            maybeNull(row, p + 'url'),
            nonNull(row, p + 'is_used'),
            nonNull(row, p + 'is_hidden'),
            maybeNull(row, p + 'score'),
            maybeNull(row, p + 'duration'),
            maybeNull(row, p + 'difficulty'),
            maybeNull(row, p + 'num_of_episodes'));
    }

    update(): Promise<void> {
        return db.query(sql`
            UPDATE title SET pool_id = ${this.poolId}, participant_id = ${this.participantId},
                name = ${this.name}, url = ${this.url}, is_used = ${this.isUsed}, 
                is_hidden = ${this.isHidden}, score = ${this.score}, duration = ${this.duration},
                difficulty = ${this.difficulty}, num_of_episodes = ${this.numEpisodes}
            WHERE id = ${this.id}`).then(_ => { return; });
    }

    delete(): Promise<void> {
        return db.query(sql`DELETE FROM title WHERE id = ${this.id}`).then(_ => { return; });
    }
}

export class Round implements api.Round {
    static COLS = new Columns(['id', 'num', 'challenge_id', 'start_time',
        'finish_time', 'is_finished']);
    id: number;
    num: number;
    challengeId: number;
    startTime: Date;
    finishTime: Date;
    isFinished: boolean;

    constructor(
        id: number,
        num: number,
        challengeId: number,
        startTime: Date,
        finishTime: Date,
        isFinished: boolean,
    ) {
        this.id = id;
        this.num = num;
        this.challengeId = challengeId;
        this.startTime = startTime;
        this.finishTime = finishTime;
        this.isFinished = isFinished;
    }

    static fromRow(row: QueryResultRowType): Round {
        return new Round(
            nonNull(row, 'id'),
            nonNull(row, 'num'),
            nonNull(row, 'challenge_id'),
            nonNull(row, 'start_time'),
            nonNull(row, 'finish_time'),
            nonNull(row, 'is_finished'));
    }

    update(): Promise<void> {
        return db.query(sql`
            UPDATE round SET num = ${this.num}, start_time = ${this.startTime.toISOString()},
                finish_time = ${this.finishTime.toISOString()}, is_finished = ${this.isFinished}
            WHERE id = ${this.id}`).then(_ => { return; });
    }
}

export class Roll implements api.Roll {
    static COLS = new Columns(['round_id', 'participant_id', 'title_id', 'score']);
    roundId: number;
    participantId: number;
    titleId: number;
    score: number;

    constructor(
        roundId: number,
        participantId: number,
        titleId: number,
        score: number,
    ) {
        this.roundId = roundId;
        this.participantId = participantId;
        this.titleId = titleId;
        this.score = score;
    }

    static fromRow(row: QueryResultRowType, p = ''): Roll {
        return new Roll(
            nonNull(row, p + 'round_id'),
            nonNull(row, p + 'participant_id'),
            nonNull(row, p + 'title_id'),
            nonNull(row, p + 'score'));
    }

    update(): Promise<void> {
        return db.query(sql`
            UPDATE roll SET score = ${this.score}, title_id = ${this.titleId}
            WHERE round_id = ${this.roundId} AND participant_id = ${this.participantId}`)
            .then(_ => { return; });
    }
}

export class Award implements api.Award {
    static COLS = new Columns(['participant_id', 'url', 'time']);
    participantId: number;
    url: string | null;
    time: Date;

    constructor(
        participantId: number,
        url: string | null,
        time: Date,
    ) {
        this.participantId = participantId;
        this.url = url;
        this.time = time;
    }

    static fromRow(row: QueryResultRowType): Award {
        return new Award(
            nonNull(row, 'participant_id'),
            maybeNull(row, 'url'),
            new Date(nonNull<string>(row, 'time')));
    }
}

export class KarmaHistory implements api.KarmaHistory {
    static COLS = new Columns(['user_id', 'karma', 'time']);
    userId: number;
    karma: number;
    time: Date;

    constructor(
        userId: number,
        karma: number,
        time: Date,
    ) {
        this.userId = userId;
        this.karma = karma;
        this.time = time;
    }

    static fromRow(row: QueryResultRowType): KarmaHistory {
        return new KarmaHistory(
            nonNull(row, 'user_id'),
            nonNull(row, 'karma'),
            new Date(nonNull(row, 'time')));
    }
}