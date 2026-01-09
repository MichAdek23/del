import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, Header } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { Briefcase, User, Bike } from 'lucide-react-native';

export default function RoleSelection() {
  return (
    <View style={styles.container}>
      <Header
        title="Select Your Role"
        subtitle="Choose how you want to use DELIVA"
        onBack={() => router.back()}
      />
      <ScrollView style={styles.content}>
        <RoleCard
          icon={<Briefcase size={48} color={colors.primary} />}
          title="Vendor"
          description="Send goods to your customers quickly and reliably"
          onPress={() => router.push('/auth/vendor-signup')}
        />
        <RoleCard
          icon={<User size={48} color={colors.primary} />}
          title="Consumer"
          description="Request pickups and package deliveries anytime"
          onPress={() => router.push('/auth/consumer-signup')}
        />
        <RoleCard
          icon={<Bike size={48} color={colors.primary} />}
          title="Rider"
          description="Earn money by delivering packages on your schedule"
          onPress={() => router.push('/auth/rider-signup')}
        />
      </ScrollView>
    </View>
  );
}

function RoleCard({ icon, title, description, onPress }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{description}</Text>
      <Button title="Get Started" onPress={onPress} size="medium" />
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
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
});
