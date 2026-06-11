import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Text, TouchableOpacity, View } from 'react-native';

import tw from 'src/tw';

import type { OnboardingFormData, UserRole } from '../types';
import { StepHeader, VolField } from './SlideHelpers';

interface Props {
  role: UserRole;
  picture: string | null;
  name: string;
  email: string;
  contactInfo: string;
  onPickImage: () => void;
  onChange: (field: keyof OnboardingFormData, value: string) => void;
}

export const BasicInfoSlide: React.FC<Props> = ({
  role,
  picture,
  name,
  email,
  contactInfo,
  onPickImage,
  onChange,
}) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <View style={tw`px-6 pt-6`}>
      {!keyboardVisible && (
        <>
          <StepHeader
            title={role === 'ngo' ? 'Your organisation' : 'About you'}
            subtitle="Start with a photo — it builds trust with the community."
          />

          <View style={tw`items-center mb-6`}>
            <TouchableOpacity
              onPress={onPickImage}
              activeOpacity={0.8}
              style={tw`relative`}
            >
              {picture ? (
                <Image
                  source={{ uri: picture }}
                  style={tw`w-[96px] h-[96px] rounded-[48px] border-[3px] border-primary`}
                />
              ) : (
                <View
                  style={tw`w-[96px] h-[96px] rounded-[48px] bg-background-dark border border-border border-dashed items-center justify-center`}
                >
                  <Text style={tw`text-[24px] mb-0.5`}>📷</Text>
                  <Text
                    style={tw`font-inter-medium text-[11px] text-muted-light`}
                  >
                    Add photo
                  </Text>
                </View>
              )}
              <View
                style={tw`absolute bottom-[2px] right-[2px] w-[26px] h-[26px] rounded-[13px] bg-primary items-center justify-center border-[2px] border-background`}
              >
                <Text style={tw`text-[11px]`}>✏️</Text>
              </View>
            </TouchableOpacity>
            <Text
              style={tw`font-inter-regular text-[12px] text-muted-light mt-2`}
            >
              Tap to {picture ? 'change' : 'upload'} profile photo
            </Text>
          </View>
        </>
      )}

      <VolField
        label={role === 'ngo' ? 'Organisation name' : 'Full name'}
        value={name}
        onChangeText={t => onChange('name', t)}
        placeholder={
          role === 'ngo' ? 'e.g. Green Earth Foundation' : 'e.g. Priya Sharma'
        }
        autoCapitalize="words"
      />
      <VolField
        label="Email address"
        value={email}
        onChangeText={t => onChange('email', t)}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <VolField
        label="Contact number"
        value={contactInfo}
        onChangeText={t => onChange('contactInfo', t)}
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
      />
    </View>
  );
};
