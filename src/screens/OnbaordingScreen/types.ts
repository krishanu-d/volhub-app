export type UserRole = 'ngo' | 'volunteer' | null;

export interface OnboardingFormData {
  role: UserRole;
  name: string;
  email: string;
  contactInfo: string;
  about: string;
  placeName: string;
  latitude: string;
  longitude: string;
  picture: string | null;
  categories: string[];
  receivePushNotifications: boolean;
  receiveEmailNotifications: boolean;
  fcmToken: string;
}
