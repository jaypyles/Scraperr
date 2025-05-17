import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import {
  SettingsState,
  setAiEnabled,
  setRecordingsEnabled,
} from "./slices/settingsSlice";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useUserSettings = () => {
  const userSettings = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  const setUserSettings = (userSettings: any) => {
    dispatch(setAiEnabled(userSettings.ai_enabled));
    dispatch(setRecordingsEnabled(userSettings.recordings_enabled));
    return userSettings;
  };

  return { userSettings, setUserSettings };
};
