export const colors = {
  primary: '#19C37D',
  primaryDark: '#0F7A4D',
  background: {
    light: '#FFFFFF',
    dark: '#343541',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#202123',
  },
  border: {
    light: '#E5E5E5',
    dark: '#444654',
  },
  text: {
    primary: {
      light: '#11181C',
      dark: '#FFFFFF',
    },
    secondary: {
      light: '#687076',
      dark: '#9BA1A6',
    },
  },
  error: '#FF4444',
  success: '#4CAF50',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 64,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

// Common style mixins
export const mixins = {
  container: {
    flex: 1,
    padding: spacing.md,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}; 