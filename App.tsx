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
  syncFcmTokenIfNeeded,
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

    let cleanup: (() => void) | undefined;
    async function setupNotifications() {
      await createNotificationChannel();
      void syncFcmTokenIfNeeded();

      // Listen for token refresh (Firebase rotates tokens sometimes)
      const unsubscribeRefresh = messaging().onTokenRefresh(async newToken => {
        await syncFcmTokenIfNeeded(newToken);
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

    setupNotifications().then(unsubscribe => {
      cleanup = unsubscribe;
    });

    return () => {
      cleanup?.();
    };
  }, []);
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}
