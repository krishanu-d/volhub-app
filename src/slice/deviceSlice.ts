import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';

interface DeviceState {
  fcmToken: string | null;
}

const initialState: DeviceState = {
  fcmToken: null,
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setFcmToken(state, action: PayloadAction<string | null>) {
      state.fcmToken = action.payload;
    },
    clearDevice(state) {
      state.fcmToken = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(logout, state => {
      state.fcmToken = null;
    });
  },
});

export const { setFcmToken, clearDevice } = deviceSlice.actions;

export default deviceSlice.reducer;
