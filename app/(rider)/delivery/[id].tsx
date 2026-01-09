import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';
import { Button, Card, Header, DeliveryStatusBadge } from '@/components';
import { colors } from '@/constants';
import { router, useLocalSearchParams } from 'expo-router';
import { availableDeliveries } from '@/constants/mockData';
import { MapPin, Phone, Clock, DollarSign } from 'lucide-react-native';

export default function RiderDeliveryDetail() {
  const { id } = useLocalSearchParams();
  const delivery = availableDeliveries.find((d) => d.id === id) || availableDeliveries[0];
  const [status, setStatus] = useState('pending');

  const handleAccept = () => {
    setStatus('assigned');
  };

  const handlePickup = () => {
    setStatus('picked_up');
  };

  const handleStartDelivery = () => {
    setStatus('in_transit');
  };

  const handleComplete = () => {
    setStatus('delivered');
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Delivery Details"
        onBack={() => router.back()}
        rightAction={<DeliveryStatusBadge status={status} />}
      />
      <ScrollView style={styles.content}>
        <Card>
          <Text style={styles.cardTitle}>Customer</Text>
          <View style={styles.customerSection}>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{delivery.customerName}</Text>
              <Text style={styles.customerPhone}>{delivery.customerPhone}</Text>
            </View>
            <Button title="Call" onPress={() => {}} size="small" variant="secondary" />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Locations</Text>
          <LocationRow
            icon={<MapPin size={20} color={colors.primary} />}
            label="Pickup"
            address={delivery.pickupAddress}
          />
          <View style={styles.divider} />
          <LocationRow
            icon={<MapPin size={20} color={colors.primaryDark} />}
            label="Dropoff"
            address={delivery.dropoffAddress}
          />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Package Information</Text>
          <InfoRow label="Description" value={delivery.packageDescription} />
          <InfoRow label="Size" value={delivery.packageSize.toUpperCase()} />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Earnings</Text>
          <View style={styles.earningRow}>
            <DollarSign size={24} color={colors.success} />
            <View style={styles.earningInfo}>
              <Text style={styles.earningLabel}>You'll Earn</Text>
              <Text style={styles.earningAmount}>${delivery.estimatedCost.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.actions}>
          {status === 'pending' && (
            <Button title="Accept Delivery" onPress={handleAccept} size="large" />
          )}
          {status === 'assigned' && (
            <Button title="Mark as Picked Up" onPress={handlePickup} size="large" />
          )}
          {status === 'picked_up' && (
            <Button
              title="Start Delivery"
              onPress={handleStartDelivery}
              size="large"
            />
          )}
          {status === 'in_transit' && (
            <Button
              title="Mark as Delivered"
              onPress={handleComplete}
              size="large"
            />
          )}
          {status === 'delivered' && (
            <Button
              title="Delivery Completed!"
              onPress={() => router.replace('/(rider)')}
              size="large"
              disabled={true}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function LocationRow({ icon, label, address }: any) {
  return (
    <View style={styles.locationRow}>
      <View>{icon}</View>
      <View style={styles.locationText}>
        <Text style={styles.locationLabel}>{label}</Text>
        <Text style={styles.locationAddress}>{address.street}</Text>
        <Text style={styles.locationCity}>
          {address.city}, {address.state}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  customerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  locationCity: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  earningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningInfo: {
    marginLeft: 12,
  },
  earningLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  earningAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
  },
  actions: {
    gap: 12,
    marginBottom: 40,
  },
});
