import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';
import { Button, Card, Header, RatingStars } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { mockRider } from '@/constants/mockData';
import { MapPin, Phone, Mail, FileText, LogOut } from 'lucide-react-native';

export default function RiderProfile() {
  const [rider] = useState(mockRider);

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: rider.profileImage }} style={styles.avatar} />
          <Text style={styles.name}>
            {rider.firstName} {rider.lastName}
          </Text>
          <RatingStars rating={rider.rating} count={rider.totalDeliveries} />
          <Button
            title="Edit Profile"
            onPress={() => {}}
            size="small"
            variant="secondary"
            style={styles.editButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <InfoCard
            icon={<Mail size={20} color={colors.primary} />}
            label="Email"
            value={rider.email}
          />
          <InfoCard
            icon={<Phone size={20} color={colors.primary} />}
            label="Phone"
            value={rider.phone}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <InfoCard
            icon={<MapPin size={20} color={colors.primary} />}
            label="Vehicle Type"
            value={rider.vehicleType.charAt(0).toUpperCase() + rider.vehicleType.slice(1)}
          />
          <InfoCard
            icon={<FileText size={20} color={colors.primary} />}
            label="Registration"
            value={rider.vehicleRegistration}
          />
          <InfoCard
            icon={<FileText size={20} color={colors.primary} />}
            label="License"
            value={rider.licenseNumber}
          />
        </View>

        <View style={styles.section}>
          <Button
            title="Sign Out"
            onPress={() => router.replace('/')}
            variant="danger"
            size="large"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCard({ icon, label, value }: any) {
  return (
    <Card>
      <View style={styles.infoRow}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  editButton: {
    marginTop: 12,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
});
