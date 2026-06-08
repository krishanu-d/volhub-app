import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import AppNavigator from 'src/navigation/Navigation';
import { store } from 'src/utils/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
export default function App() {
  useEffect(() => {
    console.log('google client id', Config.GOOGLE_WEB_CLIENT_ID);
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID, // from Google Cloud Console
      scopes: ['email', 'profile'],
    });
  }, []);
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}
