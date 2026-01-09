import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { Card, Header, DeliveryStatusBadge } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { mockDeliveries } from '@/constants/mockData';

export default function ConsumerActive() {
  const [refreshing, setRefreshing] = useState(false);
  const activeDeliveries = mockDeliveries.filter((d) => d.status !== 'delivered');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <Header title="Active Deliveries" subtitle={`${activeDeliveries.length} in progress`} />
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeDeliveries.length > 0 ? (
          activeDeliveries.map((delivery) => (
            <Card
              key={delivery.id}
              style={{ marginBottom: 12 }}
              onPress={() => router.push(`/(consumer)/delivery/${delivery.id}`)}
            >
              <View style={styles.header}>
                <View style={styles.headerInfo}>
                  <Text style={styles.title}>{delivery.customerName}</Text>
                  <Text style={styles.description}>{delivery.packageDescription}</Text>
                </View>
                <DeliveryStatusBadge status={delivery.status} />
              </View>
              <View style={styles.details}>
                <DetailRow label="Pickup:" value={delivery.pickupAddress.street} />
                <DetailRow label="Dropoff:" value={delivery.dropoffAddress.street} />
                <DetailRow label="Cost:" value={`$${delivery.estimatedCost.toFixed(2)}`} />
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No active deliveries</Text>
            <Text style={styles.emptySubtext}>Start a new delivery to see it here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: any) {
  return (
    <View style={styles.detailRow}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
