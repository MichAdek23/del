import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { Card, Header, DeliveryStatusBadge } from '@/components';
import { colors } from '@/constants';
import { mockDeliveries, mockVendor } from '@/constants/mockData';

export default function VendorOrders() {
  const [refreshing, setRefreshing] = useState(false);
  const vendorOrders = mockDeliveries.filter((d) => d.vendorId === mockVendor.id);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <Header title="Your Orders" subtitle={`${vendorOrders.length} total`} />
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {vendorOrders.length > 0 ? (
          vendorOrders.map((order) => (
            <Card key={order.id} style={{ marginBottom: 12 }}>
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.customerName}>{order.customerName}</Text>
                  <Text style={styles.description}>{order.packageDescription}</Text>
                </View>
                <DeliveryStatusBadge status={order.status} />
              </View>
              <View style={styles.divider} />
              <View style={styles.orderDetails}>
                <DetailRow label="To:" value={order.dropoffAddress.city} />
                <DetailRow label="Amount:" value={`$${order.estimatedCost.toFixed(2)}`} />
                <DetailRow
                  label="Rider:"
                  value={order.rideId ? 'Assigned' : 'Pending'}
                />
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No orders yet</Text>
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  orderDetails: {
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
