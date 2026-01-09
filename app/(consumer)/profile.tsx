import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';
import { Button, Card, Header } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { mockConsumer } from '@/constants/mockData';
import { Edit2, MapPin, Phone, Mail, LogOut } from 'lucide-react-native';

export default function ConsumerProfile() {
  const [user] = useState(mockConsumer);

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
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
          <InfoCard icon={<Mail size={20} color={colors.primary} />} label="Email" value={user.email} />
          <InfoCard icon={<Phone size={20} color={colors.primary} />} label="Phone" value={user.phone} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          {user.savedAddresses.map((addr) => (
            <Card key={addr.id}>
              <View style={styles.addressItem}>
                <View style={styles.addressIcon}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  <Text style={styles.addressText}>{addr.street}</Text>
                  <Text style={styles.addressText}>
                    {addr.city}, {addr.state} {addr.zipCode}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Button
            title="Sign Out"
            onPress={() => router.replace('/')}
            variant="danger"
            size="large"
            style={styles.signOutButton}
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
        <View style={styles.infoIcon}>{icon}</View>
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
    marginBottom: 12,
  },
  editButton: {
    minWidth: 140,
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
  infoIcon: {
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
  addressItem: {
    flexDirection: 'row',
  },
  addressIcon: {
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  signOutButton: {
    marginTop: 12,
  },
});
