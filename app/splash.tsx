import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';

export default function Splash() {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [logoOpacity, logoScale]);

  const animatedLogoStyle = {
    opacity: logoOpacity,
    transform: [{ scale: logoScale }],
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapBackground}>
        <Svg width="100%" height="100%" viewBox="0 0 400 800">
          {[...Array(50)].map((_, i) => (
            <Circle
              key={i}
              cx={Math.random() * 400}
              cy={Math.random() * 800}
              r={Math.random() * 3 + 1}
              fill="rgba(255, 255, 255, 0.08)"
            />
          ))}
          {[...Array(40)].map((_, i) => (
            <Circle
              key={`line-${i}`}
              cx={Math.random() * 400}
              cy={Math.random() * 800}
              r={Math.random() * 1.5}
              fill="rgba(255, 255, 255, 0.05)"
            />
          ))}
        </Svg>
      </View>

      <View style={styles.brandContainer}>
        <Animated.View style={animatedLogoStyle}>
          <Image
            source={require('@/assets/images/m.png')}
            style={styles.brandText}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <View style={styles.logoContainer}>
        <Animated.View style={animatedLogoStyle}>
          <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3a52',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  logoContainer: {
    marginTop: 20,
    zIndex: 1,
  },
  logo: {
    width: 120,
    height: 120,
  },
  brandContainer: {
    marginBottom: 10,
    zIndex: 1,
  },
  brandText: {
    width: 150,
    height: 50,
  },
});
