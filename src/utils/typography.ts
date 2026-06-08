import tw from 'src/tw';

export const typography = {
  h1: tw`font-poppins-bold text-3xl text-dark`,
  h2: tw`font-poppins-semibold text-2xl text-dark`,
  h3: tw`font-poppins-semibold text-xl text-dark`,
  body: tw`font-inter-regular text-base text-dark`,
  bodyMuted: tw`font-inter-regular text-base text-muted`,
  label: tw`font-inter-medium text-sm text-dark`,
  caption: tw`font-inter-regular text-xs text-muted`,
  cta: tw`font-poppins-semibold text-base text-dark`,
};

// Usage: <Text style={typography.h2}>Discover Campaigns</Text>
