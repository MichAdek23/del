import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, Input, Header } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';

export default function VendorCreateOrder() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    pickupLocation: '',
    dropoffLocation: '',
    description: '',
    specialInstructions: '',
  });
  const [errors, setErrors] = useState<any>({});

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleCreate = () => {
    const newErrors: any = {};

    if (!formData.customerName) newErrors.customerName = 'Customer name is required';
    if (!formData.customerPhone) newErrors.customerPhone = 'Customer phone is required';
    if (!formData.pickupLocation) newErrors.pickupLocation = 'Pickup location is required';
    if (!formData.dropoffLocation) newErrors.dropoffLocation = 'Dropoff location is required';
    if (!formData.description) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    router.push('/(vendor)/orders');
  };

  return (
    <View style={styles.container}>
      <Header title="Create Order" onBack={() => router.back()} />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <Input
            label="Customer Name"
            placeholder="John Doe"
            value={formData.customerName}
            onChangeText={(text) => updateField('customerName', text)}
            error={errors.customerName}
          />
          <Input
            label="Customer Phone"
            placeholder="+1234567890"
            value={formData.customerPhone}
            onChangeText={(text) => updateField('customerPhone', text)}
            keyboardType="phone-pad"
            error={errors.customerPhone}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <Input
            label="Pickup Location"
            placeholder="Your restaurant/store address"
            value={formData.pickupLocation}
            onChangeText={(text) => updateField('pickupLocation', text)}
            error={errors.pickupLocation}
          />
          <Input
            label="Dropoff Location"
            placeholder="Customer delivery address"
            value={formData.dropoffLocation}
            onChangeText={(text) => updateField('dropoffLocation', text)}
            error={errors.dropoffLocation}
          />
          <Input
            label="Order Description"
            placeholder="What are you sending? (e.g., 2 pizzas, 1 burger...)"
            value={formData.description}
            onChangeText={(text) => updateField('description', text)}
            error={errors.description}
          />
          <Input
            label="Special Instructions (Optional)"
            placeholder="Delivery notes..."
            value={formData.specialInstructions}
            onChangeText={(text) => updateField('specialInstructions', text)}
          />
        </View>

        <View style={styles.section}>
          <Button
            title="Create Order"
            onPress={handleCreate}
            size="large"
            style={styles.button}
          />
        </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  button: {
    marginBottom: 40,
  },
});
