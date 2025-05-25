import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { setAiEnabled, setRecordingsEnabled } from "./slices/settingsSlice";
import { setUser } from "./slices/user-slice";
import type { AppDispatch, RootState } from "./store";

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

export const useUser = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const setUserState = (user: any) => {
    dispatch(setUser(user));
  };

  const clearUserState = () => {
    dispatch(
      setUser({
        isAuthenticated: false,
        loading: false,
        error: null,
        email: undefined,
        username: undefined,
        full_name: undefined,
      })
    );
  };

  return { user, setUserState, clearUserState };
};
