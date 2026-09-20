import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { logout, setAuthToken } from 'src/slice/authSlice';
import { ENDPOINTS } from 'src/utils/constant';
import { setUser } from 'src/utils/storage';
import { store } from 'src/utils/store';
import { postRequest } from './apiService';
import { syncFcmTokenIfNeeded } from './notifiationService';

export interface AuthUser {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  picture?: string | null;
  role?: 'ngo' | 'volunteer' | 'admin' | null;
  isProfileComplete?: boolean;
}

export interface GoogleLoginResponse {
  success: boolean;
  accessToken: string | null;
  error: string | null;
  isNewUser: boolean;
  user: AuthUser | null;
}

export async function signInWithGoogle(): Promise<GoogleLoginResponse> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo?.data?.idToken;

    if (!idToken) {
      return {
        success: false,
        accessToken: null,
        isNewUser: false,
        user: null,
        error: 'Failed to retrieve token from Google. Please try again.',
      };
    }

    const response = await postRequest<{
      accessToken: string;
      isNewUser: boolean;
      user: AuthUser;
    }>(ENDPOINTS.GOOGLE_LOGIN, { idToken });

    if (!response.success || !response.data?.accessToken) {
      return {
        success: false,
        accessToken: null,
        isNewUser: false,
        user: null,
        error: response.error ?? 'Login failed. Please try again.',
      };
    }

    store.dispatch(setAuthToken(response.data.accessToken));
    setUser(response.data.user);
    void syncFcmTokenIfNeeded();

    return {
      success: true,
      accessToken: response.data.accessToken,
      isNewUser: response.data.isNewUser ?? false,
      user: response.data.user,
      error: null,
    };
  } catch (error: unknown) {
    return {
      success: false,
      accessToken: null,
      isNewUser: false,
      user: null,
      error: getGoogleSignInError(error),
    };
  }
}

export async function signOutFromGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
    store.dispatch(logout());
  } catch (error) {
    console.error('Google Sign-Out error:', error);
  }
}

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
