import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Card, Button } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { Edit2, MapPin, ArrowLeft, Trash2, Check } from 'lucide-react-native';
import AddAddressPage from './add-address';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

// ==================== SAVED ADDRESSES PAGE ====================
export default function SavedAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleAddAddress = (newAddress: any) => {
    if (newAddress) {
      if (editingId) {
        // Update existing address
        setAddresses(
          addresses.map((addr) =>
            addr.id === editingId ? { ...newAddress, id: editingId } : addr
          )
        );
        setEditingId(null);
      } else {
        // Add new address
        const addressWithId = {
          ...newAddress,
          id: Date.now().toString(),
        };
        // If no default exists, make this one default
        if (addresses.length === 0) {
          addressWithId.isDefault = true;
        }
        setAddresses([...addresses, addressWithId]);
      }
    }
    setShowAddAddress(false);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setEditingId(address.id);
    setShowAddAddress(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const deletedAddress = addresses.find((a) => a.id === id);
            setAddresses(addresses.filter((a) => a.id !== id));

            // If deleted address was default, make first remaining as default
            if (deletedAddress?.isDefault && addresses.length > 1) {
              setAddresses((prev) => {
                const updated = [...prev];
                if (updated[0]) {
                  updated[0].isDefault = true;
                }
                return updated;
              });
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  if (showAddAddress) {
    return (
      <AddAddressPage
        onBack={handleAddAddress}
        initialData={editingAddress}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
              <MapPin size={64} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Saved Addresses</Text>
            <Text style={styles.emptySubtitle}>
              Save your favorite addresses for quick selection during checkout
            </Text>
            <Button
              title="Add Your First Address"
              onPress={() => setShowAddAddress(true)}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <>
            {addresses.map((addr) => (
              <Card key={addr.id} style={styles.addressCard}>
                <View style={styles.addressCardContent}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressLabelContainer}>
                      <View style={styles.iconContainer}>
                        <MapPin size={20} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.addressLabel}>{addr.label}</Text>
                        {addr.isDefault && (
                          <Text style={styles.defaultIndicator}>Default Address</Text>
                        )}
                      </View>
                    </View>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Check size={12} color="#fff" />
                      </View>
                    )}
                  </View>

                  <Text style={styles.addressText}>{addr.address}</Text>

                  <View style={styles.addressActions}>
                    {!addr.isDefault && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(addr.id)}
                        style={styles.setDefaultBtn}
                      >
                        <Text style={styles.setDefaultBtnText}>Set as Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleEdit(addr)}
                      style={styles.editAddressBtn}
                    >
                      <Edit2 size={16} color={colors.primary} />
                      <Text style={styles.editAddressText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(addr.id)}
                      style={styles.deleteAddressBtn}
                    >
                      <Trash2 size={16} color="#FF4444" />
                      <Text style={styles.deleteAddressText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}

            <Button
              title="Add Another Address"
              onPress={() => {
                setEditingId(null);
                setEditingAddress(null);
                setShowAddAddress(true);
              }}
              style={styles.addButton}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    alignSelf: 'center',
    width: '100%',
  },
  addressCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  addressCardContent: {
    padding: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  defaultIndicator: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  setDefaultBtn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setDefaultBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  editAddressBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    gap: 6,
  },
  editAddressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteAddressBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    gap: 6,
  },
  deleteAddressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF4444',
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 30,
  },
});