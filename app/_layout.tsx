import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Animated, Easing, Platform } from 'react-native';

// Import screens
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';

// Import theme
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Animation configurations
const screenAnimationConfig = {
  cardStyleInterpolator: ({ current, layouts }: any) => {
    return {
      cardStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          },
        ],
      },
    };
  },
};

// Fade animation for modal-style screens
const fadeAnimationConfig = {
  cardStyleInterpolator: ({ current }: any) => {
    return {
      cardStyle: {
        opacity: current.progress,
      },
    };
  },
};

// Stack navigator for Home tab
const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animationEnabled: true,
        animationTypeForReplace: true,
        cardStyle: { backgroundColor: '#fff' },
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
              easing: Easing.inOut(Easing.ease),
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 250,
              easing: Easing.inOut(Easing.ease),
            },
          },
        },
        ...screenAnimationConfig,
      }}
    >
      <Stack.Screen
        name="HomeStack"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerTitleAlign: 'center',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          title: 'Details',
          headerBackTitle: 'Back',
          headerTitleAlign: 'center',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </Stack.Navigator>
  );
};

// Stack navigator for Settings tab
const SettingsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animationEnabled: true,
        cardStyle: { backgroundColor: '#fff' },
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
              easing: Easing.inOut(Easing.ease),
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 250,
              easing: Easing.inOut(Easing.ease),
            },
          },
        },
        ...screenAnimationConfig,
      }}
    >
      <Stack.Screen
        name="SettingsStack"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerTitleAlign: 'center',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerBackTitle: 'Back',
          headerTitleAlign: 'center',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </Stack.Navigator>
  );
};

// Tab Navigator with proper animation configuration
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
        },
        animationEnabled: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator with global animation configuration
const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 400,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
            },
          },
        },
      }}
    >
      <Stack.Group
        screenOptions={{
          animationEnabled: true,
          ...screenAnimationConfig,
        }}
      >
        <Stack.Screen name="Root" component={TabNavigator} />
      </Stack.Group>

      {/* Modal screens with fade animation */}
      <Stack.Group
        screenOptions={{
          presentation: 'modal',
          animationEnabled: true,
          ...fadeAnimationConfig,
        }}
      >
        {/* Add modal screens here as needed */}
      </Stack.Group>
    </Stack.Navigator>
  );
};

// Main App Layout Component
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Add any async initialization here (e.g., loading fonts, data)
        // await loadFonts();
        // await initializeApp();
        
        // Simulate app preparation
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('Error preparing app:', e);
      } finally {
        setIsReady(true);
      }
    };

    prepareApp();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
          <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Text component import (if not already imported)
import { Text } from 'react-native';