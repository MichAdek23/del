import React, { useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';

export default function Splash() {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    logoScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [logoOpacity, logoScale]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

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

      <View style={styles.logoContainer}>
        <Animated.View style={animatedLogoStyle}>
          <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
        </Animated.View>
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
    marginBottom: 20,
    zIndex: 1,
  },
  logo: {
    width: 120,
    height: 120,
  },
  brandContainer: {
    marginTop: 10,
    zIndex: 1,
  },
  brandText: {
    width: 150,
    height: 50,
  },
});
