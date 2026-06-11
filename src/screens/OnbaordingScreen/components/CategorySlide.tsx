import React from 'react';
import { Text, View } from 'react-native';

import tw from 'src/tw';

import type { UserRole } from '../types';
import { CategoryChip, StepHeader } from './SlideHelpers';
import { OPPORTUNITY_CATEGORIES } from 'src/utils/constant';

interface Props {
  role: UserRole;
  categories: string[];
  onToggle: (cat: string) => void;
}

export const CategorySlide: React.FC<Props> = ({
  role,
  categories,
  onToggle,
}) => (
  <View style={tw`px-6 pt-6`}>
    <StepHeader
      title={role === 'ngo' ? 'Focus areas' : 'Your interests'}
      subtitle={
        role === 'ngo'
          ? 'Select the causes your organisation works on. Volunteers filter by these.'
          : 'Pick the areas you love to contribute to. You can change this later.'
      }
    />
    <View style={tw`flex-row flex-wrap mb-3 gap-[8px]`}>
      {Object.values(OPPORTUNITY_CATEGORIES).map(cat => (
        <CategoryChip
          key={cat}
          label={cat}
          selected={categories.includes(cat)}
          onPress={() => onToggle(cat)}
        />
      ))}
    </View>
    <Text
      style={tw`font-inter-regular text-[13px] text-muted-light text-center mt-1`}
    >
      {categories.length} selected
      {categories.length === 0 ? ' — pick at least one' : ''}
    </Text>
  </View>
);
