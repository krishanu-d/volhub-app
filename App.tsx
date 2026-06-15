import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import AppNavigator from 'src/navigation/Navigation';
import { store } from 'src/utils/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import {
  createNotificationChannel,
  displayForegroundNotification,
  getFCMToken,
  requestNotificationPermission,
} from 'src/services/notifiationService';

// ─── BACKGROUND handler — must be outside component, at file top level ─────────
// This runs when a notification arrives and app is in background/quit
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification:', remoteMessage);
  // notifee auto-displays it from the FCM payload if you set notification.android
});

export default function App() {
  useEffect(() => {
    console.log('google client id', Config.GOOGLE_WEB_CLIENT_ID);
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID, // from Google Cloud Console
      scopes: ['email', 'profile'],
    });
    async function setupNotifications() {
      const permitted = await requestNotificationPermission();
      if (!permitted) return;

      await createNotificationChannel();

      const token = await getFCMToken();
      if (token) {
        // TODO Phase 3: send this token to NestJS → save in DB against the user
        // api.post('/devices/token', { token })
        console.log('FCM TOKEN', token);
      }

      // Listen for token refresh (Firebase rotates tokens sometimes)
      const unsubscribeRefresh = messaging().onTokenRefresh(newToken => {
        // TODO: send refreshed token to NestJS
        console.log('Token refreshed:', newToken);
      });

      // ─── FOREGROUND notification listener ──────────────────────────────────
      const unsubscribeForeground = messaging().onMessage(
        async remoteMessage => {
          const title = remoteMessage.notification?.title ?? 'VolHub';
          const body = remoteMessage.notification?.body ?? '';
          await displayForegroundNotification(title, body);
        },
      );

      return () => {
        unsubscribeRefresh();
        unsubscribeForeground();
      };
    }

    setupNotifications();
  }, []);
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}
