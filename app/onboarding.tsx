import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, NativeScrollEvent } from 'react-native';
import { Button } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { Briefcase, User, Bike, Zap } from 'lucide-react-native';

const ONBOARDING_SCREENS = [
  {
    id: 1,
    title: 'Welcome to DELIVA',
    description: 'Fast, reliable, and affordable delivery service connecting everyone',
    icon: <Zap size={80} color={colors.primary} />,
    showSkip: true,
  },
  {
    id: 2,
    title: 'For Vendors',
    description: 'Send your goods to customers instantly with trusted riders',
    icon: <Briefcase size={80} color={colors.primary} />,
    showSkip: false,
  },
  {
    id: 3,
    title: 'For Consumers',
    description: 'Request pickups and deliveries whenever you need them',
    icon: <User size={80} color={colors.primary} />,
    showSkip: false,
  },
  {
    id: 4,
    title: 'For Riders',
    description: 'Earn money by delivering packages on your own schedule',
    icon: <Bike size={80} color={colors.primary} />,
    showSkip: false,
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeScrollEvent) => {
    const contentOffsetX = event.contentOffset.x;
    const screenWidth = event.layoutMeasurement.width;
    const newIndex = Math.round(contentOffsetX / screenWidth);
    setCurrentIndex(newIndex);
  };

  const handleSkip = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    setCurrentIndex(ONBOARDING_SCREENS.length - 1);
  };

  const handleNext = () => {
    if (currentIndex === ONBOARDING_SCREENS.length - 1) {
      router.replace('/auth/role-selection');
    } else {
      const nextIndex = currentIndex + 1;
      const screenWidth = 375; // Approximate screen width
      scrollViewRef.current?.scrollTo?.({ x: nextIndex * screenWidth, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const currentScreen = ONBOARDING_SCREENS[currentIndex];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onScroll={(e) => handleScroll(e.nativeEvent)}
        scrollIndicatorInsets={{ right: 1 }}
        showsHorizontalScrollIndicator={false}
      >
        {ONBOARDING_SCREENS.map((screen) => (
          <OnboardingScreen key={screen.id} screen={screen} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.indicators}>
          {ONBOARDING_SCREENS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          {currentScreen.showSkip && currentIndex === 0 && (
            <Button
              title="Skip"
              onPress={handleSkip}
              variant="secondary"
              size="large"
              style={styles.button}
            />
          )}

          {currentIndex === ONBOARDING_SCREENS.length - 1 ? (
            <>
              <Button
                title="Sign Up"
                onPress={handleNext}
                size="large"
                style={styles.button}
              />
              <Button
                title="Sign In"
                onPress={handleLogin}
                variant="secondary"
                size="large"
                style={styles.button}
              />
            </>
          ) : (
            <Button
              title="Next"
              onPress={handleNext}
              size="large"
              style={styles.button}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function OnboardingScreen({ screen }: any) {
  return (
    <View style={styles.screen}>
      <View style={styles.iconContainer}>{screen.icon}</View>
      <Text style={styles.title}>{screen.title}</Text>
      <Text style={styles.description}>{screen.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  indicatorActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 0,
  },
});
