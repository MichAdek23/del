import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { statusColors, colors } from '@/constants';

interface DeliveryStatusBadgeProps {
  status: string;
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  const backgroundColor = statusColors[status as keyof typeof statusColors] || colors.neutral;
  const label = statusLabels[status] || status;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
});
