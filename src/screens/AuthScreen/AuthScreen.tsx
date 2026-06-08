import { View, Text, Dimensions } from 'react-native';
import React from 'react';
import { typography } from 'src/utils/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from 'src/assets/images/images';
import tw from 'src/tw';
import AppImages from 'src/components/AppImage';
import { StackActions, useNavigation } from '@react-navigation/native';
import AppButton from 'src/components/AppButton';
import { RouteNames, Routes } from 'src/navigation/routes';
import { signInWithGoogle } from 'src/services/googleAuth';

const { width, height } = Dimensions.get('window');

const AuthScreen = () => {
  const navigation = useNavigation();

  const getStarted = async () => {
    // navigation.navigate(Routes.Onboarding);
    const { isNewUser, success, access_token, error } =
      await signInWithGoogle();

    if (success) {
      // access_token is already stored in MMKV automatically
      //if new user, you can navigate to profile setup flow
      if (isNewUser) {
        navigation.dispatch(StackActions.replace(RouteNames.Onboarding));
      }
      navigation.dispatch(StackActions.replace(RouteNames.Home));
    } else {
      // show error to user
      console.error(error);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <AppImages
        source={Images.BaseScreen}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          width,
          height,
        }}
      />
      <View style={tw`flex-1 justify-center items-center z-10 `}>
        <View style={tw`justify-center items-center flex-2`}>
          <Images.LogoWhiteOutline
            width={width * 0.6}
            height={150}
            preserveAspectRatio="xMidYMid meet"
          />
        </View>
        <View
          style={tw`flex-1.2 bg-surface w-full p-4 rounded-t-2xl justify-between`}
        >
          <View>
            <Text
              style={[typography.h2, tw`text-dark text-left `]}
            >{`Connect with causes that matter`}</Text>
            <Text
              style={[typography.body, tw`text-dark text-left mt-3`]}
            >{`Discover and support impactful campaigns in your community. Join us in making a difference today!`}</Text>
          </View>

          <View style={tw``}>
            <AppButton label="Continue with Google" onPress={getStarted} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AuthScreen;
