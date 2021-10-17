CREATE TABLE "user" (
    id SERIAL PRIMARY KEY NOT NULL,
    discord_id BIGINT NOT NULL UNIQUE,
    color VARCHAR(7),
    name TEXT NOT NULL,
    avatar_hash TEXT,
    CHECK(color LIKE '#%')
);

CREATE TABLE challenge (
    id SERIAL PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    finish_time TIMESTAMP DEFAULT NULL,
    award_url TEXT DEFAULT NULL,
    creator_id INTEGER NOT NULL,
    allow_hidden BOOLEAN DEFAULT TRUE,
    description TEXT DEFAULT '',

    FOREIGN KEY (creator_id) REFERENCES "user"(id)
);

CREATE TABLE participant (
    id SERIAL PRIMARY KEY NOT NULL,
    challenge_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    failed_round_id INTEGER DEFAULT NULL,

    UNIQUE (challenge_id, user_id),
    FOREIGN KEY (challenge_id) REFERENCES challenge (id),
    FOREIGN KEY (user_id) REFERENCES "user" (id)
);

CREATE TABLE pool (
    id SERIAL PRIMARY KEY NOT NULL,
    challenge_id INTEGER NOT NULL,
    name TEXT NOT NULL,

    UNIQUE(challenge_id, name),
    FOREIGN KEY (challenge_id) REFERENCES challenge (id)
);

CREATE TABLE title (
    id SERIAL PRIMARY KEY NOT NULL,
    pool_id INTEGER NOT NULL,
    participant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    url TEXT,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    score FLOAT,
    duration INTEGER,
    difficulty FLOAT,
    num_of_episodes INTEGER,

    FOREIGN KEY (pool_id) REFERENCES pool (id),
    FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE
);

CREATE TABLE round (
    id SERIAL PRIMARY KEY NOT NULL,
    num INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    finish_time TIMESTAMP NOT NULL,
    is_finished BOOLEAN NOT NULL DEFAULT FALSE,

    UNIQUE (challenge_id, num),
    FOREIGN KEY (challenge_id) REFERENCES challenge (id)
);

ALTER TABLE participant
    ADD CONSTRAINT failed_round_id_fk
    FOREIGN KEY (failed_round_id)
    REFERENCES round(id);

CREATE TABLE roll (
    round_id INTEGER NOT NULL,
    participant_id INTEGER NOT NULL,
    title_id INTEGER NOT NULL,
    score REAL DEFAULT NULL,

    UNIQUE (round_id, participant_id),
    FOREIGN KEY (round_id) REFERENCES round (id),
    FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE,
    FOREIGN KEY (title_id) REFERENCES title (id) ON DELETE CASCADE
);

CREATE TABLE award (
    participant_id INTEGER NOT NULL,
    "url" TEXT DEFAULT NULL,
    "time" TIMESTAMP NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participant (id)
);

CREATE TABLE karma_history (
    user_id INTEGER NOT NULL,
    karma INTEGER NOT NULL,
    "time" TIMESTAMP NOT NULL,

    FOREIGN KEY (user_id) REFERENCES "user" (id)
);