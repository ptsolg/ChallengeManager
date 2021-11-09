import { CommonQueryMethodsType, QueryResultRowType, sql } from 'slonik';
import { DiscordUser } from '../utils/discord';
import * as api from '../../../common/api/models';
import { Error } from '../utils/error';

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

class Relation {
    // Make _db lambda to avoid exposing it to JSON
    private _db: () => CommonQueryMethodsType;
    constructor(db: CommonQueryMethodsType) {
        this._db = () => db;
    }

    protected get db() {
        return this._db();
    }
}

export class User extends Relation implements api.User {
    static COLS = new Columns(['id', 'discord_id', 'color', 'name', 'avatar_hash']);
    id: number;
    discordId: string;
    color: string;
    name: string;
    avatarHash: string | null;

    constructor(
        db: CommonQueryMethodsType,
        id: number,
        discordId: string,
        color: string,
        name: string,
        avatarHash: string | null
    ) {
        super(db);
        this.id = id;
        this.discordId = discordId;
        this.color = color;
        this.name = name;
        this.avatarHash = avatarHash;
    }

    static fromRow(db: CommonQueryMethodsType, row: QueryResultRowType, p = ''): User {
        return new User(db,
            nonNull(row, p + 'id'),
            nonNull(row, p + 'discord_id'),
            nonNull(row, p + 'color'),
            nonNull(row, p + 'name'),
            maybeNull(row, p + 'avatar_hash'));
    }

    static require(db: CommonQueryMethodsType, id: number): Promise<User> {
        return db.maybeOne(sql`SELECT ${this.COLS.join()} FROM "user" WHERE id = ${id}`)
            .then(x => {
                if (x === null)
                    throw new Error(400, `User with id ${id} does not exist`);
                return User.fromRow(db, x);
            });
    }

    private static create(db: CommonQueryMethodsType, u: DiscordUser): Promise<User> {
        const color = '#FFFFFF';
        const name = `${u.username}#${u.discriminator}`;
        return db.oneFirst<number>(sql`
            INSERT INTO "user" (discord_id, color, name, avatar_hash)
            VALUES (${u.id}, ${color}, ${name}, ${u.avatar})
            RETURNING id`)
            .then(id => new User(db, id, u.id, color, name, u.avatar));
    }

    private update(u: DiscordUser): Promise<void> {
        return this.db.query(sql`
            UPDATE "user" SET
                name = ${`${u.username}#${u.discriminator}`},
                avatar_hash = ${u.avatar}
            WHERE id = ${this.id}`).then(_ => { return; });
    }

    private static fetchByDiscordId(db: CommonQueryMethodsType, discordId: string): Promise<User> {
        return db.one(sql`SELECT ${this.COLS.join()} FROM "user" WHERE discord_id = ${discordId}`)
            .then(x => User.fromRow(db, x));
    }

    static fetchOrCreate(db: CommonQueryMethodsType, user: DiscordUser): Promise<User> {
        return User.fetchByDiscordId(db, user.id)
            .catch(_ => User.create(db, user))
            .then(u => u.update(user).then(_ => u));
    }
}

export class Challenge extends Relation implements api.Challenge {
    static COLS = new Columns(['id', 'name', 'start_time', 'finish_time',
        'award_url', 'creator_id', 'allow_hidden', 'description']);
    id: number;
    name: string;
    startTime: string;
    finishTime: string | null;
    awardUrl: string | null;
    creatorId: number;
    allowHidden: boolean;
    description: string;

    constructor(
        db: CommonQueryMethodsType,
        id: number,
        name: string,
        startTime: string,
        finishTime: string | null,
        awardUrl: string | null,
        creatorId: number,
        allowHidden: boolean,
        description: string,
    ) {
        super(db);
        this.id = id;
        this.name = name;
        this.startTime = startTime;
        this.finishTime = finishTime;
        this.awardUrl = awardUrl;
        this.creatorId = creatorId;
        this.allowHidden = allowHidden;
        this.description = description;
    }

    static fromRow(db: CommonQueryMethodsType, row: QueryResultRowType): Challenge {
        return new Challenge(db,
            nonNull(row, 'id'),
            nonNull(row, 'name'),
            nonNull(row, 'start_time'),
            maybeNull(row, 'finish_time'),
            maybeNull(row, 'award_url'),
            nonNull(row, 'creator_id'),
            nonNull(row, 'allow_hidden'),
            nonNull(row, 'description'));
    }

    static require(db: CommonQueryMethodsType, id: number): Promise<Challenge> {
        return db.maybeOne(sql`SELECT ${this.COLS.join()} FROM challenge WHERE id = ${id}`)
            .then(x => {
                if (x === null)
                    throw new Error(400, `Challenge with id ${id} does not exist`);
                return Challenge.fromRow(db, x);
            });
    }

    static fetchAll(db: CommonQueryMethodsType): Promise<Challenge[]> {
        return db.query(sql`
            SELECT ${this.COLS.join()} FROM challenge
            ORDER BY start_time DESC`)
            .then(result => result.rows.map(row => Challenge.fromRow(db, row)));
    }

    static create(
        db: CommonQueryMethodsType,
        name: string,
        awardUrl: string | null,
        creatorId: number,
        allowHidden: boolean,
        description: string
    ): Promise<Challenge> {
        const startTime = new Date(Date.now()).toISOString();
        return db.oneFirst<number>(sql`
            INSERT INTO challenge (name, start_time, award_url, creator_id, allow_hidden, description)
            VALUES (${name}, ${startTime}, ${awardUrl},
                ${creatorId}, ${allowHidden}, ${description})
            RETURNING id`)
            .then(id => new Challenge(db, id, name, startTime, null, awardUrl,
                creatorId, allowHidden, description));
    }

    hasStarted(): Promise<boolean> {
        return this.db.oneFirst<number>(sql`
            SELECT COUNT(1) FROM challenge C
            INNER JOIN round R ON R.challenge_id = C.id
            WHERE C.id = ${this.id}`)
            .then(num_rounds => num_rounds > 0);
    }

    hasTitle(name: string): Promise<boolean> {
        return this.db.oneFirst<boolean>(sql`SELECT EXISTS(
            SELECT 1 FROM title T
            JOIN pool P ON P.id = T.pool_id
            WHERE P.challenge_id = ${this.id} AND T.name = ${name})`);
    }

    hasParticipant(userId: number): Promise<boolean> {
        return this.db.oneFirst<boolean>(sql`SELECT EXISTS(
            SELECT 1 FROM participant WHERE user_id = ${userId} AND challenge_id = ${this.id})`);
    }

    update(): Promise<void> {
        return this.db.query(sql`
            UPDATE challenge SET name = ${this.name}, award_url = ${this.awardUrl},
                allow_hidden = ${this.allowHidden}, description = ${this.description}
            WHERE id = ${this.id}`).then(_ => { return; });
    }

    fetchParticipant(userId: number): Promise<Participant | undefined> {
        return this.db.maybeOne(sql`
            SELECT ${Participant.COLS.join()}
            FROM participant
            WHERE challenge_id = ${this.id} AND user_id = ${userId}`)
            .then(x => x === null ? undefined : Participant.fromRow(this.db, x));
    }

    requireParticipant(userId: number): Promise<Participant> {
        return this.fetchParticipant(userId)
            .then(p => {
                if (p === undefined)
                    throw new Error(400, 'User is not participant');
                if (p.failedRoundId !== null)
                    throw new Error(400, 'Participant has failed this challenge');
                return p;
            });
    }

    fetchParticipantsExt(): Promise<api.ParticipantExt[]> {
        return this.db.query(sql`
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
                    ...Participant.fromRow(this.db, row, 'p_'),
                    user: User.fromRow(this.db, row, 'u_'),
                    karma: maybeNull(row, 'karma'),
                };
            }));
    }

    addParticipant(userId: number): Promise<Participant> {
        return this.db.oneFirst<number>(sql`
            INSERT INTO participant (challenge_id, user_id)
            VALUES (${this.id}, ${userId})
            RETURNING id`)
            .then(id => new Participant(this.db, id, this.id, userId, null));
    }

    deleteParticipant(userId: number): Promise<void> {
        return this.db.query(sql`DELETE FROM participant WHERE challenge_id = ${this.id} AND user_id = ${userId}`)
            .then(_ => { return; });
    }

    addPool(name: string): Promise<Pool> {
        return this.db.oneFirst<number>(sql`
            INSERT INTO pool (challenge_id, name)
            VALUES (${this.id}, ${name})
            RETURNING id`).then(id => new Pool(this.db, id, this.id, name));
    }

    hasPool(name: string): Promise<boolean> {
        return this.db.oneFirst<boolean>(sql`SELECT EXISTS(
            SELECT 1 FROM pool WHERE challenge_id = ${this.id} AND name = ${name})`);
    }

    requirePool(name: string): Promise<Pool> {
        return this.db.maybeOne(sql`
            SELECT ${Pool.COLS.join()} FROM pool
            WHERE challenge_id = ${this.id} AND name = ${name}`)
            .then(x => {
                if (x === null)
                    throw new Error(400, `Pool "${name}" does not exist`);
                return Pool.fromRow(this.db, x);
            });
    }

    fetchPools(): Promise<Pool[]> {
        return this.db.query(sql`
            SELECT ${Pool.COLS.join('P')} FROM pool "P"
            INNER JOIN challenge C ON C.id = "P".challenge_id
            WHERE C.id = ${this.id}`)
            .then(result => result.rows.map(row => Pool.fromRow(this.db, row)));
    }

    addRound(finish: Date): Promise<Round> {
        const start = new Date(Date.now()).toISOString();
        return this.db.one<{ id: number, num: number }>(sql`
            INSERT INTO round (num, challenge_id, start_time, finish_time)
                SELECT COUNT(*), ${this.id}, ${start}, ${finish.toISOString()}
                FROM round
                WHERE challenge_id = ${this.id}
            RETURNING id, num`).then(x => new Round(this.db, x.id, x.num, this.id, start, finish.toISOString(), false));
    }

    fetchRounds(): Promise<Round[]> {
        return this.db.query(sql`
            SELECT ${Round.COLS.join()} FROM round
            WHERE challenge_id = ${this.id}`)
            .then(result => result.rows.map(row => Round.fromRow(this.db, row)));
    }

    fetchLastRound(): Promise<Round | undefined> {
        return this.db.maybeOne(sql`
            SELECT ${Round.COLS.join()}
            FROM round
            WHERE challenge_id = ${this.id}
            ORDER BY num DESC
            LIMIT 1`).then(row => row === null ? undefined : Round.fromRow(this.db, row));
    }

    requireLastRound(): Promise<Round> {
        return this.fetchLastRound().then(lr => {
            if (lr === undefined)
                throw new Error(400, 'Start a new round first');
            return lr;
        });
    }

    fetchRolls(roundNum: number): Promise<api.RollExt[]> {
        return this.db.query(sql`
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
                    ...Roll.fromRow(this.db, row, 'r_'),
                    watcher: User.fromRow(this.db, row, 'u_'),
                    title: Title.fromRow(this.db, row, 't_'),
                };
            }));
    }
}

export class Pool extends Relation implements api.Pool {
    static COLS = new Columns(['id', 'challenge_id', 'name']);
    id: number;
    challengeId: number;
    name: string;

    constructor(
        db: CommonQueryMethodsType,
        id: number,
        challengeId: number,
        name: string,
    ) {
        super(db);
        this.id = id;
        this.challengeId = challengeId;
        this.name = name;
    }

    static fromRow(db: CommonQueryMethodsType, row: QueryResultRowType): Pool {
        return new Pool(db,
            nonNull(row, 'id'),
            nonNull(row, 'challenge_id'),
            nonNull(row, 'name'));
    }

    update(): Promise<void> {
        return this.db.query(sql`UPDATE pool SET name = ${this.name} WHERE id = ${this.id}`)
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
        return this.db.oneFirst<number>(sql`
            INSERT INTO title (pool_id, participant_id, name, url, is_hidden, score,
                duration, difficulty, num_of_episodes)
            VALUES (${this.id}, ${participantId}, ${name}, ${url}, ${isHidden},
                ${score}, ${duration}, ${difficulty}, ${numEpisodes})
            RETURNING id`)
            .then(id => {
                return new Title(this.db, id, this.id, participantId, name, url, false, isHidden,
                    score, duration, difficulty, numEpisodes);
            });
    }

    fetchTitles(): Promise<api.TitleExt[]> {
        return this.db.query(sql`
            SELECT 
                ${Title.COLS.join('T', 't_')},
                ${User.COLS.join('U', 'u_')}
            FROM title "T"
            INNER JOIN participant P ON P.id = "T".participant_id
            INNER JOIN "user" "U" ON "U".id = P.user_id
            WHERE "T".pool_id = ${this.id}
        `).then(result => result.rows.map(row => {
            return {
                ...Title.fromRow(this.db, row, 't_'),
                proposer: User.fromRow(this.db, row, 'u_'),
            };
        }));
    }

    fetchUnusedTitles(): Promise<Title[]> {
        return this.db.query(sql`
            SELECT ${Title.COLS.join()}
            FROM title
            WHERE pool_id = ${this.id} AND is_used = FALSE`)
            .then(result => result.rows.map(x => Title.fromRow(this.db, x)));
    }
}

export class Participant extends Relation implements api.Participant {
    static COLS = new Columns(['id', 'challenge_id', 'user_id', 'failed_round_id']);
    id: number;
    challengeId: number;
    userId: number;
    failedRoundId: number | null;

    constructor(
        db: CommonQueryMethodsType,
        id: number,
        challengeId: number,
        userId: number,
        failedRoundId: number | null,
    ) {
        super(db);
        this.id = id;
        this.challengeId = challengeId;
        this.userId = userId;
        this.failedRoundId = failedRoundId;
    }

    static fromRow(db: CommonQueryMethodsType, row: QueryResultRowType, p = ''): Participant {
        return new Participant(db,
            nonNull(row, p + 'id'),
            nonNull(row, p + 'challenge_id'),
            nonNull(row, p + 'user_id'),
            maybeNull(row, p + 'failed_round_id'));
    }

    update(): Promise<void> {
        return this.db.query(sql`UPDATE participant SET failed_round_id = ${this.failedRoundId} WHERE id = ${this.id}`)
            .then(_ => { return; });
    }

    static fail(db: CommonQueryMethodsType, roundId: number, participantIds: number[]): Promise<void> {
        return db.query(sql`
            UPDATE participant
            SET failed_round_id = ${roundId}
            WHERE id IN (${sql.join(participantIds, sql`, `)})`).then(_ => { return; });
    }
}


export class Title extends Relation implements api.Title {
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
        db: CommonQueryMethodsType,
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
        super(db);
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

    static fromRow(db: CommonQueryMethodsType, row: QueryResultRowType, p = ''): Title {
        return new Title(db,
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
        return this.db.query(sql`
            UPDATE title SET pool_id = ${this.poolId}, participant_id = ${this.participantId},
                name = ${this.name}, url = ${this.url}, is_used = ${this.isUsed}, 
                is_hidden = ${this.isHidden}, score = ${this.score}, duration = ${this.duration},
                difficulty = ${this.difficulty}, num_of_episodes = ${this.numEpisodes}
            WHERE id = ${this.id}`).then(_ => { return; });
    }

    delete(): Promise<void> {
        return this.db.query(sql`DELETE FROM title WHERE id = ${this.id}`).then(_ => { return; });
    }
}

export class Round extends Relation implements api.Round {
    static COLS = new Columns(['id', 'num', 'challenge_id', 'start_time',
        'finish_time', 'is_finished']);
    id: number;
    num: number;
    challengeId: number;
    startTime: string;
    finishTime: string;
    isFinished: boolean;

    constructor(
        db: CommonQueryMethodsType,
        id: number,
        num: number,
        challengeId: number,
        startTime: string,
        finishTime: string,
        isFinished: boolean,
    ) {
        super(db);
        this.id = id;
        this.num = num;
        this.challengeId = challengeId;
        this.startTime = startTime;
        this.finishTime = finishTime;
        this.isFinished = isFinished;
    }

    static fromRow(db: CommonQueryMethodsType, row: QueryResultRowType): Round {
        return new Round(db,
            nonNull(row, 'id'),
            nonNull(row, 'num'),
            nonNull(row, 'challenge_id'),
            nonNull(row, 'start_time'),
            nonNull(row, 'finish_time'),
            nonNull(row, 'is_finished'));
    }

    update(): Promise<void> {
        return this.db.query(sql`
            UPDATE round SET num = ${this.num}, start_time = ${this.startTime},
                finish_time = ${this.finishTime}, is_finished = ${this.isFinished}
            WHERE id = ${this.id}`).then(_ => { return; });
    }

    addRoll(participantId: number, titleId: number): Promise<Roll> {
        return this.db.query(sql`
            INSERT INTO roll (round_id, participant_id, title_id)
            VALUES (${this.id}, ${participantId}, ${titleId})`)
            .then(_ => new Roll(this.db, this.id, participantId, titleId, null));
    }

    requireRoll(participantId: number): Promise<Roll> {
        return this.db.one(sql`
            SELECT ${Roll.COLS.join()} FROM roll
            WHERE round_id = ${this.id} AND participant_id = ${participantId}`)
            .then(x => Roll.fromRow(this.db, x));
    }
}

export class Roll extends Relation implements api.Roll {
    static COLS = new Columns(['round_id', 'participant_id', 'title_id', 'score']);
    roundId: number;
    participantId: number;
    titleId: number;
    score: number | null;

    constructor(
        db: CommonQueryMethodsType,
        roundId: number,
        participantId: number,
        titleId: number,
        score: number | null,
    ) {
        super(db);
        this.roundId = roundId;
        this.participantId = participantId;
        this.titleId = titleId;
        this.score = score;
    }

    static fromRow(db: CommonQueryMethodsType, row: QueryResultRowType, p = ''): Roll {
        return new Roll(db,
            nonNull(row, p + 'round_id'),
            nonNull(row, p + 'participant_id'),
            nonNull(row, p + 'title_id'),
            maybeNull(row, p + 'score'));
    }

    update(): Promise<void> {
        return this.db.query(sql`
            UPDATE roll SET score = ${this.score}, title_id = ${this.titleId}
            WHERE round_id = ${this.roundId} AND participant_id = ${this.participantId}`)
            .then(_ => { return; });
    }
}

export class Award extends Relation implements api.Award {
    static COLS = new Columns(['participant_id', 'url', 'time']);
    participantId: number;
    url: string | null;
    time: string;

    constructor(
        db: CommonQueryMethodsType,
        participantId: number,
        url: string | null,
        time: string,
    ) {
        super(db);
        this.participantId = participantId;
        this.url = url;
        this.time = time;
    }

    static fromRow(db: CommonQueryMethodsType, row: QueryResultRowType): Award {
        return new Award(db,
            nonNull(row, 'participant_id'),
            maybeNull(row, 'url'),
            nonNull(row, 'time'));
    }
}

export class KarmaHistory extends Relation implements api.KarmaHistory {
    static COLS = new Columns(['user_id', 'karma', 'time']);
    userId: number;
    karma: number;
    time: string;

    constructor(
        db: CommonQueryMethodsType,
        userId: number,
        karma: number,
        time: string,
    ) {
        super(db);
        this.userId = userId;
        this.karma = karma;
        this.time = time;
    }

    static fromRow(db: CommonQueryMethodsType, row: QueryResultRowType): KarmaHistory {
        return new KarmaHistory(db,
            nonNull(row, 'user_id'),
            nonNull(row, 'karma'),
            nonNull(row, 'time'));
    }

    static fetchLastValue(db: CommonQueryMethodsType, userId: number): Promise<number | null> {
        return db.maybeOneFirst<number>(sql`
            SELECT karma FROM karma_history WHERE user_id = ${userId}
            ORDER BY "time" DESC
            LIMIT 1`);
    }
}

export class UserStats implements api.UserStats {
    user: User;
    numChallenges: number;
    numCompleted: number;
    avgRate: number | null;
    avgTitleScore: number | null;
    mostWatched: api.UserCount[];
    mostSniped: api.UserCount[];
    karma: number | null;
    awards: string[];

    constructor(
        user: User,
        numChallenges: number,
        numCompleted: number,
        avgRate: number | null,
        avgTitleScore: number | null,
        mostWatched: api.UserCount[],
        mostSniped: api.UserCount[],
        karma: number | null,
        awards: string[],
    ) {
        this.user = user;
        this.numChallenges = numChallenges;
        this.numCompleted = numCompleted;
        this.avgRate = avgRate;
        this.avgTitleScore = avgTitleScore;
        this.mostWatched = mostWatched;
        this.mostSniped = mostSniped;
        this.karma = karma;
        this.awards = awards;
    }

    static async fetch(db: CommonQueryMethodsType, userId: number): Promise<UserStats> {
        const user = await User.require(db, userId);

        const challengeStats = await db.one<{ numChallenges: number, numCompleted: number }>(sql`
            SELECT
                CAST(COUNT(*) AS INTEGER) AS "numChallenges",
                CAST(
                    COALESCE(SUM(CASE WHEN P.failed_round_id IS NULL AND C.finish_time is NOT NULL THEN 1 ELSE 0 END), 0)
                    AS INTEGER
                ) AS "numCompleted"
            FROM challenge C
            JOIN participant P ON P.challenge_id = C.id
            WHERE P.user_id = ${userId}`);

        const avgRate = await db.maybeOneFirst<number>(sql`
            SELECT AVG(R.score) FROM roll R
            JOIN participant P ON P.id = R.participant_id
            WHERE P.user_id = ${userId} AND R.score IS NOT NULL`);

        const avgTitleScore = await db.maybeOneFirst<number>(sql`
            SELECT AVG(R.score) FROM roll R
            JOIN title T ON T.id = R.title_id
            JOIN participant P ON P.id = T.participant_id
            WHERE P.user_id = ${userId} AND R.score IS NOT NULL`);

        const mostWatched = await db.any<api.UserCount>(sql`
            SELECT
                U.id AS "userId",
                U.name AS "userName",
                CAST(COUNT(U.id) AS INTEGER) AS count
            FROM roll R
            JOIN participant P1 ON P1.id = R.participant_id
            JOIN title T ON T.id = R.title_id
            JOIN participant P2 ON P2.id = T.participant_id
            JOIN "user" U ON U.id = P2.user_id
            WHERE P1.user_id = ${userId}
            GROUP BY U.id
            ORDER BY count DESC LIMIT 6`);

        const mostSniped = await db.any<api.UserCount>(sql`
            SELECT
                U.id AS "userId",
                U.name AS "userName",
                CAST(COUNT(U.id) AS INTEGER) AS count
            FROM roll R
            JOIN participant P1 ON P1.id = R.participant_id
            JOIN "user" U ON U.id = P1.user_id
            JOIN title T ON T.id = R.title_id
            JOIN participant P2 ON P2.id = T.participant_id
            WHERE P2.user_id = ${userId}
            GROUP BY U.id
            ORDER BY count DESC LIMIT 6`);

        const awards = await db.anyFirst<string>(sql`
            SELECT awards.url FROM (
                SELECT C.award_url url, C.finish_time "time" FROM challenge C
                JOIN participant P1 ON P1.challenge_id = C.id
                WHERE P1.user_id = ${userId}
                    AND P1.failed_round_id IS NULL AND C.award_url IS NOT NULL
                UNION
                SELECT A.url url, A.time "time" from award A
				JOIN participant P2 ON P2.id = A.participant_id
                JOIN "user" U ON U.id = P2.user_id
                WHERE P2.user_id = ${userId}
            ) AS awards
            ORDER BY awards.time`);

        return new UserStats(
            user,
            challengeStats.numChallenges,
            challengeStats.numCompleted,
            avgRate,
            avgTitleScore,
            [...mostWatched],
            [...mostSniped],
            await KarmaHistory.fetchLastValue(db, userId),
            [...awards]
        );
    }
}