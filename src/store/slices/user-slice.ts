import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user.type";

const initialState: User = {
  isAuthenticated: false,
  loading: false,
  error: null,
  email: undefined,
  username: undefined,
  full_name: undefined,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.full_name = action.payload.full_name;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.email = undefined;
      state.username = undefined;
      state.full_name = undefined;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, logout } = userSlice.actions;
export default userSlice.reducer;
