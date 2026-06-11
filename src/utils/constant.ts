export const TIMEOUT = 15000; // 15 seconds

export const TOKEN_KEY = 'auth_token'; // MMKV key for storing the token

// Add all your endpoint strings here — never hardcode in screens
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  GOOGLE_LOGIN: '/auth/google/login',

  // User
  GET_USER: '/user/me',
  UPDATE_USER: '/user/update',

  // Add more endpoints here as your app grows
};

export const MMKV_KEYS = {
  AUTH_TOKEN: 'auth.token',
  AUTH_USER: 'auth.user',
  // Add more keys as needed
};

export const baseUrl = 'http://192.168.29.3:3000';

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
  DISASTER_RELIEF: 'disaster-relieft',
  ELDERLY_CARE: 'elderly-care',
  CHILDREN_YOUTH: 'children-youth',
  HOMELESS_SUPPORT: 'homeless-support',
  FOOD_SECURITY: 'food-security',
};
