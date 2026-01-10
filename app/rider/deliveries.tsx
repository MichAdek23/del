import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { Card, Header, DeliveryStatusBadge } from '@/components';
import { colors } from '@/constants';
import { mockDeliveries } from '@/constants/mockData';

export default function RiderDeliveries() {
  const [refreshing, setRefreshing] = useState(false);
  const riderDeliveries = mockDeliveries.filter((d) => d.rideId);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const completedCount = riderDeliveries.filter((d) => d.status === 'delivered').length;
  const activeCount = riderDeliveries.filter((d) => d.status !== 'delivered').length;

  return (
    <View style={styles.container}>
      <Header
        title="Your Deliveries"
        subtitle={`${activeCount} active • ${completedCount} completed`}
      />
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {riderDeliveries.length > 0 ? (
          riderDeliveries.map((delivery) => (
            <Card key={delivery.id} style={{ marginBottom: 12 }}>
              <View style={styles.deliveryHeader}>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.customerName}>{delivery.customerName}</Text>
                  <Text style={styles.packageDesc}>{delivery.packageDescription}</Text>
                </View>
                <DeliveryStatusBadge status={delivery.status} />
              </View>
              <View style={styles.divider} />
              <View style={styles.details}>
                <DetailRow
                  label="From:"
                  value={delivery.pickupAddress.street}
                />
                <DetailRow label="To:" value={delivery.dropoffAddress.street} />
                <DetailRow
                  label="Amount:"
                  value={`$${delivery.estimatedCost.toFixed(2)}`}
                />
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No deliveries</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  details: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});
