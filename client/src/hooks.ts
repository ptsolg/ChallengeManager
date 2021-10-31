import { useParams } from "react-router";
import { TypedUseSelectorHook, useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import { store } from "./store";

interface Params {
    challengeId: string
}

export function useChallengeId(): number {
    return parseInt(useParams<Params>().challengeId);
}

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export const useDispatch = (): AppDispatch => useReduxDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;