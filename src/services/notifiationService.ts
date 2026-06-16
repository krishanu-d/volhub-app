import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { setFcmToken } from 'src/slice/deviceSlice';
import { baseUrl, ENDPOINTS } from 'src/utils/constant';
import {
  getSyncedFcmToken,
  setSyncedFcmToken,
} from 'src/utils/storage';
import { store } from 'src/utils/store';
import { postRequest } from './apiService';

// ─── Permission ────────────────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  return enabled;
}

// ─── Get FCM Token ─────────────────────────────────────────────────────────────
// This token identifies THIS device — you save it to your backend
// so NestJS knows where to send notifications for this user
export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (e) {
    console.error('FCM token error:', e);
    return null;
  }
}

// ─── Create Notification Channel (Android requires this) ───────────────────────
export async function syncFcmTokenIfNeeded(
  token?: string | null,
): Promise<boolean> {
  const { isAuthenticated } = store.getState().auth;

  if (!isAuthenticated) {
    return false;
  }

  const fcmToken = token ?? (await getFCMToken());

  if (!fcmToken) {
    return false;
  }

  const lastSyncedToken = getSyncedFcmToken();

  if (fcmToken === lastSyncedToken) {
    store.dispatch(setFcmToken(fcmToken));
    return true;
  }

  const response = await postRequest(baseUrl + ENDPOINTS.UPDATE_FCM_TOKEN, {
    fcmToken,
  });

  if (!response.success) {
    console.error('FCM token sync failed:', response.error);
    return false;
  }

  setSyncedFcmToken(fcmToken);
  store.dispatch(setFcmToken(fcmToken));
  return true;
}

export async function createNotificationChannel() {
  await notifee.createChannel({
    id: 'volhub_default',
    name: 'VolHub Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

// ─── Display a notification when app is in FOREGROUND ─────────────────────────
// FCM alone doesn't show banners when app is open — notifee handles this
export async function displayForegroundNotification(
  title: string,
  body: string,
) {
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: 'volhub_default',
      pressAction: { id: 'default' },
    },
  });
}
