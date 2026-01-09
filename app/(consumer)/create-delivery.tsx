import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, Input, Header, Card } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { MapPin, Package } from 'lucide-react-native';

export default function CreateDelivery() {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    packageDescription: '',
    packageSize: 'medium',
    customerName: '',
    customerPhone: '',
    specialInstructions: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [estimatedCost, setEstimatedCost] = useState(0);

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const calculateCost = () => {
    const baseCost = 2.5;
    const distanceCost = 0.5 * 5;
    const packageCost = formData.packageSize === 'small' ? 0 : formData.packageSize === 'medium' ? 2 : 5;
    const total = baseCost + distanceCost + packageCost;
    setEstimatedCost(total);
  };

  const handleSubmit = () => {
    const newErrors: any = {};

    if (!formData.pickupLocation) newErrors.pickupLocation = 'Pickup location is required';
    if (!formData.dropoffLocation) newErrors.dropoffLocation = 'Dropoff location is required';
    if (!formData.packageDescription) newErrors.packageDescription = 'Package description is required';
    if (!formData.customerName) newErrors.customerName = 'Customer name is required';
    if (!formData.customerPhone) newErrors.customerPhone = 'Customer phone is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    router.push('/(consumer)/active');
  };

  return (
    <View style={styles.container}>
      <Header title="Create Delivery" onBack={() => router.back()} />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locations</Text>
          <LocationInput
            icon={<MapPin size={20} color={colors.primary} />}
            label="Pickup Location"
            placeholder="Enter pickup address"
            value={formData.pickupLocation}
            onChangeText={(text: string) => handleFieldChange('pickupLocation', text)}
            error={errors.pickupLocation}
          />
          <LocationInput
            icon={<MapPin size={20} color={colors.primaryDark} />}
            label="Dropoff Location"
            placeholder="Enter dropoff address"
            value={formData.dropoffLocation}
            onChangeText={(text: string) => handleFieldChange('dropoffLocation', text)}
            error={errors.dropoffLocation}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Details</Text>
          <Input
            label="Description"
            placeholder="What are you sending?"
            value={formData.packageDescription}
            onChangeText={(text) => handleFieldChange('packageDescription', text)}
            error={errors.packageDescription}
          />

          <Text style={styles.label}>Package Size</Text>
          <View style={styles.sizeButtons}>
            {['small', 'medium', 'large'].map((size) => (
              <SizeButton
                key={size}
                label={size.charAt(0).toUpperCase() + size.slice(1)}
                isSelected={formData.packageSize === size}
                onPress={() => handleFieldChange('packageSize', size)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <Input
            label="Customer Name"
            placeholder="John Doe"
            value={formData.customerName}
            onChangeText={(text) => handleFieldChange('customerName', text)}
            error={errors.customerName}
          />
          <Input
            label="Customer Phone"
            placeholder="+1234567890"
            value={formData.customerPhone}
            onChangeText={(text) => handleFieldChange('customerPhone', text)}
            keyboardType="phone-pad"
            error={errors.customerPhone}
          />
          <Input
            label="Special Instructions (Optional)"
            placeholder="Ring bell twice, handle with care..."
            value={formData.specialInstructions}
            onChangeText={(text) => handleFieldChange('specialInstructions', text)}
          />
        </View>

        <View style={styles.section}>
          <Button
            title="Calculate Cost"
            onPress={calculateCost}
            variant="secondary"
            size="large"
            style={styles.button}
          />
        </View>

        {estimatedCost > 0 && (
          <Card style={styles.costCard}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Estimated Cost</Text>
              <Text style={styles.costValue}>${estimatedCost.toFixed(2)}</Text>
            </View>
          </Card>
        )}

        <View style={styles.section}>
          <Button
            title="Confirm Delivery"
            onPress={handleSubmit}
            size="large"
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function LocationInput({ icon, label, placeholder, value, onChangeText, error }: any) {
  return (
    <View style={styles.locationInput}>
      <View style={styles.locationIcon}>{icon}</View>
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        error={error}
        style={styles.input}
      />
    </View>
  );
}

function SizeButton({ label, isSelected, onPress }: any) {
  return (
    <Button
      title={label}
      onPress={onPress}
      variant={isSelected ? 'primary' : 'secondary'}
      size="small"
      style={[styles.sizeButton, isSelected && styles.sizeButtonSelected]}
    />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  locationInput: {
    marginBottom: 12,
  },
  locationIcon: {
    position: 'absolute',
    left: 12,
    top: 32,
    zIndex: 1,
  },
  input: {
    marginBottom: 0,
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
  },
  sizeButtonSelected: {
    opacity: 1,
  },
  button: {
    marginBottom: 12,
  },
  costCard: {
    backgroundColor: colors.backgroundAlt,
    marginBottom: 24,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  costValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
});
