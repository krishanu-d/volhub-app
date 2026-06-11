import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import tw from 'src/tw';

import { StepHeader } from './SlideHelpers';
import type { UserRole } from '../types';

interface Props {
  selectedRole: UserRole;
  onSelectRole: (role: 'ngo' | 'volunteer') => void;
}

export const RoleSelectionSlide: React.FC<Props> = ({
  selectedRole,
  onSelectRole,
}) => (
  <View style={tw`px-6 pt-6 h-[300px]`}>
    <View style={tw`items-center mb-8`}>
      <View
        style={tw`w-[56px] h-[56px] rounded-[16px] bg-primary items-center justify-center mb-2 shadow-md`}
      >
        <Text style={tw`font-poppins-bold text-[28px] text-dark`}>V</Text>
      </View>
      <Text style={tw`font-poppins-bold text-[26px] text-dark mb-1`}>
        Vol
        <Text style={tw`font-poppins-bold text-[26px] text-primary mb-1`}>
          Hub
        </Text>
      </Text>
      <Text style={tw`font-inter-regular text-[13px] text-muted text-center`}>
        Connecting volunteers with causes that matter
      </Text>
    </View>

    <StepHeader
      title="How will you use VolHub?"
      subtitle="Choose your role to personalise your experience."
    />

    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelectRole('volunteer')}
      style={[
        tw`flex-row items-center bg-card rounded-[14px] border border-border p-4 mb-3`,
        selectedRole === 'volunteer' &&
          tw`border-primary bg-[#FFFBEA] shadow-sm`,
      ]}
    >
      <Text style={tw`text-[32px]`}>🙋</Text>
      <View style={tw`flex-1 ml-4`}>
        <Text
          style={[
            tw`font-inter-semibold text-[16px] text-dark mb-1`,
            selectedRole === 'volunteer' && tw`text-dark`,
          ]}
        >
          Volunteer
        </Text>
        <Text
          style={tw`font-inter-regular text-[13px] text-muted leading-[18px]`}
        >
          Discover opportunities, apply to causes you care about, and track your
          impact.
        </Text>
      </View>
      <View
        style={[
          tw`w-[20px] h-[20px] rounded-full border border-[#D1D5DB] ml-2`,
          selectedRole === 'volunteer' && tw`border-primary bg-primary`,
        ]}
      />
    </TouchableOpacity>

    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelectRole('ngo')}
      style={[
        tw`flex-row items-center bg-card rounded-[14px] border border-border p-4 mb-3`,
        selectedRole === 'ngo' && tw`border-primary bg-[#FFFBEA] shadow-sm`,
      ]}
    >
      <Text style={tw`text-[32px]`}>🏛️</Text>
      <View style={tw`flex-1 ml-4`}>
        <Text
          style={[
            tw`font-inter-semibold text-[16px] text-dark mb-1`,
            selectedRole === 'ngo' && tw`text-dark`,
          ]}
        >
          NGO / Organisation
        </Text>
        <Text
          style={tw`font-inter-regular text-[13px] text-muted leading-[18px]`}
        >
          Post volunteering opportunities, manage applications, and grow your
          community.
        </Text>
      </View>
      <View
        style={[
          tw`w-[20px] h-[20px] rounded-full border border-[#D1D5DB] ml-2`,
          selectedRole === 'ngo' && tw`border-primary bg-primary`,
        ]}
      />
    </TouchableOpacity>
  </View>
);
