import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@/constants';

interface RatingStarsProps {
  rating: number;
  count?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: number;
}

export function RatingStars({
  rating,
  count,
  interactive = false,
  onRate,
  size = 16,
}: RatingStarsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            color={star <= rating ? colors.warning : colors.border}
            fill={star <= rating ? colors.warning : 'none'}
            onPress={() => interactive && onRate?.(star)}
          />
        ))}
      </View>
      {count !== undefined && <Text style={styles.count}>({count})</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  count: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
