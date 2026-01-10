import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Image, Animated, Easing, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';

export default function Splash() {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const delivaOpacity = useRef(new Animated.Value(0)).current;
  const [delivaText, setDelivaText] = useState('');
  const fullText = 'deliva';
  const typingSpeed = 100; // ms per character

  useEffect(() => {
    // Step 1: Show m.png logo with animation
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

    // Step 2: After showing logo for 1.5 seconds, fade it out
    const fadeOutTimer = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Step 3: After logo fades out, show deliva with typing effect
        Animated.timing(delivaOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        
        // Typewriter effect for "deliva"
        let i = 0;
        const typeWriter = () => {
          if (i < fullText.length) {
            setDelivaText(fullText.substring(0, i + 1));
            i++;
            setTimeout(typeWriter, typingSpeed);
          }
        };
        typeWriter();
      });
    }, 1500);

    // Step 4: Navigate after total animation sequence
    const navigateTimer = setTimeout(() => {
      router.replace('/onboarding');
    }, 3500); // Total: 1.5s (logo) + 0.5s (fade) + 0.6s (typing) + 0.9s (pause) = 3.5s

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(navigateTimer);
    };
  }, [logoOpacity, logoScale, delivaOpacity]);

  const animatedLogoStyle = {
    opacity: logoOpacity,
    transform: [{ scale: logoScale }],
  };

  const animatedDelivaStyle = {
    opacity: delivaOpacity,
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

      {/* m.png Logo - Will fade out */}
      <Animated.View style={[styles.brandContainer, animatedLogoStyle]}>
        <Image
          source={require('@/assets/images/m.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* deliva Text - Will appear after logo fades out */}
      <Animated.View style={[styles.delivaContainer, animatedDelivaStyle]}>
        <Text style={styles.delivaText}>
          {delivaText}
          <Text style={styles.cursor}>|</Text>
        </Text>
      </Animated.View>
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
  brandContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  brandLogo: {
    width: 250, // Increased from 150
    height: 250, // Increased from 50 - adjust based on your image aspect ratio
  },
  delivaContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  delivaText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  cursor: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '300',
    opacity: 0.8,
  },
});
