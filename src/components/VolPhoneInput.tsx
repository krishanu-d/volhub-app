import React, { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';
import { CountryPicker } from 'react-native-country-codes-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import tw from 'src/tw';

interface CountryPickerItem {
  name: Record<string, string>;
  dial_code: string;
  code: string;
  flag: string;
}

export interface VolPhoneInputProps {
  label?: string;
  countryCode: CountryCode;
  value: string;
  onChangeCountry: (countryCode: CountryCode) => void;
  onChangeText: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
}

const SUPPORTED_COUNTRIES = getCountries() as CountryCode[];

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const getFlagEmoji = (countryCode: CountryCode) =>
  countryCode
    .toUpperCase()
    .split('')
    .map(character => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join('');

const getNationalNumber = (value: string, countryCode: CountryCode): string => {
  if (!value) {
    return '';
  }

  try {
    const phone = value.startsWith('+')
      ? parsePhoneNumberFromString(value)
      : parsePhoneNumberFromString(value, countryCode);

    if (phone) {
      return phone.nationalNumber;
    }
  } catch {
    // Fall through for incomplete input.
  }

  const digits = onlyDigits(value);

  if (value.trim().startsWith('+')) {
    const callingCode = getCountryCallingCode(countryCode);

    if (digits.startsWith(callingCode)) {
      return digits.slice(callingCode.length);
    }
  }

  return digits;
};

export const VolPhoneInput: React.FC<VolPhoneInputProps> = ({
  label = 'Contact number',
  countryCode,
  value,
  onChangeCountry,
  onChangeText,
  error,
  disabled = false,
  required = false,
  optional = false,
  placeholder = 'Phone number',
}) => {
  const insets = useSafeAreaInsets();

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [nationalNumber, setNationalNumber] = useState(() =>
    getNationalNumber(value, countryCode),
  );

  const callingCode = useMemo(() => getCountryCallingCode(countryCode), [countryCode]);

  const flag = useMemo(() => getFlagEmoji(countryCode), [countryCode]);

  const parsedPhone = useMemo(() => {
    if (!nationalNumber) {
      return undefined;
    }

    try {
      return parsePhoneNumberFromString(nationalNumber, countryCode);
    } catch {
      return undefined;
    }
  }, [countryCode, nationalNumber]);

  const isValid = parsedPhone?.isValid() === true;

  const inputBorderClass = error
    ? 'border-error'
    : isFocused
    ? 'border-primary'
    : 'border-border';

  useEffect(() => {
    setNationalNumber(getNationalNumber(value, countryCode));
  }, [countryCode, value]);

  const updatePhone = (input: string, code: CountryCode = countryCode) => {
    const digits = onlyDigits(input);

    setNationalNumber(digits);

    if (!digits) {
      onChangeText('');
      return;
    }

    try {
      const phone = parsePhoneNumberFromString(digits, code);

      if (phone) {
        onChangeText(phone.number);
        return;
      }
    } catch {
      // Emit an E.164-shaped draft until parsing succeeds.
    }

    onChangeText(`+${getCountryCallingCode(code)}${digits}`);
  };

  const handleNumberChange = (input: string) => {
    const trimmedInput = input.trim();

    if (trimmedInput.startsWith('+')) {
      try {
        const phone = parsePhoneNumberFromString(trimmedInput);

        if (phone?.country) {
          setNationalNumber(phone.nationalNumber);

          if (phone.country !== countryCode) {
            onChangeCountry(phone.country);
          }

          onChangeText(phone.number);
          return;
        }
      } catch {
        // Continue with incomplete international input.
      }

      const inputDigits = onlyDigits(trimmedInput);

      if (inputDigits.startsWith(callingCode)) {
        updatePhone(inputDigits.slice(callingCode.length));
        return;
      }
    }

    updatePhone(input);
  };

  const handleCountrySelect = (item: CountryPickerItem) => {
    const nextCountry = item.code.toUpperCase() as CountryCode;

    onChangeCountry(nextCountry);
    setShowCountryPicker(false);
    updatePhone(nationalNumber, nextCountry);
  };

  return (
    <View style={tw`mb-4`}>
      {!!label && (
        <View style={tw`flex-row items-center mb-1.5 gap-[6px]`}>
          <Text style={tw`font-inter-medium text-[13px] text-dark`}>
            {label}
            {required && <Text style={tw`text-error`}> *</Text>}
          </Text>

          {optional && (
            <Text
              style={tw`
                font-inter-regular text-[11px] text-muted-light
                bg-[#F3F4F6] px-[6px] py-[1px]
                rounded-full overflow-hidden
              `}
            >
              optional
            </Text>
          )}
        </View>
      )}

      <View
        style={tw.style(
          `
            w-full flex-row items-center overflow-hidden
            bg-card border rounded-[10px]
          `,
          inputBorderClass,
          disabled && 'opacity-50',
        )}
      >
        <TouchableOpacity
          disabled={disabled}
          activeOpacity={0.65}
          accessibilityRole="button"
          accessibilityLabel={
            `Select country. Current country ${countryCode}, ` +
            `calling code plus ${callingCode}`
          }
          onPress={() => setShowCountryPicker(true)}
          style={tw`
            min-h-[48px] min-w-[105px]
            flex-row items-center justify-center
            border-r border-border px-3
          `}
        >
          <Text style={tw`text-xl`}>{flag}</Text>

          <Text style={tw`ml-2 font-inter-medium text-sm text-dark`}>+{callingCode}</Text>

          <Text style={tw`ml-2 text-[9px] text-muted-light`}>▼</Text>
        </TouchableOpacity>

        <TextInput
          value={nationalNumber}
          editable={!disabled}
          onChangeText={handleNumberChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="done"
          maxLength={20}
          accessibilityLabel={label || 'Phone number'}
          style={tw`
            min-h-[48px] flex-1 px-[14px] py-3
            font-inter-regular text-[15px] text-dark
          `}
        />
      </View>

      {!!error && (
        <Text
          accessibilityRole="alert"
          style={tw`mt-1.5 font-inter-regular text-[11px] text-error`}
        >
          {error}
        </Text>
      )}

      {!error && nationalNumber.length > 0 && isValid && (
        <Text
          style={tw`
            mt-1.5 font-inter-regular
            text-[11px] text-muted-light
          `}
        >
          {parsedPhone?.formatInternational()}
        </Text>
      )}

      <CountryPicker
        show={showCountryPicker}
        showOnly={SUPPORTED_COUNTRIES}
        initialState={`+${callingCode}`}
        lang="en"
        inputPlaceholder="Search by country or code"
        searchMessage="No country found"
        pickerButtonOnPress={handleCountrySelect}
        onBackdropPress={() => setShowCountryPicker(false)}
        onRequestClose={() => setShowCountryPicker(false)}
        style={{
          modal: tw.style('rounded-t-xl overflow-hidden bg-card', {
            height: '70%',
            maxHeight: 520,
            paddingBottom: insets.bottom,
          }),
          textInput: tw`
            h-[46px] rounded-[10px]
            border border-border bg-card
            px-[14px] font-inter-regular
            text-[15px] text-dark
          `,
          countryButtonStyles: tw`h-[52px] rounded-[10px] bg-card`,
          dialCode: tw`font-inter-medium text-sm text-dark`,
          countryName: tw`font-inter-regular text-sm text-dark`,
        }}
      />
    </View>
  );
};
