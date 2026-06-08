import React from 'react';

const AuthScreen = React.lazy(() => import('src/screens/AuthScreen'));
const OnboardingScreen = React.lazy(
  () => import('src/screens/OnbaordingScreen'),
);
const HomeScreen = React.lazy(() => import('src/screens/HomeScreen'));

export const Routes = {
  Auth: AuthScreen,
  Onboarding: OnboardingScreen,
  Home: HomeScreen,
};

export const RouteNames = {
  Auth: 'Auth',
  Onboarding: 'Onboarding',
  Home: 'Home',
};
