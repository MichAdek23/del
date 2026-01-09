import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Card, Header } from '@/components';
import { colors } from '@/constants';
import { mockRider } from '@/constants/mockData';
import { TrendingUp, Calendar } from 'lucide-react-native';

export default function RiderEarnings() {
  const [rider] = useState(mockRider);

  const dailyEarnings = [
    { date: 'Today', amount: 85.5 },
    { date: 'Yesterday', amount: 120.0 },
    { date: '2 days ago', amount: 95.75 },
  ];

  const weeklyTotal = 850.25;
  const monthlyTotal = 3250.0;

  return (
    <View style={styles.container}>
      <Header
        title="Earnings"
        subtitle={`Balance: $${rider.balance.toFixed(2)}`}
      />
      <ScrollView style={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>${rider.balance.toFixed(2)}</Text>
          <View style={styles.stats}>
            <Text style={styles.statsText}>
              {rider.totalDeliveries} deliveries completed
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <SummaryCard
            icon={<Calendar size={24} color={colors.primary} />}
            title="Weekly Earnings"
            amount={weeklyTotal}
          />
          <SummaryCard
            icon={<TrendingUp size={24} color={colors.success} />}
            title="Monthly Earnings"
            amount={monthlyTotal}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Earnings</Text>
          {dailyEarnings.map((earning, idx) => (
            <Card key={idx}>
              <View style={styles.earningRow}>
                <Text style={styles.earningDate}>{earning.date}</Text>
                <Text style={styles.earningAmount}>+${earning.amount.toFixed(2)}</Text>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal</Text>
          <Card>
            <Text style={styles.withdrawalText}>
              Withdrawals process within 1-2 business days to your bank account.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryCard({ icon, title, amount }: any) {
  return (
    <Card style={styles.summaryCard}>
      <View style={styles.summaryContent}>
        <View style={styles.summaryIcon}>{icon}</View>
        <View>
          <Text style={styles.summaryTitle}>{title}</Text>
          <Text style={styles.summaryAmount}>${amount.toFixed(2)}</Text>
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
  content: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 12,
  },
  stats: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.background,
    opacity: 0.8,
  },
  statsText: {
    fontSize: 12,
    color: colors.background,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  summaryCard: {
    marginBottom: 12,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    marginRight: 16,
  },
  summaryTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningDate: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  earningAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  withdrawalText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
