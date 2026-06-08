import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MMKV_KEYS } from 'src/utils/constant';
import {
  clearToken,
  clearUser,
  getToken,
  setToken,
  setUser,
  storage,
} from 'src/utils/storage';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Rehydrate from MMKV on store init
const token = getToken() ?? null;
const userRaw = storage.getString(MMKV_KEYS.AUTH_USER);
const user: AuthUser | null = userRaw ? JSON.parse(userRaw) : null;

const initialState: AuthState = {
  token,
  user,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },

    loginSuccess(
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Persist to MMKV
      setToken(token);
      setUser(user);
    },

    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Clear MMKV
      clearToken();
      clearUser();
    },

    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        setUser(state.user);
      }
    },

    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
