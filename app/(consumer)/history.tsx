import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { Card, Header } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { mockDeliveries } from '@/constants/mockData';
import { Calendar } from 'lucide-react-native';

export default function ConsumerHistory() {
  const [refreshing, setRefreshing] = useState(false);
  const deliveredDeliveries = mockDeliveries.filter((d) => d.status === 'delivered');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <Header title="Delivery History" subtitle={`${deliveredDeliveries.length + 5} completed`} />
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {deliveredDeliveries.length > 0 ? (
          deliveredDeliveries.map((delivery) => (
            <Card
              key={delivery.id}
              style={{ marginBottom: 12 }}
              onPress={() => router.push(`/(consumer)/delivery/${delivery.id}`)}
            >
              <View style={styles.historyItem}>
                <View style={styles.dateIcon}>
                  <Calendar size={20} color={colors.primary} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.title}>{delivery.customerName}</Text>
                  <Text style={styles.description}>{delivery.packageDescription}</Text>
                  <Text style={styles.date}>
                    {new Date(delivery.completedAt || '').toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.amount}>${delivery.actualCost?.toFixed(2)}</Text>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No delivery history</Text>
            <Text style={styles.emptySubtext}>Completed deliveries will appear here</Text>
          </View>
        )}
      </ScrollView>
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
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
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
