import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import tw from 'src/tw';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface AppButtonProps {
  label?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  buttonState?: ButtonState;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  iconOnly?: React.ReactNode;
  disabled?: boolean;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
}

const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  buttonState = 'idle',
  iconLeft,
  iconRight,
  iconOnly,
  disabled = false,
  loadingLabel = 'Loading...',
  successLabel = 'Done!',
  errorLabel = 'Failed',
}) => {
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslate = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const loaderTranslate = useRef(new Animated.Value(12)).current;
  const bgColor = useRef(new Animated.Value(0)).current;

  const isLoading = buttonState === 'loading';
  const isSuccess = buttonState === 'success';
  const isError = buttonState === 'error';
  const isActive = isLoading || isSuccess || isError;

  useEffect(() => {
    if (isLoading) {
      // text slides up and fades out
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: -10,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(loaderOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(loaderTranslate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // reset back to idle
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(loaderOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(loaderTranslate, {
          toValue: 12,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading]);

  const getBackgroundStyle = () => {
    if (isSuccess) return tw`bg-success`;
    if (isError) return tw`bg-error`;
    switch (variant) {
      case 'primary':
        return tw`bg-primary`;
      case 'secondary':
        return tw`bg-transparent border border-border`;
      case 'ghost':
        return tw`bg-transparent`;
      case 'danger':
        return tw`bg-error`;
    }
  };

  const getTextColor = () => {
    if (isSuccess || isError) return tw`text-white`;
    switch (variant) {
      case 'primary':
        return tw`text-dark`;
      case 'secondary':
        return tw`text-dark`;
      case 'ghost':
        return tw`text-dark`;
      case 'danger':
        return tw`text-white`;
    }
  };

  const getSpinnerColor = () => {
    if (variant === 'primary') return '#1A1A1A';
    return '#1A1A1A';
  };

  const getLoaderLabel = () => {
    if (isSuccess) return successLabel;
    if (isError) return errorLabel;
    return loadingLabel;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isActive}
      activeOpacity={0.85}
      style={[
        tw`w-full h-[52px] rounded-full flex-row items-center justify-center px-6 overflow-hidden`,
        getBackgroundStyle(),
        (disabled || isActive) && tw`opacity-60`,
        styles.transition,
      ]}
    >
      {/* Main content — slides up when loading */}
      <Animated.View
        style={[
          styles.row,
          { opacity: textOpacity, transform: [{ translateY: textTranslate }] },
        ]}
      >
        {iconOnly ? (
          iconOnly
        ) : (
          <>
            {iconLeft && <View style={tw`mr-2`}>{iconLeft}</View>}
            {label && (
              <Text
                style={[tw`font-poppins-semibold text-base`, getTextColor()]}
              >
                {label}
              </Text>
            )}
            {iconRight && <View style={tw`ml-auto`}>{iconRight}</View>}
          </>
        )}
      </Animated.View>

      {/* Loader — slides up into view */}
      <Animated.View
        style={[
          styles.loaderRow,
          {
            opacity: loaderOpacity,
            transform: [{ translateY: loaderTranslate }],
          },
        ]}
      >
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={getSpinnerColor()}
            style={tw`mr-2`}
          />
        )}
        {isSuccess && <Text style={tw`text-base mr-2`}>✓</Text>}
        {isError && <Text style={tw`text-base mr-2`}>✕</Text>}
        <Text style={[tw`font-poppins-semibold text-base`, getTextColor()]}>
          {getLoaderLabel()}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
  },
  transition: {
    // background color transition handled via state class changes
  },
});

export default AppButton;
