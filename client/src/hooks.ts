import { useParams } from "react-router";
import { TypedUseSelectorHook, useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import { store } from "./store";
import { ChallengeState } from "./stateSlice";
import { ParticipantExt, Pool, RoundExt, User } from "../../common/api/models";

export function useChallengeId(): number {
    return parseInt(useParams<{ challengeId: string }>().challengeId);
}

export function useProfileId(): number {
    return parseInt(useParams<{ profileId: string }>().profileId);
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

export function useRounds(): RoundExt[] {
    return useChallenge()?.rounds ?? [];
}

export function useLastRound(): RoundExt | undefined {
    const r = useRounds();
    return r.length === 0 ? undefined : r[r.length - 1];
}