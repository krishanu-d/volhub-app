// import React from 'react';
// import { ActivityIndicator, Text, View } from 'react-native';

// import tw from 'src/tw';

// import type { OnboardingFormData } from '../types';
// import { DetectLocationButton, StepHeader, VolField } from './SlideHelpers';

// interface Props {
//   placeName: string;
//   latitude: string;
//   longitude: string;
//   onChange: (field: keyof OnboardingFormData, value: string) => void;
//   onDetectLocation: () => void;
//   locating: boolean;
// }

// export const LocationSlide: React.FC<Props> = ({
//   placeName,
//   latitude,
//   longitude,
//   onChange,
//   onDetectLocation,
//   locating,
// }) => (
//   <View style={tw`px-6 pt-6`}>
//     <StepHeader
//       title="Where are you based?"
//       subtitle="Helps match you with opportunities nearby."
//     />

//     <DetectLocationButton locating={locating} onPress={onDetectLocation} />

//     <View style={tw`flex-row items-center mb-5 gap-[10px]`}>
//       <View style={tw`flex-1 h-[1px] bg-border`} />
//       <Text style={tw`font-inter-regular text-[12px] text-muted-light`}>
//         or enter manually
//       </Text>
//       <View style={tw`flex-1 h-[1px] bg-border`} />
//     </View>

//     <VolField
//       label="City / place name"
//       value={placeName}
//       onChangeText={t => onChange('placeName', t)}
//       placeholder="e.g. Bengaluru, Karnataka"
//     />
//     <View style={tw`flex-row`}>
//       <View style={tw`flex-1 mr-2`}>
//         <VolField
//           label="Latitude"
//           value={latitude}
//           onChangeText={t => onChange('latitude', t)}
//           placeholder="12.9716"
//           keyboardType="decimal-pad"
//         />
//       </View>
//       <View style={tw`flex-1 ml-2`}>
//         <VolField
//           label="Longitude"
//           value={longitude}
//           onChangeText={t => onChange('longitude', t)}
//           placeholder="77.5946"
//           keyboardType="decimal-pad"
//         />
//       </View>
//     </View>
//   </View>
// );
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import tw from 'src/tw';

import type { OnboardingFormData } from '../types';
import { DetectLocationButton, StepHeader, VolField } from './SlideHelpers';

interface Props {
  placeName: string;
  latitude: string;
  longitude: string;
  onChange: (field: keyof OnboardingFormData, value: string) => void;
  onDetectLocation: () => void;
  locating: boolean;
}

export const LocationSlide: React.FC<Props> = ({
  placeName,
  latitude,
  longitude,
  onChange,
  onDetectLocation,
  locating,
}) => (
  <View style={tw`px-6 pt-6`}>
    <StepHeader
      title="Where are you based?"
      subtitle="Helps match you with opportunities nearby."
    />

    <DetectLocationButton locating={locating} onPress={onDetectLocation} />

    <View style={tw`flex-row items-center mb-5 gap-[10px]`}>
      <View style={tw`flex-1 h-[1px] bg-border`} />
      <Text style={tw`font-inter-regular text-[12px] text-muted-light`}>
        or enter manually
      </Text>
      <View style={tw`flex-1 h-[1px] bg-border`} />
    </View>

    <VolField
      label="City / place name"
      value={placeName}
      onChangeText={t => onChange('placeName', t)}
      placeholder="e.g. Bengaluru, Karnataka"
    />
    <View style={tw`flex-row`}>
      <View style={tw`flex-1 mr-2`}>
        <VolField
          label="Latitude"
          value={latitude}
          onChangeText={t => onChange('latitude', t)}
          placeholder="12.9716"
          keyboardType="decimal-pad"
        />
      </View>
      <View style={tw`flex-1 ml-2`}>
        <VolField
          label="Longitude"
          value={longitude}
          onChangeText={t => onChange('longitude', t)}
          placeholder="77.5946"
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  </View>
);
