import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

// 1. Declare the slice.
// 1.1. Declare the counter type.
export type Counter = {
  value: number;
};

// 1.2 Define the counter state.
// 1.2.1 Define the initial state.
const initialState: Counter = {
  value: 0,
};

// 1.2.2 Create the counter slice.
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // Set the counter value.
    setValue: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
  },
});

// 1.3 Export the reducer.
export default counterSlice.reducer;

// 2. Define the usehooks.
// 2.1 Define the useSetCountThunk.
export const useSetCountThunk = () => {
  const dispatch = useDispatch();

  // 2. Process the logic.
  // 2.1 Define the setCount function.
  const setCount = async (value: number) => {
    // Sleep 1 second.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Set the count to the state.
    dispatch(counterSlice.actions.setValue(value));
  };

  return setCount;
};
