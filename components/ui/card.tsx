/**
 * Card Component
 * Mobile-first card container with soft shadow and accent border
 */

import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** Show a left-side accent border strip in the secondary color */
  accent?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, accent = false }) => {
  const inner = (
    <View style={[styles.card, accent && styles.cardAccent, style]}>
      {accent && <View style={styles.accentStrip} />}
      <View style={accent ? styles.accentContent : undefined}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.82}>
        {inner}
      </TouchableOpacity>
    );
  }

  return inner;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  cardAccent: {
    flexDirection: 'row',
    paddingLeft: 0,
  },
  accentStrip: {
    width: 4,
    backgroundColor: Colors.secondary,
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  accentContent: {
    flex: 1,
    paddingLeft: Spacing.md,
  },
});
