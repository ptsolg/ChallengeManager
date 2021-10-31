import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ClientChallenge, CreatePoolParams, Message, ParticipantExt, Pool, Round, StartRoundParams, User } from '../../common/api/models';
import * as api from './api';

interface State {
    user?: User;
    challenge?: ClientChallenge;
    pools: Pool[];
    rounds: Round[];
    participants: ParticipantExt[];
    errors: { message: string, show: boolean }[];
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

export const startRound = createAsyncThunk(
    'state/startRound',
    ({ challengeId, params }: { challengeId: number, params: StartRoundParams }) => api.startRound(challengeId, params)
);

export const finishRound = createAsyncThunk(
    'state/finishRound',
    (cid: number) => api.finishRound(cid)
);

export const fetchPools = createAsyncThunk(
    'state/fetchPools',
    (cid: number) => api.fetchPools(cid)
);

export const fetchRounds = createAsyncThunk(
    'state/fetchRounds',
    (cid: number) => api.fetchRounds(cid)
);

const stateSlice = createSlice({
    name: 'state',
    initialState: {
        user: undefined,
        challenge: undefined,
        pools: [],
        rounds: [],
        participants: [],
        errors: [],
    } as State,
    reducers: {
        emitError(state, action: PayloadAction<string>) {
            state.errors.push({
                message: action.payload,
                show: true
            });
        },
        hideError(state, action: PayloadAction<number>) {
            state.errors[action.payload].show = false;
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
            state.challenge = action.payload;
        },
        [join.fulfilled.type]: (state, _) => {
            if (state.challenge !== undefined) {
                state.challenge.canJoin = false;
                state.challenge.isParticipant = true;
            }
        },
        [leave.fulfilled.type]: (state, action: PayloadAction<ClientChallenge | undefined>) => {
            state.challenge = action.payload;
        },
        [addPool.fulfilled.type]: (state, action: PayloadAction<Pool>) => {
            state.pools.push(action.payload);
        },
        [addPool.rejected.type]: (state, action) => {
            state.errors.push({
                message: (action.error as Message).message,
                show: true
            });
        },
        [startRound.fulfilled.type]: (state, action: PayloadAction<Round>) => {
            state.rounds.push(action.payload);
        },
        [finishRound.fulfilled.type]: (state, action: PayloadAction<Round>) => {
            state.rounds[state.rounds.length - 1] = action.payload;
        },
        [fetchPools.fulfilled.type]: (state, action: PayloadAction<Pool[]>) => {
            state.pools = action.payload;
        },
        [fetchRounds.fulfilled.type]: (state, action: PayloadAction<Round[]>) => {
            state.rounds = action.payload;
        },
    }
});

export const { emitError, hideError } = stateSlice.actions;
export default stateSlice.reducer;