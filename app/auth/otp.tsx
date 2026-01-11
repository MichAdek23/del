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

export function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(interval);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOTPChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto move to next input
    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (errors.otp) setErrors({ ...errors, otp: '' });
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpString = otp.join('');
    const newErrors: any = {};

    if (otpString.length !== 6) {
      newErrors.otp = 'Please enter all 6 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/auth/reset-password');
    }, 1500);
  };

  const handleResendOTP = () => {
    setCanResend(false);
    setResendTimer(60);
    setOtp(['', '', '', '', '', '']);
    // Simulate API call to resend OTP
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
            <Text style={styles.headerTitle}>Verify Email</Text>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Enter OTP</Text>
              <Text style={styles.welcomeSubtitle}>
                We've sent a 6-digit code to your email address. Enter it below to verify your identity.
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.otpLabel}>Verification Code</Text>
              
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref: any) => inputRefs.current[index] = ref}
                    style={[
                      styles.otpInput,
                      errors.otp && styles.otpInputError
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOTPChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                    keyboardType="numeric"
                    maxLength={1}
                    placeholder="-"
                    placeholderTextColor="rgba(0, 0, 0, 0.2)"
                  />
                ))}
              </View>

              {errors.otp && (
                <Text style={styles.errorText}>{errors.otp}</Text>
              )}

              <Button
                title={isLoading ? "Verifying..." : "Verify OTP"}
                onPress={handleVerifyOTP}
                size="large"
                style={styles.button}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
              />

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity 
                  onPress={handleResendOTP}
                  disabled={!canResend}
                >
                  <Text style={[
                    styles.resendLink,
                    !canResend && styles.resendLinkDisabled
                  ]}>
                    {canResend ? 'Resend' : `Resend in ${resendTimer}s`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
