import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Get status bar height for different platforms
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
const BOTTOM_SAFE_AREA = Platform.OS === 'ios' ? 34 : 0;

interface CarouselSlide {
  id: number;
  backgroundImage: any;
  title: string;
  description: string;
}

const OnboardingCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const slides: CarouselSlide[] = [
    {
      id: 1,
      backgroundImage: require('../assets/onboarding1.png'),
      title: 'Welcome to Our Platform',
      description: 'Discover amazing features designed to enhance your experience',
    },
    {
      id: 2,
      backgroundImage: require('../assets/onboarding2.png'),
      title: 'Seamless Integration',
      description: 'Connect effortlessly with all your favorite tools and services',
    },
    {
      id: 3,
      backgroundImage: require('../assets/onboarding3.png'),
      title: 'Real-time Collaboration',
      description: 'Work together in real-time with your team members anywhere',
    },
    {
      id: 4,
      backgroundImage: require('../assets/onboarding2.png'),
      title: 'Advanced Analytics',
      description: 'Gain insights with powerful analytics and detailed reports',
    },
    {
      id: 5,
      backgroundImage: require('../assets/onboarding3.png'),
      title: 'Get Started Now',
      description: 'Begin your journey with us today',
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
  };

  const handleSkip = () => {
    // Navigate to consumer signup screen
    router.push('/auth/signup');
  };

  const isLastSlide = currentSlide === slides.length - 1;
  const currentSlideData = slides[currentSlide];

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      
      {/* Background container that extends beyond safe area */}
      <View style={styles.backgroundContainer}>
        <ImageBackground
          source={currentSlideData.backgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        
        {/* Dark Overlay - Full screen including all safe areas */}
        <View style={styles.overlay} />
      </View>

      {/* Skip/Get Started Button - Top Right */}
      <TouchableOpacity
        onPress={handleSkip}
        style={styles.skipButton}
        activeOpacity={0.7}
      >
        <Text style={styles.skipButtonText}>
          {isLastSlide ? 'Get Started' : 'Skip'}
        </Text>
      </TouchableOpacity>

      {/* Content Container - Moved closer to bottom */}
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {currentSlideData.title}
          </Text>
          <Text style={styles.description}>
            {currentSlideData.description}
          </Text>
        </View>
      </View>

      {/* Dot Indicators */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            style={[
              styles.dot,
              index === currentSlide && styles.activeDot,
            ]}
            activeOpacity={0.7}
            accessibilityLabel={`Go to slide ${index + 1}`}
          />
        ))}
      </View>

      {/* Play/Pause Button */}
      <TouchableOpacity
        onPress={() => setIsAutoPlay(!isAutoPlay)}
        style={styles.playPauseButton}
        activeOpacity={0.7}
        accessibilityLabel={isAutoPlay ? 'Pause carousel' : 'Play carousel'}
      >
        <Text style={styles.playPauseButtonText}>
          {isAutoPlay ? '❚❚' : '▶'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Background container that extends beyond safe area
  backgroundContainer: {
    position: 'absolute',
    top: -STATUSBAR_HEIGHT,
    bottom: -BOTTOM_SAFE_AREA,
    left: 0,
    right: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? STATUSBAR_HEIGHT + 20 : 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 120 + BOTTOM_SAFE_AREA, // Account for bottom safe area
    paddingTop: Platform.OS === 'ios' ? STATUSBAR_HEIGHT + 20 : 40,
  },
  textContainer: {
    maxWidth: width * 0.8,
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 20,
    color: '#f1f1f1',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    lineHeight: 28,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 60 + BOTTOM_SAFE_AREA, // Account for bottom safe area
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    width: 32,
    backgroundColor: '#fff',
  },
  playPauseButton: {
    position: 'absolute',
    bottom: 50 + BOTTOM_SAFE_AREA, // Account for bottom safe area
    right: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  playPauseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OnboardingCarousel;
