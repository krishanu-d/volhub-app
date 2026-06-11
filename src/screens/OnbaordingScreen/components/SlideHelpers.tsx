import React from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import tw from 'src/tw';

interface DotStepperProps {
  total: number;
  current: number;
}

export const DotStepper: React.FC<DotStepperProps> = ({ total, current }) => (
  <View style={tw`flex-row items-center gap-[6px]`}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          tw`w-[7px] h-[7px] rounded-full bg-border`,
          i === current && tw`w-[22px] bg-primary rounded-full`,
          i < current && tw`bg-primary-dark`,
        ]}
      />
    ))}
  </View>
);

interface StepHeaderProps {
  title: string;
  subtitle?: string;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ title, subtitle }) => (
  <View style={tw`mb-6`}>
    <Text style={tw`font-poppins-semibold text-[22px] text-dark mb-1`}>
      {title}
    </Text>
    {subtitle ? (
      <Text style={tw`font-inter-regular text-[14px] text-muted leading-5`}>
        {subtitle}
      </Text>
    ) : null}
  </View>
);

interface VolFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'decimal-pad';
  multiline?: boolean;
  optional?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words';
}

export const VolField: React.FC<VolFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  optional = false,
  autoCapitalize = 'sentences',
}) => (
  <View style={tw`mb-4`}>
    <View style={tw`flex-row items-center mb-1.5 gap-[6px]`}>
      <Text style={tw`font-inter-medium text-[13px] text-dark`}>{label}</Text>
      {optional && (
        <Text
          style={tw`font-inter-regular text-[11px] text-muted-light bg-[#F3F4F6] px-[6px] py-[1px] rounded-full overflow-hidden`}
        >
          optional
        </Text>
      )}
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder ?? label}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType}
      multiline={multiline}
      autoCapitalize={autoCapitalize}
      style={[
        tw`bg-card border border-border rounded-[10px] px-[14px] py-3 font-inter-regular text-[15px] text-dark`,
        multiline && tw`min-h-[80px]`,
      ]}
    />
  </View>
);

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[
      tw`px-[14px] py-2 rounded-full border border-border bg-card`,
      selected && tw`bg-primary border-primary`,
    ]}
  >
    <Text
      style={[
        tw`font-inter-medium text-[13px] text-muted`,
        selected && tw`text-dark`,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

interface LoadingButtonProps {
  locating: boolean;
  onPress: () => void;
}

export const DetectLocationButton: React.FC<LoadingButtonProps> = ({
  locating,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={tw`flex-row items-center justify-center bg-primary rounded-[10px] py-[14px] mb-5`}
    disabled={locating}
  >
    {locating ? (
      <ActivityIndicator size="small" color="#1A1A1A" />
    ) : (
      <Text style={tw`font-inter-semibold text-[15px] text-dark`}>
        📍 Use my current location
      </Text>
    )}
  </TouchableOpacity>
);
