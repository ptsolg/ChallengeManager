export interface Message {
    message: string;
}

export interface User {
    id: number;
    discordId: string;
    name: string;
    avatarUrl: string | null;
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
    hasStarted: boolean; // 'true' if number of rounds > 0
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

export interface EditTitleParams {
    name: string;
    url: string | null;
    isHidden: boolean;
}

export interface CreateTitleParams extends EditTitleParams {
    userId: number | null;
}

export interface Title extends EditTitleParams {
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

export interface ExtendRoundParams {
    numDays: number;
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

export interface RateTitleParams {
    score: number;
}

export interface UserCount {
    userId: number;
    userName: string;
    count: number;
}

export interface KarmaDataPoint {
    karma: number;
    time: string;
}

export interface UserStats {
    user: User;
    numChallenges: number;
    numCompleted: number;
    avgRate: number | null;
    avgTitleScore: number | null;
    mostWatched: UserCount[];
    mostSniped: UserCount[];
    karma: number | null;
    awards: string[];
    karmaHistory: KarmaDataPoint[];
}

export interface IdList {
    ids: number[];
}