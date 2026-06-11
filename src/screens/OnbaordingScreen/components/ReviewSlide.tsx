import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import tw from 'src/tw';

import type { OnboardingFormData } from '../types';
import { StepHeader } from './SlideHelpers';

interface Props {
  data: OnboardingFormData;
  onGoTo: (step: number) => void;
}

export const ReviewSlide: React.FC<Props> = ({ data, onGoTo }) => {
  const rows = [
    {
      label: 'Role',
      value: data.role === 'ngo' ? 'NGO / Organisation' : 'Volunteer',
      step: 0,
    },
    {
      label: data.role === 'ngo' ? 'Org name' : 'Name',
      value: data.name || '—',
      step: 1,
    },
    { label: 'Email', value: data.email || '—', step: 1 },
    { label: 'Contact', value: data.contactInfo || '—', step: 1 },
    {
      label: data.role === 'ngo' ? 'Mission' : 'Bio',
      value: data.about
        ? data.about.slice(0, 60) + (data.about.length > 60 ? '…' : '')
        : '—',
      step: 2,
    },
    { label: 'Location', value: data.placeName || '—', step: 3 },
    {
      label: 'Categories',
      value: data.categories.length ? data.categories.join(', ') : '—',
      step: 4,
    },
    {
      label: 'Push notifs',
      value: data.receivePushNotifications ? 'On' : 'Off',
      step: 5,
    },
    {
      label: 'Email notifs',
      value: data.receiveEmailNotifications ? 'On' : 'Off',
      step: 5,
    },
  ];

  return (
    <View style={tw`px-6 pt-6`}>
      <StepHeader
        title="Almost there! 🎉"
        subtitle="Review your details before creating your account."
      />

      {data.picture && (
        <View style={tw`items-center mb-5`}>
          <Image
            source={{ uri: data.picture }}
            style={tw`w-[80px] h-[80px] rounded-[40px] border-[3px] border-primary`}
          />
        </View>
      )}

      {rows.map(row => (
        <View
          key={row.label}
          style={tw`flex-row items-center py-3 border-b border-[#F3F4F6]`}
        >
          <View style={tw`flex-1`}>
            <Text
              style={tw`font-inter-regular text-[12px] text-muted-light mb-0.5`}
            >
              {row.label}
            </Text>
            <Text
              style={tw`font-inter-medium text-[14px] text-dark`}
              numberOfLines={2}
            >
              {row.value}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onGoTo(row.step)}
            style={tw`px-3 py-1.5 rounded-[6px] bg-[#F3F4F6]`}
          >
            <Text style={tw`font-inter-medium text-[13px] text-muted`}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};
