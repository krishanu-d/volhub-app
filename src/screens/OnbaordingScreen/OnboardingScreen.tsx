/**
 * OnboardingScreen.tsx
 * VolHub – multi-step onboarding carousel
 *
 * Screens (index):
 *   0 – Role selection  (NGO | Volunteer)
 *   1 – Profile picture + Basic info  (name, email, contactInfo)
 *   2 – About  (mission / bio)
 *   3 – Location  (placeName, lat, lng)
 *   4 – Categories  (focus areas / interests)
 *   5 – Notifications  (push, email)
 *   6 – Review & Submit
 *
 * All form state lives in the parent component (OnboardingScreen).
 * Each slide is a pure presentational component that receives handlers
 * and values as props – no local state except for transient UI concerns
 * like image picker loading.
 */

import React, { useRef, useState, useCallback } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import { useDispatch } from 'react-redux';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import tw from 'src/tw';
import {
  createNotificationChannel,
  getFCMToken,
  requestNotificationPermission,
} from 'src/services/notifiationService';

import { AboutSlide } from './components/AboutSlide';
import { BasicInfoSlide } from './components/BasicInfoSlide';
import { CategorySlide } from './components/CategorySlide';
import { LocationSlide } from './components/LocationSlide';
import { NotificationsSlide } from './components/NotificationsSlide';
import { ReviewSlide } from './components/ReviewSlide';
import { RoleSelectionSlide } from './components/RoleSelectionSlide';
import type { OnboardingFormData } from './types';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { DotStepper } from './components/SlideHelpers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setFcmToken } from 'src/slice/deviceSlice';

const INITIAL_FORM: OnboardingFormData = {
  role: null,
  name: '',
  email: '',
  contactInfo: '',
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

const OnboardingScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(0);
  const [locating, setLocating] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const updateField = useCallback(
    <K extends keyof OnboardingFormData>(
      field: K,
      value: OnboardingFormData[K],
    ) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleTextChange = useCallback(
    (field: keyof OnboardingFormData, value: string) =>
      updateField(field, value as any),
    [updateField],
  );

  const fcmTokenLoadInFlightRef = useRef(false);

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
      if (field === 'receivePushNotifications') {
        if (value) {
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
      }

      updateField(field, value as any);
    },
    [handleLoadFcmToken, updateField],
  );

  const handleSelectRole = useCallback((role: 'ngo' | 'volunteer') => {
    setFormData(prev => ({ ...prev, role, categories: [] }));
  }, []);

  const handleToggleCategory = useCallback((cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
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
    } catch (error) {
      const pickerError = error as { code?: string; message?: string };

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
    setLocating(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        placeName: 'Bengaluru, Karnataka',
        latitude: '12.9716',
        longitude: '77.5946',
      }));
      setLocating(false);
    }, 1500);
  }, []);

  const goToStep = useCallback((step: number) => {
    flatListRef.current?.scrollToIndex({ index: step, animated: true });
    setCurrentStep(step);
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const newIndex = Math.floor(
        (e.nativeEvent.contentOffset.x + SCREEN_WIDTH / 2) / SCREEN_WIDTH,
      );

      if (newIndex >= 0 && newIndex < TOTAL_STEPS && newIndex !== currentStep) {
        setCurrentStep(newIndex);
      }
    },
    [currentStep],
  );

  const canProceed = () => {
    return true;
  };
  // const canProceed = useCallback((): boolean => {
  //   switch (currentStep) {
  //     case 0:
  //       return formData.role !== null;
  //     case 1:
  //       return !!(formData.name && formData.email && formData.contactInfo);
  //     case 2:
  //       return formData.about.trim().length > 10;
  //     case 3:
  //       return !!formData.placeName;
  //     case 4:
  //       return formData.categories.length > 0;
  //     default:
  //       return true;
  //   }
  // }, [currentStep, formData]);

  const handleNext = useCallback(() => {
    if (!canProceed()) {
      Alert.alert('Please complete this step before continuing.');
      return;
    }
    if (currentStep < TOTAL_STEPS - 1) {
      goToStep(currentStep + 1);
    }
  }, [canProceed, currentStep, goToStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const handleSubmit = useCallback(() => {
    console.log('Submit form data:', JSON.stringify(formData, null, 2));
  }, [formData]);

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
                name={formData.name}
                email={formData.email}
                contactInfo={formData.contactInfo}
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
          tw`flex-row items-center justify-between px-5 pb-3`,
          Platform.OS === 'android'
            ? { paddingTop: (StatusBar.currentHeight ?? 24) + 8 }
            : { paddingTop: 52 },
        ]}
      >
        {currentStep > 0 ? (
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={tw`text-[22px] text-dark w-[32px]`}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={tw`w-[32px]`} />
        )}

        <DotStepper total={TOTAL_STEPS} current={currentStep} />

        <Text
          style={tw`font-inter-medium text-[12px] text-muted-light w-[32px] text-right`}
        >
          {currentStep + 1}/{TOTAL_STEPS}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={Array.from({ length: TOTAL_STEPS }, (_, i) => i)}
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
          tw`px-5 pt-3  border-t border-border`,
          { paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
        ]}
      >
        <TouchableOpacity
          onPress={isLastStep ? handleSubmit : handleNext}
          activeOpacity={0.85}
          style={[
            tw`bg-primary rounded-[12px] py-4 items-center shadow-md`,
            nextDisabled && !isLastStep && tw`bg-border`,
          ]}
        >
          <Text style={tw`font-poppins-semibold text-[16px] text-dark`}>
            {isLastStep ? 'Create my account' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
