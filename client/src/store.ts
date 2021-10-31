import { configureStore } from '@reduxjs/toolkit';
import reducer from './stateSlice';

export const store = configureStore({
    reducer: reducer
});
