import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  SafeAreaView,
  TextInput,
  Keyboard
} from 'react-native';
import { Input, Button } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
const BOTTOM_SAFE_AREA = Platform.OS === 'ios' ? 34 : 0;

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSendReset = () => {
    const newErrors: any = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/auth/otp-verification');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      
      <View style={styles.backgroundContainer}>
        <ImageBackground
          source={require('@/assets/onboarding1.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeAreaContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reset Password</Text>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Forgot Password?</Text>
              <Text style={styles.welcomeSubtitle}>
                No worries! We'll send you reset instructions to your email address.
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                keyboardType="email-address"
                error={errors.email}
                variant="light"
                autoCapitalize="none"
              />

              <Button
                title={isLoading ? "Sending..." : "Send Reset Link"}
                onPress={handleSendReset}
                size="large"
                style={styles.button}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
              />

              <View style={styles.alternativeContainer}>
                <Text style={styles.alternativeText}>
                  Remember your password?{' '}
                  <Text 
                    style={styles.alternativeLink}
                    onPress={() => router.back()}
                  >
                    Sign In
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
