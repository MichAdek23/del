import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { colors } from '@/constants';
import { MapPin } from 'lucide-react-native';

interface MapLocation {
  latitude: number;
  longitude: number;
  label: string;
  type: 'pickup' | 'dropoff' | 'current';
}

interface MapProps {
  pickupLocation?: MapLocation;
  dropoffLocation?: MapLocation;
  currentLocation?: MapLocation;
  nearbyOrders?: MapLocation[];
  style?: any;
}

export function Map({
  pickupLocation,
  dropoffLocation,
  currentLocation,
  nearbyOrders,
  style,
}: MapProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapPlaceholder}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.placeholderImage}
        />
        <Text style={styles.placeholderText}>Live Map</Text>
        <Text style={styles.placeholderSubtext}>
          Integrated map will display here with location markers
        </Text>

        <View style={styles.legendContainer}>
          {pickupLocation && (
            <LegendItem color={colors.primary} label="Pickup" />
          )}
          {dropoffLocation && (
            <LegendItem color={colors.primaryDark} label="Dropoff" />
          )}
          {currentLocation && (
            <LegendItem color={colors.success} label="Your Location" />
          )}
          {nearbyOrders && nearbyOrders.length > 0 && (
            <LegendItem color={colors.warning} label={`${nearbyOrders.length} Nearby Orders`} />
          )}
        </View>
      </View>

      {/* Location Info Display */}
      <View style={styles.infoContainer}>
        {pickupLocation && (
          <LocationInfo
            type="pickup"
            location={pickupLocation}
            color={colors.primary}
          />
        )}
        {dropoffLocation && (
          <LocationInfo
            type="dropoff"
            location={dropoffLocation}
            color={colors.primaryDark}
          />
        )}
      </View>
    </View>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function LocationInfo({ type, location, color }: any) {
  return (
    <View style={[styles.locationInfo, { borderLeftColor: color }]}>
      <View style={styles.locationHeader}>
        <MapPin size={16} color={color} />
        <Text style={styles.locationType}>
          {type === 'pickup' ? 'Pickup Location' : 'Dropoff Location'}
        </Text>
      </View>
      <Text style={styles.locationLabel}>{location.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    opacity: 0.3,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  legendContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  infoContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    maxHeight: 120,
  },
  locationInfo: {
    backgroundColor: colors.backgroundAlt,
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  locationType: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  locationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
