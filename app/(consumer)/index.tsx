import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';
import { Button, Card } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { Plus, Zap } from 'lucide-react-native';
import { mockConsumer, mockDeliveries } from '@/constants/mockData';

export default function ConsumerHome() {
  const [user] = useState(mockConsumer);
  const activeDeliveries = mockDeliveries.filter((d) => d.status !== 'delivered');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user.firstName}!</Text>
          <Text style={styles.subtext}>Ready to send or receive?</Text>
        </View>
        <Image source={{ uri: user.profileImage }} style={styles.avatar} />
      </View>

      <View style={styles.quickActions}>
        <Button
          title="New Delivery"
          onPress={() => router.push('/(consumer)/create-delivery')}
          size="large"
          style={styles.fullButton}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Deliveries</Text>
          {activeDeliveries.length > 0 && (
            <Text style={styles.count}>{activeDeliveries.length}</Text>
          )}
        </View>
        {activeDeliveries.length > 0 ? (
          activeDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onPress={() => router.push(`/(consumer)/delivery/${delivery.id}`)}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>No active deliveries</Text>
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Addresses</Text>
        {user.savedAddresses.map((addr) => (
          <Card key={addr.id}>
            <Text style={styles.addressLabel}>{addr.label}</Text>
            <Text style={styles.addressText}>{addr.street}</Text>
            <Text style={styles.addressText}>
              {addr.city}, {addr.state} {addr.zipCode}
            </Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

function DeliveryCard({ delivery, onPress }: any) {
  return (
    <Card onPress={onPress}>
      <View style={styles.deliveryCard}>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryTitle}>{delivery.packageDescription}</Text>
          <Text style={styles.deliveryStatus}>{delivery.status.toUpperCase()}</Text>
          <Text style={styles.deliveryMeta}>${delivery.estimatedCost.toFixed(2)}</Text>
        </View>
        <View style={styles.deliveryArrow}>
          <Zap size={20} color={colors.primary} />
        </View>
      </View>
    </Card>
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fullButton: {
    width: '100%',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deliveryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  deliveryStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  deliveryMeta: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  deliveryArrow: {
    paddingLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: 20,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
});
