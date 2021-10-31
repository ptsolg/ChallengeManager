export interface Message {
    message: string;
}

export interface User {
    id: number;
    discordId: string;
    name: string;
    avatarHash: string | null;
}

export interface CreateChallengeParams {
    name: string;
    awardUrl: string | null;
    allowHidden: boolean;
    description: string;
}

export interface Challenge extends CreateChallengeParams {
    id: number;
    startTime: string;
    finishTime: string | null;
    creatorId: number;
}

export interface ClientChallenge extends Challenge {
    canJoin: boolean;
    isParticipant: boolean;
    isCreator: boolean;
}

export interface Participant {
    id: number;
    challengeId: number;
    userId: number;
    failedRoundId: number | null;
}

export interface ParticipantExt extends Participant {
    user: User,
    karma: number | null,
}

export interface CreatePoolParams {
    name: string;
}

export interface Pool extends CreatePoolParams {
    id: number;
    challengeId: number;
}

export interface CreateTitleParams {
    userId: number | null;
    name: string;
    url: string | null;
    isHidden: boolean;
}

export interface Title extends Omit<CreateTitleParams, 'userId'> {
    id: number;
    poolId: number;
    participantId: number;
    isUsed: boolean;
    score: number | null;
    duration: number | null;
    difficulty: number | null;
    numEpisodes: number | null;
}

export interface TitleExt extends Title {
    proposer: User
}

export interface StartRoundParams {
    poolName: string;
    finishTime: string;
}

export interface Round {
    id: number;
    num: number;
    challengeId: number;
    startTime: string;
    finishTime: string;
    isFinished: boolean;
}

export interface Roll {
    roundId: number;
    participantId: number;
    titleId: number;
    score: number | null;
}

export interface RollExt extends Roll {
    title: Title,
    watcher: User
}

export interface RoundExt extends Round {
    rolls: RollExt[]
}

export interface Award {
    participantId: number;
    url: string | null;
    time: string;
}

export interface KarmaHistory {
    userId: number;
    karma: number;
    time: string;
}
