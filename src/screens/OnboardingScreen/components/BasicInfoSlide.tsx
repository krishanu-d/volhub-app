import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import type { CountryCode } from 'libphonenumber-js';
import tw from 'src/tw';
import type { UserRole } from '../types';
import { StepHeader, VolField } from './SlideHelpers';
import { VolPhoneInput } from 'src/components/VolPhoneInput';
type BasicInfoField = 'firstName' | 'lastName' | 'contactNumber' | 'countryCode';
interface Props {
  role: UserRole;
  picture: string | null;
  firstName: string;
  lastName: string;
  contactNumber: string;
  countryCode: CountryCode;
  onPickImage: () => void;
  onChange: (field: BasicInfoField, value: string | CountryCode) => void;
}

export const BasicInfoSlide: React.FC<Props> = ({
  role,
  picture,
  firstName,
  lastName,
  contactNumber,
  countryCode,
  onPickImage,
  onChange,
}) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
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
                  source={{
                    uri: picture,
                  }}
                  style={tw` w-[96px] h-[96px] rounded-[48px] border-[3px] border-primary `}
                />
              ) : (
                <View
                  style={tw` w-[96px] h-[96px] rounded-[48px] bg-background-dark border border-border border-dashed items-center justify-center `}
                >
                  <Text style={tw` text-[24px] mb-0.5 `}>📷</Text>
                  <Text style={tw` font-inter-medium text-[11px] text-muted-light `}>
                    Add photo
                  </Text>
                </View>
              )}

              <View
                style={tw` absolute bottom-[2px] right-[2px] w-[26px] h-[26px] rounded-[13px] bg-primary items-center justify-center border-[2px] border-background`}
              >
                <Text style={tw`text-[11px]`}>✏️</Text>
              </View>
            </TouchableOpacity>

            <Text style={tw` font-inter-regular text-[12px] text-muted-light mt-2 `}>
              Tap to {picture ? 'change' : 'upload'} profile photo
            </Text>
          </View>
        </>
      )}

      <VolField
        label={role === 'ngo' ? 'Organisation name' : 'First name'}
        value={firstName}
        onChangeText={text => onChange('firstName', text)}
        placeholder={role === 'ngo' ? 'e.g. Green Earth Foundation' : 'e.g. Priya'}
        autoCapitalize="words"
      />

      {role !== 'ngo' && (
        <VolField
          label="Last name"
          value={lastName}
          onChangeText={text => onChange('lastName', text)}
          placeholder="e.g. Sharma"
          autoCapitalize="words"
        />
      )}

      <VolPhoneInput
        countryCode={countryCode}
        value={contactNumber}
        onChangeCountry={(code: CountryCode) => onChange('countryCode', code)}
        onChangeText={(phone: string) => onChange('contactNumber', phone)}
      />
    </View>
  );
};
