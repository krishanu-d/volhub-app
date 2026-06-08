import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from './routes';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={Routes.Auth} />
        <Stack.Screen name="Onboarding" component={Routes.Onboarding} />
        <Stack.Screen name="Home" component={Routes.Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
