import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

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
