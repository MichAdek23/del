import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground,
  Dimensions,
  SafeAreaView 
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface CarouselSlide {
  id: number;
  backgroundImage: any; // Use require() for images
  title: string;
  description: string;
}

const OnboardingCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const slides: CarouselSlide[] = [
    {
      id: 1,
      backgroundImage: require('../assets/onboarding1.png'), // You'll need to update these paths
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
      backgroundImage: require('/images/onboarding/slide-4.jpg'),
      title: 'Advanced Analytics',
      description: 'Gain insights with powerful analytics and detailed reports',
    },
    {
      id: 5,
      backgroundImage: require('/images/onboarding/slide-5.jpg'),
      title: 'Get Started Now',
      description: 'Begin your journey with us today',
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length]);

  // Handle keyboard navigation - Removed in React Native as it's web-specific
  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === 'ArrowLeft') {
  //       goToPrevious();
  //     } else if (e.key === 'ArrowRight') {
  //       goToNext();
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // }, []);

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlay(false);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
  };

  const resumeAutoPlay = () => {
    setIsAutoPlay(true);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      {/* Carousel Slide */}
      <ImageBackground
        source={currentSlideData.backgroundImage}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        {/* Dark Overlay for better text readability */}
        <View style={styles.overlay} />

        {/* Content Container */}
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

        {/* Navigation Buttons */}
        <TouchableOpacity
          onPress={goToPrevious}
          style={styles.navButtonLeft}
          activeOpacity={0.7}
          accessibilityLabel="Previous slide"
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToNext}
          style={styles.navButtonRight}
          activeOpacity={0.7}
          accessibilityLabel="Next slide"
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>

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

        {/* Slide Counter */}
        <View style={styles.slideCounter}>
          <Text style={styles.slideCounterText}>
            {currentSlide + 1} / {slides.length}
          </Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageBackground: {
    width: width,
    height: height,
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textContainer: {
    maxWidth: width * 0.8,
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
  navButtonLeft: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  navButtonRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 60,
    left: '50%',
    marginLeft: -(15 * 2.5), // Approximate center
    flexDirection: 'row',
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
    bottom: 50,
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
  slideCounter: {
    position: 'absolute',
    top: 50,
    right: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20,
  },
  slideCounterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default OnboardingCarousel;
