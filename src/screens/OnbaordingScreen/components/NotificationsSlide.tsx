import React from 'react';
import { Switch, Text, View } from 'react-native';

import tw from 'src/tw';

import type { OnboardingFormData } from '../types';
import { StepHeader } from './SlideHelpers';

interface Props {
  receivePushNotifications: boolean;
  receiveEmailNotifications: boolean;
  onChange: (field: keyof OnboardingFormData, value: boolean) => void;
}

export const NotificationsSlide: React.FC<Props> = ({
  receivePushNotifications,
  receiveEmailNotifications,
  onChange,
}) => (
  <View style={tw`px-6 pt-6`}>
    <StepHeader
      title="Stay in the loop"
      subtitle="Choose how you'd like to hear about new opportunities and updates."
    />

    <View
      style={tw`flex-row items-center bg-card rounded-[12px] border border-border p-4`}
    >
      <View style={tw`flex-1 mr-4`}>
        <Text style={tw`font-inter-semibold text-[15px] text-dark mb-1`}>
          Push notifications
        </Text>
        <Text
          style={tw`font-inter-regular text-[13px] text-muted leading-[18px]`}
        >
          Instant alerts on your phone for new matches, messages, and
          application updates.
        </Text>
      </View>
      <Switch
        value={receivePushNotifications}
        onValueChange={v => onChange('receivePushNotifications', v)}
        trackColor={{ false: '#E5E7EB', true: '#F5C518' }}
        thumbColor={receivePushNotifications ? '#1A1A1A' : '#9CA3AF'}
      />
    </View>

    <View
      style={tw`flex-row items-center bg-card rounded-[12px] border border-border p-4 mt-3`}
    >
      <View style={tw`flex-1 mr-4`}>
        <Text style={tw`font-inter-semibold text-[15px] text-dark mb-1`}>
          Email updates
        </Text>
        <Text
          style={tw`font-inter-regular text-[13px] text-muted leading-[18px]`}
        >
          Weekly digests, confirmation emails, and important account notices.
        </Text>
      </View>
      <Switch
        value={receiveEmailNotifications}
        onValueChange={v => onChange('receiveEmailNotifications', v)}
        trackColor={{ false: '#E5E7EB', true: '#F5C518' }}
        thumbColor={receiveEmailNotifications ? '#1A1A1A' : '#9CA3AF'}
      />
    </View>

    <Text
      style={tw`font-inter-regular text-[12px] text-muted-light text-center mt-4`}
    >
      You can change these anytime in Settings - Notifications.
    </Text>
  </View>
);
