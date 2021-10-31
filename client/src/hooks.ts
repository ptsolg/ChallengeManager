import { useParams } from "react-router";
import { TypedUseSelectorHook, useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import { store } from "./store";
import { ChallengeState } from "./stateSlice";
import { ParticipantExt, Pool, Round, User } from "../../common/api/models";

interface Params {
    challengeId: string
}

export function useChallengeId(): number {
    return parseInt(useParams<Params>().challengeId);
}

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export const useDispatch = (): AppDispatch => useReduxDispatch<AppDispatch>();

const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export function useChallenge(): ChallengeState | undefined {
    const cid = useChallengeId();
    return useSelector(state => cid in state.challenge ? state.challenge[cid] : undefined);
}

export function useErrors(): { message: string, show: boolean }[] {
    return useChallenge()?.errors ?? [];
}

export function useUser(): User | undefined {
    return useSelector(state => state.user);
}

export function usePools(): Pool[] {
    return useChallenge()?.pools ?? [];
}

export function useParticipants(): ParticipantExt[] {
    return useChallenge()?.participants ?? [];
}

export function useRounds(): Round[] {
    return useChallenge()?.rounds ?? [];
}