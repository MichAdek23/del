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
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 6,
        },
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 25 : 20,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 35,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          paddingVertical: 8,
        },
        headerShown: false,
        tabBarBackground: () => (
          <BlurView 
            intensity={80} 
            tint="light"
            style={StyleSheet.absoluteFillObject}
          >
            <View style={styles.navBackground} />
          </BlurView>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <MaterialCommunityIcons 
                name="home" 
                color={focused ? '#007AFF' : color} 
                size={focused ? 26 : size} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="new-delivery"
        options={{
          title: 'New',
          tabBarLabel: 'New',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <MaterialCommunityIcons 
                name="plus-circle" 
                color={focused ? '#007AFF' : color} 
                size={focused ? 26 : size} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="active"
        options={{
          title: 'Active',
          tabBarLabel: 'Active',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <MaterialCommunityIcons 
                name="truck-fast" 
                color={focused ? '#007AFF' : color} 
                size={focused ? 26 : size} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <MaterialCommunityIcons 
                name="history" 
                color={focused ? '#007AFF' : color} 
                size={focused ? 26 : size} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <MaterialCommunityIcons 
                name="account" 
                color={focused ? '#007AFF' : color} 
                size={focused ? 26 : size} 
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 35,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  activeIcon: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
