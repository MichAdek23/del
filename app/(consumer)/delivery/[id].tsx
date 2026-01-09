import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';
import { Button, Card, Header, DeliveryStatusBadge, RatingStars } from '@/components';
import { colors } from '@/constants';
import { router, useLocalSearchParams } from 'expo-router';
import { mockDeliveries, mockRider } from '@/constants/mockData';
import { MapPin, Phone, User, Clock, DollarSign } from 'lucide-react-native';

export default function DeliveryDetail() {
  const { id } = useLocalSearchParams();
  const delivery = mockDeliveries.find((d) => d.id === id) || mockDeliveries[0];
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const isDelivered = delivery.status === 'delivered';

  return (
    <View style={styles.container}>
      <Header
        title="Delivery Details"
        onBack={() => router.back()}
        rightAction={<DeliveryStatusBadge status={delivery.status} />}
      />
      <ScrollView style={styles.content}>
        {delivery.rideId && (
          <Card>
            <RiderCard rider={mockRider} />
          </Card>
        )}

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
          <InfoRow label="Notes" value={delivery.notes || 'None'} />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Pricing</Text>
          <PricingRow label="Delivery Fee" value={`$${delivery.estimatedCost.toFixed(2)}`} />
          <View style={styles.divider} />
          <PricingRow
            label="Total"
            value={`$${(delivery.actualCost || delivery.estimatedCost).toFixed(2)}`}
            isBold
          />
        </Card>

        {isDelivered && (
          <Card>
            <Text style={styles.cardTitle}>Rate This Delivery</Text>
            <View style={styles.ratingContainer}>
              <RatingStars
                rating={rating}
                interactive={true}
                onRate={setRating}
                size={32}
              />
            </View>
          </Card>
        )}

        <View style={styles.actions}>
          {!isDelivered && (
            <>
              <Button title="Track Delivery" onPress={() => {}} size="large" />
              <Button
                title="Cancel Delivery"
                onPress={() => {}}
                variant="danger"
                size="large"
              />
            </>
          )}
          {isDelivered && (
            <Button
              title="Submit Rating"
              onPress={() => {}}
              size="large"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function RiderCard({ rider }: any) {
  return (
    <View style={styles.riderCard}>
      <Image source={{ uri: rider.profileImage }} style={styles.riderAvatar} />
      <View style={styles.riderInfo}>
        <Text style={styles.riderName}>
          {rider.firstName} {rider.lastName}
        </Text>
        <RatingStars rating={rider.rating} count={rider.totalDeliveries} />
      </View>
      <Button title="Call" onPress={() => {}} size="small" variant="secondary" />
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

function PricingRow({ label, value, isBold }: any) {
  return (
    <View style={styles.pricingRow}>
      <Text style={[styles.pricingLabel, isBold && styles.bold]}>{label}</Text>
      <Text style={[styles.pricingValue, isBold && styles.bold]}>{value}</Text>
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
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
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
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pricingValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.primary,
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  actions: {
    gap: 12,
    marginBottom: 40,
  },
});
