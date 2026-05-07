/**
 * Status Badge Component
 * Displays clearance part status with color coding
 */

import { BorderRadius, Colors, Spacing, Typography } from '@/constants/colors';
import { ClearanceStatus } from '@/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusBadgeProps {
  status: ClearanceStatus;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const getStatusColor = (): string => {
    switch (status) {
      case 'pending':
        return Colors.pending;
      case 'approved':
        return Colors.approved;
      case 'rejected':
        return Colors.rejected;
      default:
        return Colors.textLight;
    }
  };

  const getStatusBgColor = (): string => {
    switch (status) {
      case 'pending':
        return Colors.pendingBg;
      case 'approved':
        return Colors.approvedBg;
      case 'rejected':
        return Colors.rejectedBg;
      default:
        return Colors.background;
    }
  };

  const getStatusLabel = (): string => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getStatusBgColor(),
          paddingVertical: isSmall ? Spacing.xs : Spacing.sm,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: getStatusColor(),
            fontSize: isSmall ? Typography.caption.fontSize : Typography.body.fontSize,
          },
        ]}
      >
        {getStatusLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
