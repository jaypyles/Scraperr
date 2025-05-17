import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  aiEnabled: boolean;
  recordingsEnabled: boolean;
}

const initialState: SettingsState = {
  aiEnabled: false,
  recordingsEnabled: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setAiEnabled: (state, action: PayloadAction<boolean>) => {
      state.aiEnabled = action.payload;
    },
    setRecordingsEnabled: (state, action: PayloadAction<boolean>) => {
      state.recordingsEnabled = action.payload;
    },
  },
});

export const { setAiEnabled, setRecordingsEnabled } = settingsSlice.actions;

export default settingsSlice.reducer;
