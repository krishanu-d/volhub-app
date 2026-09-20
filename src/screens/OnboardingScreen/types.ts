import { CountryCode } from 'libphonenumber-js';

export type UserRole = 'ngo' | 'volunteer' | null;

export interface OnboardingFormData {
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  countryCode: CountryCode;
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
