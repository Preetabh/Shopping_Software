/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const LuxeTheme = {
  colors: {
    // Luxury Obsidian & Onyx
    black: '#0A0A0C',
    obsidian: '#111115',
    charcoal: '#1A1A22',
    surface: '#22222B',
    surfaceLight: '#2D2D38',
    borderDark: '#2E2E3A',
    
    // Luxury Gold & Champagne Palette
    gold: '#D4AF37',
    goldLight: '#F3E5AB',
    goldMuted: '#C5A059',
    goldDeep: '#997A2E',
    goldGlow: 'rgba(212, 175, 55, 0.18)',
    goldBorder: 'rgba(212, 175, 55, 0.35)',

    // Editorial Ivory & Cream
    ivory: '#FAF9F6',
    cream: '#F4F1EA',
    paper: '#FFFFFF',
    borderLight: '#E8E4DA',
    textMuted: '#8A8A93',
    textDim: '#A1A1AA',

    // Status / Jewels
    emerald: '#10B981',
    ruby: '#E11D48',
    sapphire: '#3B82F6',
    vipTag: '#D4AF37'
  },
  brand: {
    name: 'AURELIA',
    mark: 'AURELIA LUXE',
    tagline: 'Maison de Haute Couture & Luxe',
    tier: 'Aurelia Privé',
    vipCode: 'AURELIA10',
    guarantee: 'Aurelia Authentique • 100% Certified Origin'
  }
};

export const Colors = {
  light: {
    text: '#111115',
    background: '#FAF9F6',
    backgroundElement: '#F2EFEB',
    backgroundSelected: '#E5DFC5',
    textSecondary: '#6B6862',
    accent: '#D4AF37',
    primary: '#111115',
  },
  dark: {
    text: '#FAF9F6',
    background: '#0A0A0C',
    backgroundElement: '#141419',
    backgroundSelected: '#202028',
    textSecondary: '#A1A1AA',
    accent: '#D4AF37',
    primary: '#D4AF37',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
