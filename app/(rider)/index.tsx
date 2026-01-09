import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, Image } from 'react-native';
import { Card, Map, BottomSheet } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { mockRider, mockDeliveries, availableDeliveries } from '@/constants/mockData';
import { Menu, DollarSign, Award, Users } from 'lucide-react-native';

export default function RiderDashboard() {
  const [rider, setRider] = useState(mockRider);
  const [isAvailable, setIsAvailable] = useState(rider.isAvailable);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    setRider({ ...rider, isAvailable: !isAvailable });
  };

  const hasActiveOrder = mockDeliveries.some(
    (d) => d.rideId === rider.id && d.status !== 'delivered' && d.status !== 'cancelled'
  );

  const activeOrder = mockDeliveries.find(
    (d) => d.rideId === rider.id && d.status !== 'delivered' && d.status !== 'cancelled'
  );

  const handleOrderAccept = (delivery: any) => {
    setActiveDelivery(delivery);
    router.push(`/(rider)/delivery/${delivery.id}`);
  };

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <Map
        pickupLocation={
          activeOrder
            ? {
                ...activeOrder.pickupAddress,
                type: 'pickup' as const,
              }
            : undefined
        }
        dropoffLocation={
          activeOrder
            ? {
                ...activeOrder.dropoffAddress,
                type: 'dropoff' as const,
              }
            : undefined
        }
        nearbyOrders={
          !hasActiveOrder
            ? availableDeliveries.map((d) => ({
                latitude: d.pickupAddress.latitude,
                longitude: d.pickupAddress.longitude,
                label: d.customerName,
                type: 'pickup' as const,
              }))
            : undefined
        }
      />

      {/* Availability Toggle - Top Left */}
      <View style={styles.topLeftContainer}>
        <View style={styles.availabilityBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isAvailable ? colors.success : colors.error },
            ]}
          />
          <Text style={styles.statusText}>
            {isAvailable ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Menu Icon - Top Right */}
      <View style={styles.topRightContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsOverlayOpen(true)}
        >
          <Menu size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Availability Toggle Card - Bottom Center */}
      <View style={styles.bottomContainer}>
        <Card style={styles.availabilityCard}>
          <View style={styles.availabilityContent}>
            <View>
              <Text style={styles.availabilityLabel}>Ready to accept orders?</Text>
              <Text style={styles.availabilityValue}>
                {isAvailable ? 'You are online' : 'You are offline'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </Card>

        {isAvailable && !hasActiveOrder && availableDeliveries.length > 0 && (
          <View style={styles.ordersPreview}>
            <Text style={styles.ordersTitle}>
              {availableDeliveries.length} Available Orders
            </Text>
            {availableDeliveries.slice(0, 2).map((delivery) => (
              <Card
                key={delivery.id}
                style={styles.orderCard}
                onPress={() => handleOrderAccept(delivery)}
              >
                <View style={styles.orderCardContent}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderCustomer}>{delivery.customerName}</Text>
                    <Text style={styles.orderDescription} numberOfLines={1}>
                      {delivery.packageDescription}
                    </Text>
                  </View>
                  <Text style={styles.orderAmount}>
                    ${delivery.estimatedCost.toFixed(2)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {hasActiveOrder && (
          <View style={styles.activeOrderBanner}>
            <Text style={styles.activeOrderText}>
              You have 1 active delivery in progress
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Sheet Overlay */}
      <BottomSheet
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        title="Your Stats"
      >
        <View style={styles.overlayContent}>
          <StatCard
            icon={<DollarSign size={32} color={colors.success} />}
            label="Today's Earnings"
            value={`$${(85.5).toFixed(2)}`}
          />
          <StatCard
            icon={<Award size={32} color={colors.warning} />}
            label="Rating"
            value={`${rider.rating.toFixed(1)} ⭐`}
          />
          <StatCard
            icon={<Users size={32} color={colors.primary} />}
            label="Total Deliveries"
            value={`${rider.totalDeliveries}`}
          />

          <View style={styles.profileCard}>
            <Image source={{ uri: rider.profileImage }} style={styles.profileAvatar} />
            <View>
              <Text style={styles.profileName}>
                {rider.firstName} {rider.lastName}
              </Text>
              <Text style={styles.profilePhone}>{rider.phone}</Text>
            </View>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statContent}>
        <View style={styles.statIcon}>{icon}</View>
        <View style={styles.statText}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topLeftContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 5,
  },
  availabilityBadge: {
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  topRightContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 5,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: 300,
  },
  availabilityCard: {
    marginTop: 12,
  },
  availabilityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  availabilityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  ordersPreview: {
    marginTop: 12,
  },
  ordersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  orderCard: {
    marginBottom: 8,
  },
  orderCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderCustomer: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  orderDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 12,
  },
  activeOrderBanner: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  activeOrderText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  overlayContent: {
    paddingVertical: 8,
  },
  statCard: {
    marginBottom: 12,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 16,
  },
  statText: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
