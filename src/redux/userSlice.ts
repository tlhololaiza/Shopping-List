import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  preferences: string[];
}

const initialState: UserState = {
  preferences: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPreferences: (state, action: PayloadAction<string[]>) => {
      state.preferences = action.payload;
    },
    addPreference: (state, action: PayloadAction<string>) => {
      state.preferences.push(action.payload);
    },
  },
});

export const { setPreferences, addPreference } = userSlice.actions;

export default userSlice.reducer;