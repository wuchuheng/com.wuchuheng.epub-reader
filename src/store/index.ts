import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import counterReducer from './slices/counterSlice';

// 2. Define the store using the root reducer
const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export default store;

// 2. Define the hooks.
// 2.1 Define the dispatch hook.
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
type RootState = ReturnType<typeof store.getState>;

// 2.2 Define the selector hook.
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector<RootState, T>(selector);

export type { RootState };
