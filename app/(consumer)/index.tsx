import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  SafeAreaView
} from 'react-native';
import { Button, Card } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { Plus, Zap, MapPin, Package, Clock, User, Home, TruckFast, History, X } from 'lucide-react-native';
import { mockConsumer, mockDeliveries } from '@/constants/mockData';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

export default function ConsumerHome() {
  const [user] = useState(mockConsumer);
  const [showWelcome, setShowWelcome] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const activeDeliveries = mockDeliveries.filter((d) => d.status !== 'delivered');

  const handleCloseWelcome = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowWelcome(false));
  };

  const region = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const markers = [
    { id: 1, latitude: 37.78825, longitude: -122.4324, title: 'Current Location' },
    { id: 2, latitude: 37.76825, longitude: -122.4224, title: 'Package Pickup' },
    { id: 3, latitude: 37.77825, longitude: -122.4424, title: 'Delivery Destination' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      
      {/* Live Map Background */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsTraffic={true}
          showsBuildings={true}
          zoomEnabled={true}
          scrollEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          {markers.map(marker => (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={marker.title}
              pinColor="#007AFF"
            />
          ))}
        </MapView>
        
        {/* Dark Overlay for readability */}
        <View style={styles.mapOverlay} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Welcome Notification */}
        {showWelcome && (
          <Animated.View style={[styles.welcomeCard, { opacity: fadeAnim }]}>
            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeTitle}>Hello, {user.firstName}!</Text>
              <Text style={styles.welcomeSubtitle}>Ready to send or receive?</Text>
            </View>
            <TouchableOpacity onPress={handleCloseWelcome} style={styles.closeButton}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </Animated.View>
        )}

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Button
              title="New Delivery"
              onPress={() => router.push('/(consumer)/create-delivery')}
              size="large"
              style={styles.fullButton}
              icon={<Plus size={20} color="#fff" />}
              variant="primary"
            />
            
            <View style={styles.quickActionRow}>
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                  <MapPin size={24} color="#007AFF" />
                </View>
                <Text style={styles.quickActionText}>Track</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                  <Package size={24} color="#007AFF" />
                </View>
                <Text style={styles.quickActionText}>Packages</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                  <Clock size={24} color="#007AFF" />
                </View>
                <Text style={styles.quickActionText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Deliveries Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Deliveries</Text>
              {activeDeliveries.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{activeDeliveries.length}</Text>
                </View>
              )}
            </View>
            {activeDeliveries.length > 0 ? (
              activeDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onPress={() => router.push(`/(consumer)/delivery/${delivery.id}`)}
                />
              ))
            ) : (
              <Card variant="light">
                <View style={styles.emptyCard}>
                  <Package size={40} color="#666" />
                  <Text style={styles.emptyText}>No active deliveries</Text>
                  <Text style={styles.emptySubtext}>Create your first delivery to get started</Text>
                </View>
              </Card>
            )}
          </View>

          {/* Saved Addresses Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            <Card variant="light">
              {user.savedAddresses.map((addr) => (
                <TouchableOpacity key={addr.id} style={styles.addressItem}>
                  <View style={styles.addressIcon}>
                    <MapPin size={16} color="#007AFF" />
                  </View>
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressLabel}>{addr.label}</Text>
                    <Text style={styles.addressText}>{addr.street}</Text>
                    <Text style={styles.addressText}>
                      {addr.city}, {addr.state} {addr.zipCode}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>

          {/* Extra space for bottom navigation */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function DeliveryCard({ delivery, onPress }: any) {
  return (
    <Card variant="light" onPress={onPress} style={styles.deliveryCard}>
      <View style={styles.deliveryContent}>
        <View style={styles.deliveryIcon}>
          <Package size={24} color="#007AFF" />
        </View>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryTitle}>{delivery.packageDescription}</Text>
          <View style={styles.deliveryMeta}>
            <Text style={styles.deliveryStatus}>{delivery.status.toUpperCase()}</Text>
            <Text style={styles.deliveryCost}>${delivery.estimatedCost.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.deliveryArrow}>
          <Zap size={20} color="#007AFF" />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapContainer: {
    position: 'absolute',
    top: -STATUSBAR_HEIGHT,
    bottom: -80, // Extra space for curved navigation
    left: 0,
    right: 0,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  safeArea: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  fullButton: {
    width: '100%',
    marginBottom: 16,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -5,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  deliveryCard: {
    marginBottom: 12,
  },
  deliveryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  deliveryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deliveryCost: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  deliveryArrow: {
    paddingLeft: 12,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 1,
  },
});
