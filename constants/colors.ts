/**
 * App colors and constants
 * Color system follows the 60-30-10 rule:
 *   60% — background: #FFFCF3 (warm off-white)
 *   30% — primary:    #082052 (deep navy)
 *   10% — secondary:  #C9943F (warm gold accent)
 */

export const Colors = {
  // === 60% Background ===
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceCard: '#f8f6f1ff',       // card backgrounds — warm cream
  surfaceMuted: '#F5F2E8',      // subtle section dividers

  // === 30% Primary (navigation, headers, primary actions) ===
  primary: '#082052',
  primaryLight: '#0d2d6b',      // slightly lighter for pressed states
  primaryDark: '#050f2a',

  // === 10% Secondary / Accent (icons, highlights, badges, borders) ===
  secondary: '#C9943F',         // warm gold
  secondaryLight: '#E8B663',    // icon backgrounds, pill accents
  secondaryMuted: '#FDF8ED',    // very light tint for accent card fills

  // === Text ===
  text: '#0D1B2A',              // near-black, high contrast on cream bg
  textLight: '#5C6B7A',         // muted labels
  textInverse: '#FFFFFF',
  textAccent: '#C9943F',        // links, highlighted labels

  // === Status Colors ===
  pending: '#D97706',
  approved: '#16A34A',
  rejected: '#DC2626',
  pendingBg: '#FEF3C7',
  approvedBg: '#DCFCE7',
  rejectedBg: '#FEE2E2',
  pendingText: '#92400E',
  approvedText: '#166534',
  rejectedText: '#991B1B',

  // === Borders & Dividers ===
  border: '#E2D9C9',            // warm-tinted border matching background
  borderAccent: '#3E6985',      // 10% accent border for cards
  divider: '#EDE8DC',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    lineHeight: 40,     // tight for large headings
  },
  h2: {
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,     // comfortable reading
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
    lineHeight: 20,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  captionBold: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  stat: {
    fontSize: 38,
    fontWeight: '800' as const,
    letterSpacing: -1,
    lineHeight: 46,
  },
};
