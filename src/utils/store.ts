import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/slice/authSlice';
import deviceReducer from 'src/slice/deviceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    device: deviceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
