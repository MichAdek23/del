import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';
import { Button, Card } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { mockVendor, mockDeliveries } from '@/constants/mockData';
import { TrendingUp, Users, Truck } from 'lucide-react-native';

export default function VendorDashboard() {
  const [vendor] = useState(mockVendor);
  const activeOrders = mockDeliveries.filter((d) => d.vendorId === vendor.id && d.status !== 'delivered');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.businessName}>{vendor.businessName}</Text>
        </View>
        <Image source={{ uri: vendor.profileImage }} style={styles.avatar} />
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          icon={<Truck size={24} color={colors.primary} />}
          label="Active Orders"
          value={String(activeOrders.length)}
        />
        <StatCard
          icon={<TrendingUp size={24} color={colors.success} />}
          label="Rating"
          value={vendor.rating.toFixed(1)}
        />
        <StatCard
          icon={<Users size={24} color={colors.warning} />}
          label="Customers"
          value="245"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <Button
          title="Create New Order"
          onPress={() => router.push('/(vendor)/create')}
          size="large"
          style={styles.fullButton}
        />
        <Button
          title="View All Orders"
          onPress={() => router.push('/(vendor)/orders')}
          variant="secondary"
          size="large"
          style={styles.fullButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {activeOrders.length > 0 ? (
          activeOrders.slice(0, 3).map((order) => (
            <Card key={order.id}>
              <View style={styles.orderItem}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>{order.customerName}</Text>
                  <Text style={styles.orderStatus}>{order.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.orderAmount}>${order.estimatedCost.toFixed(2)}</Text>
              </View>
            </Card>
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>No active orders</Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  fullButton: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: 20,
  },
});
