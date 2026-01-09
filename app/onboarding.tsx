import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, NativeScrollEvent } from 'react-native';
import { Button } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { Briefcase, User, Bike, Zap } from 'lucide-react-native';


// Replace the ONBOARDING_SCREENS with image sources: 
const ONBOARDING_SCREENS = [
  {
    id: 1,
    title: 'Welcome to DELIVA',
    description: 'Fast, reliable, and affordable delivery service connecting everyone',
    image: require('@/assets/images/icon. png'),
    icon: <Zap size={80} color={colors.primary} />,
    showSkip: true,
  },
  // ... etc
];

// Then in OnboardingScreen component:
function OnboardingScreen({ screen }:  any) {
  return (
    <View style={styles.screen}>
      {screen.image && (
        <Image 
          source={screen.image} 
          style={styles.screenImage}
        />
      )}
      <View style={styles.iconContainer}>{screen.icon}</View>
      <Text style={styles.title}>{screen.title}</Text>
      <Text style={styles.description}>{screen.description}</Text>
    </View>
  );
}

// Add to styles: 
screenImage: {
  width: 280,
  height: 200,
  marginBottom: 30,
  borderRadius: 12,
}
