import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation, {
  type GeolocationResponse,
} from '@react-native-community/geolocation';
import { StackActions, useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import {
  check,
  checkMultiple,
  openSettings,
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,
  type Permission,
} from 'react-native-permissions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import type { CountryCode } from 'libphonenumber-js';

import tw from 'src/tw';
import AppButton from 'src/components/AppButton';
import { RouteNames } from 'src/navigation/routes';
import { patchRequest } from 'src/services/apiService';
import { setFcmToken } from 'src/slice/deviceSlice';
import { setAuthToken } from 'src/slice/authSlice';
import {
  createNotificationChannel,
  getFCMToken,
  requestNotificationPermission,
} from 'src/services/notifiationService';
import { ENDPOINTS } from 'src/utils/constant';
import { getUser, setUser } from 'src/utils/storage';

import { AboutSlide } from './components/AboutSlide';
import { BasicInfoSlide } from './components/BasicInfoSlide';
import { CategorySlide } from './components/CategorySlide';
import { LocationSlide } from './components/LocationSlide';
import { NotificationsSlide } from './components/NotificationsSlide';
import { ReviewSlide } from './components/ReviewSlide';
import { RoleSelectionSlide } from './components/RoleSelectionSlide';
import { DotStepper } from './components/SlideHelpers';
import type { OnboardingFormData } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INITIAL_FORM: OnboardingFormData = {
  role: null,
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  countryCode: 'IN' as CountryCode,
  about: '',
  placeName: '',
  latitude: '',
  longitude: '',
  picture: null,
  categories: [],
  receivePushNotifications: false,
  receiveEmailNotifications: true,
  fcmToken: '',
};

const TOTAL_STEPS = 7;

interface CompleteProfileResponse {
  accessToken: string;
  user: object;
}

interface StoredUser {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  picture?: string | null;
}

type CompleteProfilePayload = {
  role: 'ngo' | 'volunteer';
  firstName: string;
  lastName?: string;
  placeName: string;
  latitude?: number;
  longitude?: number;
  phoneNumber: string;
  about?: string;
  picture?: string;
  categories: string[];
  receivePushNotifications: boolean;
  receiveEmailNotifications: boolean;
  fcmToken?: string;
};

const isRemoteUrl = (value: string | null) =>
  !!value && /^https?:\/\//i.test(value);

const parseCoordinate = (value: string): number | undefined => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const getInitialFormData = (): OnboardingFormData => {
  const user = getUser() as StoredUser | null;

  return {
    ...INITIAL_FORM,
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    picture: user?.picture ?? null,
  };
};

const getStepValidationMessage = (
  step: number,
  data: OnboardingFormData,
): string | null => {
  switch (step) {
    case 0:
      return data.role ? null : 'Choose whether you are joining as an NGO or volunteer.';

    case 1:
      if (!data.firstName.trim()) {
        return data.role === 'ngo'
          ? 'Enter your organisation name.'
          : 'Enter your first name.';
      }

      return data.contactNumber.trim() ? null : 'Enter your contact number.';

    case 3:
      if (!data.placeName.trim()) {
        return 'Enter your city or place name.';
      }

      if (
        data.latitude.trim() &&
        parseCoordinate(data.latitude) === undefined
      ) {
        return 'Enter a valid latitude.';
      }

      if (
        data.longitude.trim() &&
        parseCoordinate(data.longitude) === undefined
      ) {
        return 'Enter a valid longitude.';
      }

      return null;

    case 4:
      return data.categories.length
        ? null
        : 'Choose at least one category.';

    default:
      return null;
  }
};

const buildCompleteProfilePayload = (
  data: OnboardingFormData,
): CompleteProfilePayload | null => {
  if (!data.role) {
    return null;
  }

  const latitude = parseCoordinate(data.latitude);
  const longitude = parseCoordinate(data.longitude);
  const payload: CompleteProfilePayload = {
    role: data.role,
    firstName: data.firstName.trim(),
    placeName: data.placeName.trim(),
    phoneNumber: data.contactNumber.trim(),
    categories: data.categories,
    receivePushNotifications: data.receivePushNotifications,
    receiveEmailNotifications: data.receiveEmailNotifications,
  };

  if (data.lastName.trim()) {
    payload.lastName = data.lastName.trim();
  }

  if (data.about.trim()) {
    payload.about = data.about.trim();
  }

  if (latitude !== undefined) {
    payload.latitude = latitude;
  }

  if (longitude !== undefined) {
    payload.longitude = longitude;
  }

  const picture = data.picture;

  if (isRemoteUrl(picture) && picture) {
    payload.picture = picture;
  }

  if (data.fcmToken.trim()) {
    payload.fcmToken = data.fcmToken.trim();
  }

  return payload;
};

type LocationPermissionResult =
  | 'precise'
  | 'approximate'
  | 'denied'
  | 'blocked'
  | 'unavailable';

const getAndroidPermissionResult = (
  fineResult: string,
  coarseResult: string,
): LocationPermissionResult => {
  if (fineResult === RESULTS.GRANTED) {
    return 'precise';
  }

  if (coarseResult === RESULTS.GRANTED) {
    return 'approximate';
  }

  if (fineResult === RESULTS.BLOCKED || coarseResult === RESULTS.BLOCKED) {
    return 'blocked';
  }

  if (fineResult === RESULTS.UNAVAILABLE && coarseResult === RESULTS.UNAVAILABLE) {
    return 'unavailable';
  }

  return 'denied';
};

const ensureLocationPermission = async (): Promise<LocationPermissionResult> => {
  if (Platform.OS === 'ios') {
    const permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    const currentStatus = await check(permission);

    if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
      return 'precise';
    }

    if (currentStatus === RESULTS.BLOCKED) {
      return 'blocked';
    }

    if (currentStatus === RESULTS.UNAVAILABLE) {
      return 'unavailable';
    }

    const requestedStatus = await request(permission);

    if (requestedStatus === RESULTS.GRANTED || requestedStatus === RESULTS.LIMITED) {
      return 'precise';
    }

    if (requestedStatus === RESULTS.BLOCKED) {
      return 'blocked';
    }

    if (requestedStatus === RESULTS.UNAVAILABLE) {
      return 'unavailable';
    }

    return 'denied';
  }

  const permissions: Permission[] = [
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  ];

  const currentStatuses = await checkMultiple(permissions);

  const currentPermission = getAndroidPermissionResult(
    currentStatuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION],
    currentStatuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION],
  );

  if (
    currentPermission === 'precise' ||
    currentPermission === 'approximate' ||
    currentPermission === 'blocked' ||
    currentPermission === 'unavailable'
  ) {
    return currentPermission;
  }

  /*
   * On Android 12+, coarse and fine location should be
   * requested together so that the user can choose between
   * approximate and precise location.
   */
  const requestedStatuses = await requestMultiple(permissions);

  return getAndroidPermissionResult(
    requestedStatuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION],
    requestedStatuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION],
  );
};

const getCurrentLocation = (enableHighAccuracy: boolean): Promise<GeolocationResponse> =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy,
      timeout: 15_000,
      maximumAge: 10_000,
    });
  });

const OnboardingScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [formData, setFormData] = useState<OnboardingFormData>(
    getInitialFormData,
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [locating, setLocating] = useState(false);

  const [buttonState, setButtonState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const flatListRef = useRef<FlatList<number>>(null);
  const fcmTokenLoadInFlightRef = useRef(false);
  const locationRequestInFlightRef = useRef(false);

  const updateField = useCallback(
    <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => {
      setFormData(previous => ({
        ...previous,
        [field]: value,
      }));
    },
    [],
  );

  const handleTextChange = useCallback(
    (field: keyof OnboardingFormData, value: string) => {
      updateField(field, value as OnboardingFormData[typeof field]);
    },
    [updateField],
  );

  const handleLoadFcmToken = useCallback(async () => {
    if (fcmTokenLoadInFlightRef.current) {
      return;
    }

    fcmTokenLoadInFlightRef.current = true;

    try {
      await createNotificationChannel();

      const token = await getFCMToken();

      if (!token) {
        return;
      }

      updateField('fcmToken', token);
      dispatch(setFcmToken(token));
    } finally {
      fcmTokenLoadInFlightRef.current = false;
    }
  }, [dispatch, updateField]);

  const handleBoolChange = useCallback(
    async (field: keyof OnboardingFormData, value: boolean) => {
      if (field === 'receivePushNotifications' && value) {
        const permitted = await requestNotificationPermission();

        if (!permitted) {
          Alert.alert(
            'Notification permission denied',
            'Enable notifications in Settings to receive updates.',
          );

          updateField('receivePushNotifications', false);

          return;
        }

        await handleLoadFcmToken();
      }

      updateField(field, value as OnboardingFormData[typeof field]);
    },
    [handleLoadFcmToken, updateField],
  );

  const handleSelectRole = useCallback((role: 'ngo' | 'volunteer') => {
    setFormData(previous => ({
      ...previous,
      role,
      categories: [],
    }));
  }, []);

  const handleToggleCategory = useCallback((category: string) => {
    setFormData(previous => ({
      ...previous,
      categories: previous.categories.includes(category)
        ? previous.categories.filter(item => item !== category)
        : [...previous.categories, category],
    }));
  }, []);

  const handlePickImage = useCallback(async () => {
    try {
      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: true,
        width: 512,
        height: 512,
        cropperCircleOverlay: true,
        compressImageQuality: 0.85,
        includeExif: false,
      });

      updateField('picture', image.path);
    } catch (error: unknown) {
      const pickerError = error as {
        code?: string;
        message?: string;
      };

      if (pickerError.code === 'E_PICKER_CANCELLED') {
        return;
      }

      Alert.alert(
        'Unable to pick photo',
        pickerError.message ?? 'Please try selecting a different image.',
      );
    }
  }, [updateField]);

  const handleDetectLocation = useCallback(async () => {
    if (locationRequestInFlightRef.current) {
      return;
    }

    locationRequestInFlightRef.current = true;
    setLocating(true);

    try {
      const permission = await ensureLocationPermission();

      if (permission === 'blocked') {
        Alert.alert(
          'Location permission required',
          'Location permission is disabled for VolHub. Enable it from the app settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open settings',
              onPress: () => {
                void openSettings('application').catch(() => {
                  Alert.alert(
                    'Unable to open settings',
                    'Please open the device settings and enable location permission for VolHub.',
                  );
                });
              },
            },
          ],
        );

        return;
      }

      if (permission === 'denied') {
        Alert.alert(
          'Location permission denied',
          'Allow location access to automatically detect your location.',
        );

        return;
      }

      if (permission === 'unavailable') {
        Alert.alert(
          'Location unavailable',
          'Location services are not available on this device.',
        );

        return;
      }

      const position = await getCurrentLocation(permission === 'precise');

      const { latitude, longitude } = position.coords;

      setFormData(previous => ({
        ...previous,

        /*
         * GPS only returns coordinates. Until reverse
         * geocoding is added, retain an existing place name
         * or display the coordinates as the location.
         */
        placeName:
          previous.placeName.trim() || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,

        latitude: latitude.toString(),
        longitude: longitude.toString(),
      }));

    } catch (error: unknown) {
      const locationError = error as {
        code?: number;
        message?: string;
      };

      switch (locationError.code) {
        case 1:
          Alert.alert(
            'Location permission denied',
            'VolHub does not have permission to access your location.',
          );
          break;

        case 2:
          Alert.alert(
            'Location is turned off',
            'Turn on Location Services or GPS and try again.',
          );
          break;

        case 3:
          Alert.alert(
            'Location request timed out',
            'We could not detect your location. Move to an open area and try again.',
          );
          break;

        default:
          Alert.alert(
            'Unable to detect location',
            locationError.message ??
              'Something went wrong while detecting your location.',
          );
      }
    } finally {
      locationRequestInFlightRef.current = false;
      setLocating(false);
    }
  }, []);

  const goToStep = useCallback((step: number) => {
    flatListRef.current?.scrollToIndex({
      index: step,
      animated: true,
    });

    setCurrentStep(step);
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: {
      nativeEvent: {
        contentOffset: {
          x: number;
        };
      };
    }) => {
      const newIndex = Math.floor(
        (event.nativeEvent.contentOffset.x + SCREEN_WIDTH / 2) / SCREEN_WIDTH,
      );

      if (newIndex >= 0 && newIndex < TOTAL_STEPS && newIndex !== currentStep) {
        setCurrentStep(newIndex);
      }
    },
    [currentStep],
  );

  const canProceed = useCallback((): boolean => {
    return getStepValidationMessage(currentStep, formData) === null;
  }, [currentStep, formData]);

  const handleNext = useCallback(() => {
    const validationMessage = getStepValidationMessage(currentStep, formData);

    if (validationMessage) {
      Alert.alert('Please complete this step', validationMessage);

      return;
    }

    if (currentStep < TOTAL_STEPS - 1) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, formData, goToStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleSubmit = useCallback(async () => {
    const validationMessage = Array.from(
      { length: TOTAL_STEPS },
      (_, step) => getStepValidationMessage(step, formData),
    ).find(Boolean);

    if (validationMessage) {
      Alert.alert('Please review your details', validationMessage);

      return;
    }

    const payload = buildCompleteProfilePayload(formData);

    if (!payload) {
      Alert.alert('Please review your details', 'Choose your account type.');

      return;
    }

    setButtonState('loading');

    const response = await patchRequest<CompleteProfileResponse>(
      ENDPOINTS.COMPLETE_PROFILE,
      payload,
    );

    if (!response.success || !response.data?.accessToken) {
      setButtonState('error');
      Alert.alert(
        'Unable to create account',
        response.error ?? 'Please check your details and try again.',
      );

      return;
    }

    dispatch(setAuthToken(response.data.accessToken));
    setUser(response.data.user);
    setButtonState('success');
    navigation.dispatch(StackActions.replace(RouteNames.Home));
  }, [dispatch, formData, navigation]);

  const renderSlide = useCallback(
    ({ item }: { item: number }) => {
      const content = (() => {
        switch (item) {
          case 0:
            return (
              <RoleSelectionSlide
                selectedRole={formData.role}
                onSelectRole={handleSelectRole}
              />
            );

          case 1:
            return (
              <BasicInfoSlide
                role={formData.role}
                picture={formData.picture}
                firstName={formData.firstName}
                lastName={formData.lastName}
                contactNumber={formData.contactNumber}
                countryCode={formData.countryCode}
                onPickImage={handlePickImage}
                onChange={handleTextChange}
              />
            );

          case 2:
            return (
              <AboutSlide
                role={formData.role}
                about={formData.about}
                onChange={handleTextChange}
              />
            );

          case 3:
            return (
              <LocationSlide
                placeName={formData.placeName}
                latitude={formData.latitude}
                longitude={formData.longitude}
                onChange={handleTextChange}
                onDetectLocation={handleDetectLocation}
                locating={locating}
              />
            );

          case 4:
            return (
              <CategorySlide
                role={formData.role}
                categories={formData.categories}
                onToggle={handleToggleCategory}
              />
            );

          case 5:
            return (
              <NotificationsSlide
                receivePushNotifications={formData.receivePushNotifications}
                receiveEmailNotifications={formData.receiveEmailNotifications}
                onChange={handleBoolChange}
              />
            );

          case 6:
            return <ReviewSlide data={formData} onGoTo={goToStep} />;

          default:
            return null;
        }
      })();

      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: SCREEN_WIDTH }}
        >
          <ScrollView
            contentContainerStyle={tw`pb-6`}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {content}
          </ScrollView>
        </KeyboardAvoidingView>
      );
    },
    [
      formData,
      goToStep,
      handleBoolChange,
      handleDetectLocation,
      handlePickImage,
      handleSelectRole,
      handleTextChange,
      handleToggleCategory,
      locating,
    ],
  );

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  const nextDisabled = !canProceed();

  return (
    <SafeAreaView style={tw`flex-1 bg-background`}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View
        style={[
          tw`
            flex-row items-center justify-between
            px-5 pb-3
          `,
          Platform.OS === 'android'
            ? {
                paddingTop: (StatusBar.currentHeight ?? 24) + 8,
              }
            : {
                paddingTop: 52,
              },
        ]}
      >
        {currentStep > 0 ? (
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{
              top: 12,
              bottom: 12,
              left: 12,
              right: 12,
            }}
          >
            <Text
              style={tw`
                w-[32px] text-[22px] text-dark
              `}
            >
              ←
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={tw`w-[32px]`} />
        )}

        <DotStepper total={TOTAL_STEPS} current={currentStep} />

        <Text
          style={tw`
            w-[32px] text-right
            font-inter-medium text-[12px]
            text-muted-light
          `}
        >
          {currentStep + 1}/{TOTAL_STEPS}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={Array.from({ length: TOTAL_STEPS }, (_, index) => index)}
        renderItem={renderSlide}
        keyExtractor={item => String(item)}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={tw`flex-1`}
      />

      <View
        style={[
          tw`
            px-5 pt-3 border-t border-border
          `,
          {
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
          },
        ]}
      >
        <AppButton
          buttonState={buttonState}
          label={isLastStep ? 'Create my account' : 'Continue'}
          onPress={isLastStep ? handleSubmit : handleNext}
          disabled={nextDisabled}
        />
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
