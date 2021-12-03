import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ClientChallenge, CreatePoolParams, ExtendRoundParams, IdList, Message, ParticipantExt, Pool, RateTitleParams, Round, RoundExt, StartRoundParams, User } from '../../common/api/models';
import * as api from './api';

export interface ChallengeState extends ClientChallenge {
    pools: Pool[];
    rounds: RoundExt[];
    participants: ParticipantExt[];
    errors: { message: string, show: boolean }[];
}

export interface State {
    user?: User;
    cid: number;
    challenge: { [key: number]: ChallengeState }
}

export const fetchCurrentUser = createAsyncThunk(
    'state/fetchCurrentUser',
    () => api.fetchCurrentUser()
);

export const login = createAsyncThunk(
    'state/login',
    (code: string) => api.login(code)
);

export const logout = createAsyncThunk(
    'state/logout',
    () => api.logout()
);

export const fetchChallenge = createAsyncThunk(
    'state/fetchChallenge',
    (cid: number) => api.fetchClientChallenge(cid)
);

export const join = createAsyncThunk(
    'state/join',
    (cid: number) => api.joinChallenge(cid)
);

export const leave = createAsyncThunk(
    'state/leave',
    (cid: number) => api.leaveChallenge(cid).then(_ => fetchChallenge(cid))
);

export const addPool = createAsyncThunk(
    'state/addPool',
    ({ challengeId, params }: { challengeId: number, params: CreatePoolParams }) => api.newPool(challengeId, params)
);

export const editPool = createAsyncThunk(
    'state/editPool',
    ({ challengeId, name, params }: { challengeId: number, name: string, params: CreatePoolParams }) => {
        return api.editPool(challengeId, name, params).then(_ => [name, params.name]);
    }
);

export const deletePool = createAsyncThunk(
    'state/deletePool',
    ({ challengeId, name }: { challengeId: number, name: string }) => api.deletePool(challengeId, name).then(_ => name)
);

export const startRound = createAsyncThunk(
    'state/startRound',
    ({ challengeId, params }: { challengeId: number, params: StartRoundParams }) => api.startRound(challengeId, params)
);

export const finishRound = createAsyncThunk(
    'state/finishRound',
    (cid: number) => api.finishRound(cid)
);

export const extendRound = createAsyncThunk(
    'state/extendRound',
    ({ challengeId, params }: { challengeId: number, params: ExtendRoundParams }) => api.extendRound(challengeId, params)
);

export const fetchPools = createAsyncThunk(
    'state/fetchPools',
    (cid: number) => api.fetchPools(cid)
);

export const fetchRounds = createAsyncThunk(
    'state/fetchRounds',
    (cid: number) => api.fetchRounds(cid)
);

export const fetchParticipants = createAsyncThunk(
    'state/fetchParticipants',
    (cid: number) => api.fetchParticipants(cid)
);

export const rateTitle = createAsyncThunk(
    'state/rateTitle',
    ({ challengeId, params }: { challengeId: number, params: RateTitleParams }) => {
        return api.rateTitle(challengeId, params).then(_ => params.score);
    }
);

export const swapTitles = createAsyncThunk(
    'state/swapTitles',
    ({ challengeId, userIds }: { challengeId: number, userIds: IdList }) => {
        return api.swapTitles(challengeId, userIds);
    }
);

export const randomSwapTitles = createAsyncThunk(
    'state/randomSwapTitles',
    ({ challengeId, userIds }: { challengeId: number, userIds: IdList }) => {
        return api.randomSwapTitles(challengeId, userIds);
    }
);

export const finishChallenge = createAsyncThunk(
    'state/finishChallenge',
    (cid: number) => api.finishChallenge(cid)
);

function initialChallengeState(cid: number): ChallengeState {
    return {
        id: cid,
        name: '',
        awardUrl: null,
        allowHidden: false,
        description: '',
        startTime: '',
        finishTime: null,
        creatorId: -1,
        canJoin: false,
        isParticipant: false,
        isCreator: false,
        hasStarted: false,
        pools: [],
        rounds: [],
        participants: [],
        errors: [],
    };
}

function getChallenge(state: State): ChallengeState {
    if (!(state.cid in state.challenge))
        state.challenge[state.cid] = initialChallengeState(state.cid);
    return state.challenge[state.cid];
}

const stateSlice = createSlice({
    name: 'state',
    initialState: {
        user: undefined,
        cid: -1,
        challenge: {},
    } as State,
    reducers: {
        emitError(state, action: PayloadAction<string>) {
            getChallenge(state).errors.push({
                message: action.payload,
                show: true
            });
        },
        hideError(state, action: PayloadAction<number>) {
            getChallenge(state).errors[action.payload].show = false;
        },
        setChallengeId(state, action: PayloadAction<number>) {
            state.cid = action.payload;
        }
    },
    extraReducers: {
        [login.fulfilled.type]: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        [fetchCurrentUser.fulfilled.type]: (state, action: PayloadAction<User | undefined>) => {
            state.user = action.payload;
        },
        [logout.fulfilled.type]: (state, _) => {
            state.user = undefined;
        },
        [fetchChallenge.fulfilled.type]: (state, action: PayloadAction<ClientChallenge | undefined>) => {
            const c = getChallenge(state);
            state.challenge[state.cid] = {
                ...c,
                ...action.payload,
            };
        },
        [join.fulfilled.type]: (state, _) => {
            const c = getChallenge(state);
            c.canJoin = false;
            c.isParticipant = true;
        },
        [leave.fulfilled.type]: (state, action: PayloadAction<ClientChallenge | undefined>) => {
            const c = getChallenge(state);
            state.challenge[state.cid] = {
                ...c,
                ...action.payload,
            };
        },
        [addPool.fulfilled.type]: (state, action: PayloadAction<Pool>) => {
            getChallenge(state).pools.push(action.payload);
        },
        [addPool.rejected.type]: (state, action) => {
            getChallenge(state).errors.push({
                message: (action.error as Message).message,
                show: true
            });
        },
        [startRound.fulfilled.type]: (state, action: PayloadAction<RoundExt>) => {
            const c = getChallenge(state);
            c.rounds.push(action.payload);
            c.hasStarted = true;
        },
        [finishRound.fulfilled.type]: (state, action: PayloadAction<Round>) => {
            const c = getChallenge(state);
            const r = c.rounds[c.rounds.length - 1];
            c.rounds[c.rounds.length - 1] = { ...r, ...action.payload };
        },
        [extendRound.fulfilled.type]: (state, action: PayloadAction<Round>) => {
            const c = getChallenge(state);
            const r = c.rounds[c.rounds.length - 1];
            c.rounds[c.rounds.length - 1] = { ...r, ...action.payload };
        },
        [fetchPools.fulfilled.type]: (state, action: PayloadAction<Pool[]>) => {
            getChallenge(state).pools = action.payload;
        },
        [fetchRounds.fulfilled.type]: (state, action: PayloadAction<RoundExt[]>) => {
            getChallenge(state).rounds = action.payload;
        },
        [fetchParticipants.fulfilled.type]: (state, action: PayloadAction<ParticipantExt[]>) => {
            getChallenge(state).participants = action.payload;
        },
        [rateTitle.fulfilled.type]: (state, action: PayloadAction<number>) => {
            const c = getChallenge(state);
            const roll = c.rounds[c.rounds.length - 1].rolls.find(x => x.watcher.id === state.user?.id);
            if (roll !== undefined)
                roll.score = action.payload;
        },
        [swapTitles.fulfilled.type]: (state, action: PayloadAction<RoundExt>) => {
            const c = getChallenge(state);
            c.rounds[action.payload.num] = action.payload;
        },
        [randomSwapTitles.fulfilled.type]: (state, action: PayloadAction<RoundExt>) => {
            const c = getChallenge(state);
            c.rounds[action.payload.num] = action.payload;
        },
        [finishChallenge.fulfilled.type]: (state, action: PayloadAction<ClientChallenge>) => {
            const c = getChallenge(state);
            state.challenge[state.cid] = {
                ...c,
                ...action.payload
            };
        },
        [editPool.fulfilled.type]: (state, action: PayloadAction<[string, string]>) => {
            const c = getChallenge(state);
            const i = c.pools.findIndex(x => x.name === action.payload[0]);
            c.pools[i].name = action.payload[1];
        },
        [deletePool.fulfilled.type]: (state, action: PayloadAction<string>) => {
            const c = getChallenge(state);
            c.pools = c.pools.filter(x => x.name !== action.payload);
        }
    }
});

export const { emitError, hideError, setChallengeId } = stateSlice.actions;
export default stateSlice.reducer;