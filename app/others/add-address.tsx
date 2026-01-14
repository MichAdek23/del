import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Button, Input } from '@/components';
import { colors } from '@/constants';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';

interface AddressData {
  id?: string;
  label: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

// ==================== ADD ADDRESS PAGE ====================
export default function AddAddressPage({ onBack, initialData }: any) {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<AddressData>(
    initialData || {
      label: '',
      address: '',
      city: '',
      postalCode: '',
      isDefault: false,
    }
  );

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.label.trim()) {
      Alert.alert('Error', 'Please enter an address label (e.g., Home, Work)');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter a street address');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please enter a city');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        'Success',
        `Address ${isEditing ? 'updated' : 'saved'} successfully`,
        [
          {
            text: 'OK',
            onPress: () => {
              onBack(formData);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Address' : 'Add Address'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Box */}
        <View style={styles.infoBox}>
          <MapPin size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            {isEditing ? 'Update your address details' : 'Add a new delivery address'}
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Address Details</Text>

          <Input
            label="Address Label"
            value={formData.label}
            onChangeText={(text) =>
              setFormData({ ...formData, label: text })
            }
            placeholder="e.g., Home, Work, Apartment"
          />

          <Input
            label="Street Address"
            value={formData.address}
            onChangeText={(text) =>
              setFormData({ ...formData, address: text })
            }
            placeholder="123 Main Street, Apt 4B"
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="City"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
                placeholder="New York"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Postal Code"
                value={formData.postalCode}
                onChangeText={(text) =>
                  setFormData({ ...formData, postalCode: text })
                }
                placeholder="10001"
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Default Address Toggle */}
        <View style={styles.defaultAddressContainer}>
          <View style={styles.defaultAddressLeft}>
            <Text style={styles.defaultAddressLabel}>Set as Default</Text>
            <Text style={styles.defaultAddressSubtext}>
              Use this address by default
            </Text>
          </View>
          <Switch
            value={formData.isDefault}
            onValueChange={(val) =>
              setFormData({ ...formData, isDefault: val })
            }
            trackColor={{ false: '#ddd', true: colors.primary + '40' }}
            thumbColor={formData.isDefault ? colors.primary : '#fff'}
            style={styles.switch}
          />
        </View>

        {/* Help Text */}
        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Tips for accurate delivery:</Text>
          <Text style={styles.helpText}>
            • Include apartment or suite number if applicable{'\n'}
            • Add nearby landmarks for easier location{'\n'}
            • Make sure the postal code matches your address
          </Text>
        </View>

        <Button
          title={loading ? 'Saving...' : isEditing ? 'Update Address' : 'Save Address'}
          onPress={handleSave}
          style={styles.submitButton}
          disabled={loading}
        />
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  defaultAddressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  defaultAddressLeft: {
    flex: 1,
  },
  defaultAddressLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  defaultAddressSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  switch: {
    marginLeft: 12,
  },
  helpBox: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    padding: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 12,
    marginBottom: 30,
  },
});