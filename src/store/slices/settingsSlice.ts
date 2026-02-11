import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TypographySettings } from '../../types/book';
import * as OPFSManager from '../../services/OPFSManager';

interface SettingsState {
  typography: TypographySettings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  typography: {
    fontFamily: 'system',
    fontSize: 100,
  },
  isLoading: false,
  isSaving: false,
  error: null,
};

export const loadSettings = createAsyncThunk('settings/load', async (_, { rejectWithValue }) => {
  try {
    const typography = await OPFSManager.getTypographySettings();
    return { typography };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to load settings');
  }
});

export const updateTypography = createAsyncThunk(
  'settings/updateTypography',
  async (settings: Partial<TypographySettings>, { rejectWithValue }) => {
    try {
      await OPFSManager.updateTypographySettings(settings);
      return settings;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update typography');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTypography: (state, action: PayloadAction<Partial<TypographySettings>>) => {
      state.typography = { ...state.typography, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.typography = action.payload.typography;
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTypography.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateTypography.fulfilled, (state, action) => {
        state.isSaving = false;
        state.typography = { ...state.typography, ...action.payload };
      })
      .addCase(updateTypography.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTypography } = settingsSlice.actions;
export default settingsSlice.reducer;
