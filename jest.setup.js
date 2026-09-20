const mockMmkvStore = new Map();

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    set: jest.fn((key, value) => {
      mockMmkvStore.set(key, String(value));
    }),
    getString: jest.fn(key => mockMmkvStore.get(key)),
    remove: jest.fn(key => {
      mockMmkvStore.delete(key);
    }),
  }),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
  GoogleSigninButton: 'GoogleSigninButton',
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('react-native-config', () => ({
  GOOGLE_WEB_CLIENT_ID: 'test-google-client-id',
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(),
    displayNotification: jest.fn(),
  },
  AndroidImportance: {
    HIGH: 4,
  },
}));

jest.mock('@react-native-firebase/messaging', () => {
  const messaging = () => ({
    requestPermission: jest.fn(async () => messaging.AuthorizationStatus.AUTHORIZED),
    getToken: jest.fn(async () => 'test-fcm-token'),
    onTokenRefresh: jest.fn(() => jest.fn()),
    onMessage: jest.fn(() => jest.fn()),
    setBackgroundMessageHandler: jest.fn(),
  });

  messaging.AuthorizationStatus = {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  };

  return messaging;
});
