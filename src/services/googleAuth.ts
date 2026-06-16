import {
  GoogleSignin,
  statusCodes,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import { postRequest } from './apiService';
import { logout, setAuthToken } from 'src/slice/authSlice';
import { syncFcmTokenIfNeeded } from './notifiationService';
import { baseUrl, ENDPOINTS } from 'src/utils/constant';
import { store } from 'src/utils/store';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GoogleLoginResponse {
  success: boolean;
  access_token: string | null; // your app's JWT from backend
  error: string | null;
  isNewUser: boolean; // optional, if your backend provides this info
}

// ─── Sign In ─────────────────────────────────────────────────────────────────
/**
 * Triggers the Google sign-in flow.
 * On success, sends idToken to your backend and stores the returned JWT.
 *
 * Returns { success, access_token, error, isNewUser }
 */
export async function signInWithGoogle(): Promise<GoogleLoginResponse> {
  try {
    // Check Play Services availability (Android)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Trigger sign-in sheet
    const userInfo = await GoogleSignin.signIn();
    console.log('userInfo', userInfo);

    const idToken = userInfo?.data?.idToken;
    console.log('idtoke', idToken);
    if (!idToken) {
      return {
        success: false,
        access_token: null,
        isNewUser: false,
        error: 'Failed to retrieve token from Google. Please try again.',
      };
    }

    // Send idToken to your backend
    const response = await postRequest<{
      access_token: string;
      isNewUser: boolean;
    }>(baseUrl + ENDPOINTS.GOOGLE_LOGIN, { idToken });
    console.log('response', response);

    if (!response.success || !response.data?.access_token) {
      return {
        success: false,
        access_token: null,
        isNewUser: false,
        error: response.error ?? 'Login failed. Please try again.',
      };
    }

    // Store your app's JWT in Redux and MMKV.
    store.dispatch(setAuthToken(response.data.access_token));
    void syncFcmTokenIfNeeded();

    return {
      success: true,
      access_token: response.data.access_token,
      isNewUser: response.data.isNewUser ?? false, // if your backend provides this info
      error: null,
    };
  } catch (error: unknown) {
    return {
      success: false,
      access_token: null,
      isNewUser: false,
      error: getGoogleSignInError(error),
    };
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
/**
 * Signs the user out from Google and clears the stored JWT.
 */
export async function signOutFromGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
    store.dispatch(logout());
  } catch (error) {
    console.error('Google Sign-Out error:', error);
  }
}

// ─── Error Handler ────────────────────────────────────────────────────────────

function getGoogleSignInError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;

    switch (code) {
      case statusCodes.SIGN_IN_CANCELLED:
        return 'Sign-in was cancelled.';
      case statusCodes.IN_PROGRESS:
        return 'Sign-in is already in progress.';
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return 'Google Play Services is not available on this device.';
      default:
        return 'Google Sign-In failed. Please try again.';
    }
  }

  return 'Something went wrong. Please try again.';
}

export { GoogleSigninButton };
