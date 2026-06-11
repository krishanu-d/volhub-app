import React, { useEffect, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';

import tw from 'src/tw';

import type { OnboardingFormData, UserRole } from '../types';
import { StepHeader } from './SlideHelpers';

interface Props {
  role: UserRole;
  about: string;
  onChange: (field: keyof OnboardingFormData, value: string) => void;
}

export const AboutSlide: React.FC<Props> = ({ role, about, onChange }) => {
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
      <StepHeader
        title={role === 'ngo' ? 'Your mission' : 'A bit about you'}
        subtitle={
          role === 'ngo'
            ? 'Tell volunteers what drives your organisation and the change you want to create.'
            : 'Share what motivates you to volunteer. Organisations will read this when you apply.'
        }
      />
      <View style={tw`mb-2`}>
        <Text style={tw`font-inter-medium text-[13px] text-dark`}>
          {role === 'ngo' ? 'Mission & description' : 'Short bio'}
        </Text>
      </View>
      <TextInput
        value={about}
        onChangeText={t => onChange('about', t)}
        placeholder={
          role === 'ngo'
            ? 'We work to restore urban forests and educate communities on sustainability…'
            : "I'm passionate about education and have been teaching underprivileged kids for 3 years…"
        }
        placeholderTextColor="#9CA3AF"
        multiline
        autoCapitalize="sentences"
        style={tw`bg-card border border-border rounded-[10px] px-[14px] pt-3 pb-3 font-inter-regular text-[15px] text-dark min-h-[160px]`}
      />
      <Text
        style={tw`font-inter-regular text-[12px] text-muted-light text-right mt-1`}
      >
        {about.length} / 500
      </Text>
    </View>
  );
};
