import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  backgroundColor: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to Our App',
    description: 'Discover amazing features and capabilities designed for you.',
    image: 'https://via.placeholder.com/300x300?text=Welcome',
    backgroundColor: '#FF6B6B',
  },
  {
    id: 2,
    title: 'Easy to Use',
    description: 'Simple and intuitive interface for seamless experience.',
    image: 'https://via.placeholder.com/300x300?text=Easy',
    backgroundColor: '#4ECDC4',
  },
  {
    id: 3,
    title: 'Get Started',
    description: 'Begin your journey and unlock unlimited possibilities.',
    image: 'https://via.placeholder.com/300x300?text=Start',
    backgroundColor: '#45B7D1',
  },
];

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const navigation = useNavigation();
  const windowWidth = Dimensions.get('window').width;

  const handleNext = () => {
    if (currentSlideIndex < onboardingSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleSkip = () => {
    navigation.navigate('Home' as never);
  };

  const handleFinish = () => {
    navigation.navigate('Home' as never);
  };

  const currentSlide = onboardingSlides[currentSlideIndex];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: currentSlide.backgroundColor },
      ]}
    >
      <View style={styles.header}>
        {currentSlideIndex > 0 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}
      >
        <View style={[styles.slide, { width: windowWidth }]}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: currentSlide.image }}
              style={styles.slideImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.slideTitle}>{currentSlide.title}</Text>
            <Text style={styles.slideDescription}>
              {currentSlide.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.dotsContainer}>
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlideIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {currentSlideIndex > 0 && (
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={handlePrevious}
          >
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
        )}

        {currentSlideIndex < onboardingSlides.length - 1 && (
          <TouchableOpacity
            style={[styles.navigationButton, styles.primaryButton]}
            onPress={handleNext}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Next
            </Text>
          </TouchableOpacity>
        )}

        {currentSlideIndex === onboardingSlides.length - 1 && (
          <TouchableOpacity
            style={[styles.navigationButton, styles.primaryButton]}
            onPress={handleFinish}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Get Started
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1;
    backgroundColor: '#FF6B6B';
    justifyContent: 'space-between';
  };
  header: {
    height: 60;
    justifyContent: 'center';
    alignItems: 'flex-end';
    paddingHorizontal: 20;
  };
  skipButton: {
    paddingVertical: 8;
    paddingHorizontal: 16;
    borderRadius: 8;
    backgroundColor: 'rgba(255, 255, 255, 0.3)';
  };
  skipButtonText: {
    fontSize: 14;
    fontWeight: '600';
    color: '#FFFFFF';
  };
  scrollContent: {
    flex: 1;
    justifyContent: 'center';
    alignItems: 'center';
  };
  slide: {
    flex: 1;
    justifyContent: 'center';
    alignItems: 'center';
    paddingVertical: 40;
    paddingHorizontal: 20;
  };
  imageContainer: {
    flex: 0.5;
    justifyContent: 'center';
    alignItems: 'center';
    marginBottom: 40;
  };
  slideImage: {
    width: 250;
    height: 250;
    borderRadius: 20;
  };
  contentContainer: {
    flex: 0.5;
    justifyContent: 'flex-start';
    alignItems: 'center';
    paddingHorizontal: 20;
  };
  slideTitle: {
    fontSize: 28;
    fontWeight: '700';
    color: '#FFFFFF';
    marginBottom: 16;
    textAlign: 'center';
  };
  slideDescription: {
    fontSize: 16;
    fontWeight: '400';
    color: 'rgba(255, 255, 255, 0.9)';
    textAlign: 'center';
    lineHeight: 24;
  };
  dotsContainer: {
    flexDirection: 'row';
    justifyContent: 'center';
    alignItems: 'center';
    marginVertical: 30;
    gap: 8;
  };
  dot: {
    width: 8;
    height: 8;
    borderRadius: 4;
    backgroundColor: 'rgba(255, 255, 255, 0.4)';
  };
  activeDot: {
    width: 24;
    height: 8;
    backgroundColor: '#FFFFFF';
  };
  buttonContainer: {
    flexDirection: 'row';
    justifyContent: 'space-between';
    alignItems: 'center';
    paddingHorizontal: 20;
    paddingBottom: 30;
    gap: 12;
  };
  navigationButton: {
    flex: 1;
    paddingVertical: 14;
    paddingHorizontal: 20;
    borderRadius: 12;
    backgroundColor: 'rgba(255, 255, 255, 0.2)';
    justifyContent: 'center';
    alignItems: 'center';
    borderWidth: 1;
    borderColor: 'rgba(255, 255, 255, 0.4)';
  };
  primaryButton: {
    backgroundColor: '#FFFFFF';
    borderColor: '#FFFFFF';
  };
  buttonText: {
    fontSize: 16;
    fontWeight: '600';
    color: '#FFFFFF';
  };
  primaryButtonText: {
    color: '#FF6B6B';
  };
});
