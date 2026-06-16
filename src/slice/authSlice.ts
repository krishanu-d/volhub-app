import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  clearToken,
  clearSyncedFcmToken,
  clearUser,
  getToken,
  setToken,
} from 'src/utils/storage';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

// Rehydrate from MMKV on store init
const token = getToken() ?? null;

const initialState: AuthState = {
  token,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isAuthenticated = true;

      setToken(action.payload);
    },

    logout(state) {
      state.token = null;
      state.isAuthenticated = false;

      // Clear MMKV
      clearToken();
      clearUser();
      clearSyncedFcmToken();
    },
  },
});

export const { setAuthToken, logout } = authSlice.actions;

export default authSlice.reducer;
