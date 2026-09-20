export const TIMEOUT = 15000; // 15 seconds
export const baseUrl = 'http://192.168.1.9:3000';

// Add all endpoint paths here. The base URL belongs in apiClient.
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  GOOGLE_LOGIN: '/auth/google/login',

  // User
  GET_USER: '/users/me',
  UPDATE_USER: '/users/me',
  COMPLETE_PROFILE: '/users/me/complete-profile',
  UPDATE_FCM_TOKEN: '/users/me/fcm-token',

  // Add more endpoints here as your app grows
};

export const MMKV_KEYS = {
  AUTH_TOKEN: 'auth.token',
  AUTH_USER: 'auth.user',
  FCM_SYNCED_TOKEN: 'fcm.syncedToken',
  // Add more keys as needed
};

export const OPPORTUNITY_CATEGORIES = {
  ENVIRONMENT: 'environment',
  EDUCATION: 'education',
  HEALTH: 'health',
  COMMUNITY: 'community',
  ANIMAL_WELFARE: 'animal-welfare',
  ART_CULTURE: 'art-culture',
  TECHNOLOGY: 'technology',
  SPORTS_RECREATION: 'sports-recreation',
  HUMAN_RIGHTS: 'human-rights',
  DISASTER_RELIEF: 'disaster-relief',
  ELDERLY_CARE: 'elderly-care',
  CHILDREN_YOUTH: 'children-youth',
  HOMELESS_SUPPORT: 'homeless-support',
  FOOD_SECURITY: 'food-security',
};
