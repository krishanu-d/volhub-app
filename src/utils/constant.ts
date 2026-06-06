export const TIMEOUT = 15000; // 15 seconds

export const TOKEN_KEY = 'auth_token'; // MMKV key for storing the token

// Add all your endpoint strings here — never hardcode in screens
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',

  // User
  GET_USER: '/user/me',
  UPDATE_USER: '/user/update',

  // Add more endpoints here as your app grows
};
