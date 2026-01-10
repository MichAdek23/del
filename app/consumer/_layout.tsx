import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function ConsumerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarLabel: () => null,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 55,
          borderRadius: 28,
          marginHorizontal: 40,
          marginBottom: Platform.OS === 'ios' ? 20 : 15,
          shadowColor: 'transparent',
          paddingVertical: 0,
          paddingTop: 12,
        },
        headerShown: false,
        tabBarBackground: () => (
          <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFillObject}>
            <View style={styles.navBackground} />
          </BlurView>
        ),
      }}
    >
      {/* Home Screen - Your index.tsx content */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <MaterialCommunityIcons
                name="home"
                color={focused ? '#007AFF' : color}
                size={focused ? 22 : size}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <MaterialCommunityIcons
                name="history"
                color={focused ? '#007AFF' : color}
                size={focused ? 22 : size}
              />
            </View>
          ),
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  navBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  activeIcon: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
});
