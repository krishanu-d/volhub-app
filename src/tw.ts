import { create } from 'twrnc';

const tw = create({
  theme: {
    extend: {
      colors: {
        // VolHub brand
        primary: '#F5C518',
        'primary-dark': '#D4A800',
        'primary-light': '#FFD84D',

        surface: '#FAFAFA',
        dark: '#1A1A1A',

        // Semantic aliases
        background: '#FAFAFA',
        'background-dark': '#F0F0F0',
        foreground: '#1A1A1A',

        muted: '#6B7280',
        'muted-light': '#9CA3AF',

        border: '#E5E7EB',
        card: '#FFFFFF',
        error: '#EF4444',
        success: '#22C55E',
      },
      fontFamily: {
        'inter-regular': ['Inter-Regular'],
        'inter-medium': ['Inter-Medium'],
        'inter-semibold': ['Inter-SemiBold'],
        'poppins-semibold': ['Poppins-SemiBold'],
        'poppins-bold': ['Poppins-Bold'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        full: '9999px',
      },
      spacing: {
        px: '1px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
    },
  },
});

export default tw;
