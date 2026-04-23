/**
 * App colors and constants
 */

export const Colors = {
  // Status colors
  pending: '#FFA500', // Orange/Yellow
  approved: '#4CAF50', // Green
  rejected: '#FF5252', // Red
  
  // Base colors
  primary: '#007AFF',
  secondary: '#5AC8FA',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  textInverse: '#FFFFFF',
  
  // Borders
  border: '#E0E0E0',
  
  // Status with backgrounds
  pendingBg: '#FFF3E0',
  approvedBg: '#E8F5E9',
  rejectedBg: '#FFEBEE',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
  },
  caption: {
    fontSize: 12,
  },
};
