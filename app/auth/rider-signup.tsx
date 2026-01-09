import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, Input, Header } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';

export default function RiderSignup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vehicleType: 'bike',
    vehicleReg: '',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<any>({});

  const handleSignup = () => {
    const newErrors: any = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.vehicleReg) newErrors.vehicleReg = 'Vehicle registration is required';
    if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    router.replace('/(rider)');
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <View style={styles.container}>
      <Header title="Rider Sign Up" onBack={() => router.back()} />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Join DELIVA as a rider</Text>
        </View>

        <Input
          label="First Name"
          placeholder="Mike"
          value={formData.firstName}
          onChangeText={(text) => updateField('firstName', text)}
          error={errors.firstName}
        />

        <Input
          label="Last Name"
          placeholder="Johnson"
          value={formData.lastName}
          onChangeText={(text) => updateField('lastName', text)}
          error={errors.lastName}
        />

        <Input
          label="Email Address"
          placeholder="mike@rider.com"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          error={errors.email}
        />

        <Input
          label="Phone Number"
          placeholder="+1555555555"
          value={formData.phone}
          onChangeText={(text) => updateField('phone', text)}
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <Input
          label="Vehicle Registration"
          placeholder="REG123456"
          value={formData.vehicleReg}
          onChangeText={(text) => updateField('vehicleReg', text)}
          error={errors.vehicleReg}
        />

        <Input
          label="License Number"
          placeholder="DL123456"
          value={formData.licenseNumber}
          onChangeText={(text) => updateField('licenseNumber', text)}
          error={errors.licenseNumber}
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={formData.password}
          onChangeText={(text) => updateField('password', text)}
          secureTextEntry
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChangeText={(text) => updateField('confirmPassword', text)}
          secureTextEntry
          error={errors.confirmPassword}
        />

        <Button
          title="Create Account"
          onPress={handleSignup}
          size="large"
          style={styles.button}
        />
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  button: {
    marginTop: 24,
    marginBottom: 40,
  },
});
