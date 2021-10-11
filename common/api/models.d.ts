export interface User {
    id: number,
    discordId: string,
    name: string,
    avatarHash: string | null,
    karma: number | null,
}

export interface Participant {
    id: number,
    user: User,
    failedRoundId: number | null,
}

export interface Title {
    id: number,
    name: string,
    userName: string,
    url: string | undefined,
    score: number | undefined,
    duration: number | undefined,
    difficulty: number | undefined,
    numEpisodes: number | undefined
}

export interface Pool {
    id: number,
    name: string,
}

export interface Round {
    id: number,
    num: number,
    startTime: Date,
    finishTime: Date,
    isFinished: boolean,
}

export interface Challenge {
    id: number,
    name: string,
    creatorId: number,
    startTime: Date,
    finishTime: Date | null,
    awardUrl: string | null,
    allowHidden: boolean,
    description: string,
}

export interface Roll {
    userName: string,
    titleName: string,
    score: number | undefined,
}

export interface Award {
    participantId: number,
    url: string | undefined,
    time: Date
}
