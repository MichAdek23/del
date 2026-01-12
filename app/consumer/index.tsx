import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar, Animated, PanResponder, Alert, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { Button, Input } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { Plus, MapPin, Package, Clock, User, X, Calendar, CreditCard, MessageSquare, Settings, ArrowRight, Star, Phone, Navigation, ChevronUp, ChevronDown, Maximize2, Minimize2, Check, Search, Locate, Target, Route, Home, Building, Navigation as NavIcon } from 'lucide-react-native';
import { mockConsumer, mockDeliveries } from '@/constants/mockData';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const QUICK_ACTIONS_HEIGHT = height * 0.35;
const MINIMIZED_HEIGHT = 70;
const SHEET_HALF_HEIGHT = Platform.OS === 'ios' ? height * 0.5 : height * 0.55;
const SHEET_FULL_HEIGHT = Platform.OS === 'ios' ? height * 0.85 : height * 0.9;

// OpenStreetMap Nominatim API for geocoding
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
// OSRM API for routing (road distance)
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

const PLACE_TYPES = {
  residential: ['house', 'home', 'apartment', 'residence'],
  commercial: ['office', 'business', 'company', 'store', 'shop', 'mall'],
  landmark: ['hotel', 'restaurant', 'hospital', 'school', 'university', 'park'],
};

interface LocationSuggestion {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  type: string;
  icon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export default function ConsumerHome() {
  const mapRef = useRef<MapView>(null);
  const [user] = useState(mockConsumer);
  const [activeSheet, setActiveSheet] = useState(null);
  const [sheetAnimation] = useState(new Animated.Value(height));
  const [panY] = useState(new Animated.Value(0));
  const [sheetHeight, setSheetHeight] = useState(SHEET_HALF_HEIGHT);
  const [isSheetFullScreen, setIsSheetFullScreen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const quickActionsHeight = useRef(new Animated.Value(MINIMIZED_HEIGHT)).current;
  const quickActionsDragY = useRef(new Animated.Value(0)).current;
  const activeDeliveries = mockDeliveries.filter((d) => d.status !== 'delivered');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for better experience');
        setIsLoadingLocation(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        
        // Animate to user location
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  const focusOnUserLocation = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const sheetPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,
    onPanResponderMove: (_, g) => panY.setValue(g.dy),
    onPanResponderRelease: (_, g) => {
      if (g.dy > 50) isSheetFullScreen ? minimizeToHalfScreen() : closeSheet();
      else if (g.dy < -50) !isSheetFullScreen && expandToFullScreen();
      else Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
    },
  });

  const quickActionsPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => quickActionsDragY.setValue(0),
    onPanResponderMove: (_, g) => {
      if ((isQuickActionsOpen && g.dy > 0) || (!isQuickActionsOpen && g.dy < 0)) {
        quickActionsDragY.setValue(g.dy);
      }
    },
    onPanResponderRelease: (_, g) => {
      const d = Math.abs(g.dy);
      if (d > 50 || Math.abs(g.vy) > 0.5) g.dy < 0 ? openQuickActions() : closeQuickActions();
      else isQuickActionsOpen ? openQuickActions() : closeQuickActions();
      quickActionsDragY.setValue(0);
    },
  });

  const expandToFullScreen = () => {
    setIsSheetFullScreen(true);
    setSheetHeight(SHEET_FULL_HEIGHT);
    Animated.spring(sheetAnimation, { toValue: height - SHEET_FULL_HEIGHT, useNativeDriver: true, tension: 60, friction: 7 }).start(() => panY.setValue(0));
  };

  const minimizeToHalfScreen = () => {
    setIsSheetFullScreen(false);
    setSheetHeight(SHEET_HALF_HEIGHT);
    Animated.spring(sheetAnimation, { toValue: height - SHEET_HALF_HEIGHT, useNativeDriver: true, tension: 60, friction: 7 }).start(() => panY.setValue(0));
  };

  const toggleSheetFullScreen = () => isSheetFullScreen ? minimizeToHalfScreen() : expandToFullScreen();
  const openQuickActions = () => {
    setIsQuickActionsOpen(true);
    Animated.spring(quickActionsHeight, { toValue: QUICK_ACTIONS_HEIGHT, useNativeDriver: false, tension: 50, friction: 8 }).start();
  };

  const closeQuickActions = () => {
    setIsQuickActionsOpen(false);
    Animated.spring(quickActionsHeight, { toValue: MINIMIZED_HEIGHT, useNativeDriver: false, tension: 50, friction: 8 }).start();
  };

  const openSheet = (name) => {
    setActiveSheet(name);
    setIsSheetFullScreen(false);
    setSheetHeight(SHEET_HALF_HEIGHT);
    closeQuickActions();
    Animated.spring(sheetAnimation, { toValue: height - SHEET_HALF_HEIGHT, useNativeDriver: true, tension: 60, friction: 7 }).start();
  };

  const closeSheet = () => {
    Animated.spring(sheetAnimation, { toValue: height, useNativeDriver: true, tension: 60, friction: 7 }).start(() => {
      setActiveSheet(null);
      panY.setValue(0);
      setIsSheetFullScreen(false);
    });
  };

  React.useEffect(() => { (global as any).openModalSheet = (name: string) => openSheet(name); }, []);

  const renderSheetContent = () => {
    switch (activeSheet) {
      case 'newDelivery': return <NewDeliverySheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} mapRef={mapRef} userLocation={userLocation} />;
      case 'tracking': return <TrackingSheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} mapRef={mapRef} />;
      case 'packages': return <PackagesSheet closeSheet={closeSheet} deliveries={activeDeliveries} isFullScreen={isSheetFullScreen} />;
      case 'schedule': return <ScheduleSheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} />;
      case 'profile': return <ProfileSheet closeSheet={closeSheet} user={user} isFullScreen={isSheetFullScreen} />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          zoomControlEnabled={true}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={true}
          loadingIndicatorColor="#007AFF"
          loadingBackgroundColor="#ffffff"
        >
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="Your Location"
              description="You are here"
            >
              <View style={styles.userMarker}>
                <View style={styles.userMarkerInner}>
                  <Locate size={16} color="#fff" />
                </View>
              </View>
            </Marker>
          )}
        </MapView>
        
        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlButton} onPress={focusOnUserLocation}>
            <Target size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControlButton} onPress={() => mapRef.current?.animateToRegion(mapRegion, 500)}>
            <Navigation size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.safeArea, Platform.OS === 'android' && styles.safeAreaAndroid, Platform.OS === 'ios' && styles.safeAreaIos]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      <Animated.View style={[styles.quickActionsSheet, { height: Animated.add(quickActionsHeight, quickActionsDragY) }]}>
        <TouchableOpacity style={styles.quickActionsToggle} onPress={() => isQuickActionsOpen ? closeQuickActions() : openQuickActions()} activeOpacity={0.8} {...quickActionsPanResponder.panHandlers}>
          <View style={styles.toggleBar} />
          <Text style={styles.toggleText}>Quick Actions</Text>
          {isQuickActionsOpen ? <ChevronDown size={20} color="#666" /> : <ChevronUp size={20} color="#666" />}
        </TouchableOpacity>

        <Animated.View style={[styles.quickActionsContent, { opacity: quickActionsHeight.interpolate({ inputRange: [MINIMIZED_HEIGHT, MINIMIZED_HEIGHT + 10], outputRange: [0, 1], extrapolate: 'clamp' }) }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.quickActionsScrollContent}>
            <TouchableOpacity style={styles.newDeliveryButton} onPress={() => openSheet('newDelivery')} activeOpacity={0.8}>
              <Plus size={24} color="#fff" />
              <Text style={styles.newDeliveryText}>New Delivery</Text>
            </TouchableOpacity>
            <View style={styles.quickActionRow}>
              {[{ icon: Navigation, label: 'Track', sheet: 'tracking' }, { icon: Package, label: 'Packages', sheet: 'packages' }, { icon: Calendar, label: 'Schedule', sheet: 'schedule' }, { icon: User, label: 'Profile', sheet: 'profile' }].map((item, i) => (
                <TouchableOpacity key={i} style={styles.quickActionButton} onPress={() => openSheet(item.sheet)} activeOpacity={0.8}>
                  <View style={styles.quickActionIcon}><item.icon size={24} color="#007AFF" /></View>
                  <Text style={styles.quickActionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>

      {activeSheet && <Animated.View style={[{ opacity: sheetAnimation.interpolate({ inputRange: [height - SHEET_FULL_HEIGHT, height - SHEET_HALF_HEIGHT], outputRange: [1, 0.7], extrapolate: 'clamp' }) }]}><TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeSheet} activeOpacity={1} /></Animated.View>}

      <Animated.View style={[styles.sheetContainer, { height: sheetHeight, maxHeight: height - MINIMIZED_HEIGHT, transform: [{ translateY: Animated.add(sheetAnimation, Animated.multiply(panY, 0.5)) }] }]} {...sheetPanResponder.panHandlers}>
        <View style={styles.sheetHandle}>
          <View style={styles.handleBar} />
          <TouchableOpacity style={styles.fullScreenToggle} onPress={toggleSheetFullScreen}>
            {isSheetFullScreen ? <Minimize2 size={20} color="#666" /> : <Maximize2 size={20} color="#666" />}
          </TouchableOpacity>
        </View>
        <View style={styles.sheetContent}>{renderSheetContent()}</View>
      </Animated.View>
    </View>
  );
}

function NewDeliverySheet({ closeSheet, isFullScreen, mapRef, userLocation }: any) {
  const [formData, setFormData] = useState({ 
    from: '', 
    to: '', 
    packageType: '', 
    description: '', 
    weight: '', 
    recipientName: '', 
    recipientContact: '',
    fromLat: 0,
    fromLng: 0,
    toLat: 0,
    toLng: 0,
  });
  const [deliveryCreated, setDeliveryCreated] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<LocationSuggestion[]>([]);
  const [toSuggestions, setToSuggestions] = useState<LocationSuggestion[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [distance, setDistance] = useState(0);
  const [routeCoords, setRouteCoords] = useState<Array<{latitude: number, longitude: number}>>([]);
  const [isLoadingFrom, setIsLoadingFrom] = useState(false);
  const [isLoadingTo, setIsLoadingTo] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const generateTrackingId = () => `DEL${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.length < 3) return [];
    
    try {
      const response = await fetch(
        `${NOMINATIM_API}?format=json&q=${encodeURIComponent(query + ', Lagos, Nigeria')}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      return data.map((item: any) => ({
        name: item.name || item.display_name.split(',')[0],
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type,
        icon: item.icon,
        address: item.address || {},
      }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleFromChange = debounce(async (text: string) => {
    setFormData(prev => ({ ...prev, from: text }));
    if (text.length < 3) {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
      return;
    }
    
    setIsLoadingFrom(true);
    const suggestions = await searchLocations(text);
    setFromSuggestions(suggestions);
    setShowFromSuggestions(suggestions.length > 0);
    setIsLoadingFrom(false);
  }, 500);

  const handleToChange = debounce(async (text: string) => {
    setFormData(prev => ({ ...prev, to: text }));
    if (text.length < 3) {
      setToSuggestions([]);
      setShowToSuggestions(false);
      return;
    }
    
    setIsLoadingTo(true);
    const suggestions = await searchLocations(text);
    setToSuggestions(suggestions);
    setShowToSuggestions(suggestions.length > 0);
    setIsLoadingTo(false);
  }, 500);

  const calculateRoute = async (lat1: number, lng1: number, lat2: number, lng2: number) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return;
    
    setIsCalculatingRoute(true);
    try {
      const response = await fetch(
        `${OSRM_API}/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const roadDistance = route.distance / 1000; // Convert meters to kilometers
        setDistance(parseFloat(roadDistance.toFixed(2)));
        
        // Extract coordinates for the polyline
        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        setRouteCoords(coordinates);
        
        // Animate map to show the route
        if (mapRef.current) {
          const bounds = {
            minLat: Math.min(lat1, lat2),
            maxLat: Math.max(lat1, lat2),
            minLng: Math.min(lng1, lng2),
            maxLng: Math.max(lng1, lng2),
          };
          
          const latitudeDelta = (bounds.maxLat - bounds.minLat) * 1.5;
          const longitudeDelta = (bounds.maxLng - bounds.minLng) * 1.5;
          
          mapRef.current.animateToRegion({
            latitude: (bounds.minLat + bounds.maxLat) / 2,
            longitude: (bounds.minLng + bounds.maxLng) / 2,
            latitudeDelta: Math.max(latitudeDelta, 0.01),
            longitudeDelta: Math.max(longitudeDelta, 0.01),
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      // Fallback to straight-line distance
      const straightDistance = calculateStraightDistance(lat1, lng1, lat2, lng2);
      setDistance(straightDistance);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const calculateStraightDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(2));
  };

  const selectFromLocation = (location: LocationSuggestion) => {
    setFormData(prev => ({ 
      ...prev, 
      from: location.display_name, 
      fromLat: location.lat, 
      fromLng: location.lon 
    }));
    setShowFromSuggestions(false);
    setFromSuggestions([]);
    
    // Add marker to map
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.lat,
        longitude: location.lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
    
    // Calculate route if destination is already selected
    if (formData.toLat && formData.toLng) {
      calculateRoute(location.lat, location.lon, formData.toLat, formData.toLng);
    }
  };

  const selectToLocation = (location: LocationSuggestion) => {
    setFormData(prev => ({ 
      ...prev, 
      to: location.display_name, 
      toLat: location.lat, 
      toLng: location.lon 
    }));
    setShowToSuggestions(false);
    setToSuggestions([]);
    
    // Add marker to map
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.lat,
        longitude: location.lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
    
    // Calculate route if pickup is already selected
    if (formData.fromLat && formData.fromLng) {
      calculateRoute(formData.fromLat, formData.fromLng, location.lat, location.lon);
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setFormData(prev => ({
        ...prev,
        from: 'Current Location',
        fromLat: userLocation.latitude,
        fromLng: userLocation.longitude,
      }));
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...userLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    }
  };

  const handleCreateDelivery = () => {
    if (!formData.from || !formData.to || !formData.recipientName || !formData.recipientContact) {
      Alert.alert('Error', 'Please fill in all required fields and select locations');
      return;
    }
    setTrackingId(generateTrackingId());
    setDeliveryCreated(true);
  };

  // Render markers and route on the main map
  useEffect(() => {
    if (mapRef.current && (formData.fromLat || formData.toLat)) {
      // Clear previous route and markers
      setRouteCoords([]);
      
      // Calculate new route if both locations are set
      if (formData.fromLat && formData.fromLng && formData.toLat && formData.toLng) {
        calculateRoute(formData.fromLat, formData.fromLng, formData.toLat, formData.toLng);
      }
    }
  }, [formData.fromLat, formData.fromLng, formData.toLat, formData.toLng]);

  if (deliveryCreated) {
    return (
      <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
        <View style={sheetStyles.header}>
          <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Delivery Created</Text>
          <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={sheetStyles.successContainer}>
            <View style={sheetStyles.checkmarkCircle}><Check size={40} color="#fff" /></View>
            <Text style={sheetStyles.successTitle}>Delivery Request Sent!</Text>
            <View style={sheetStyles.trackingCard}>
              <Text style={sheetStyles.trackingLabel}>Tracking Number</Text>
              <Text style={sheetStyles.trackingNumber}>{trackingId}</Text>
            </View>
            <View style={sheetStyles.summaryCard}>
              <Text style={sheetStyles.summaryTitle}>Delivery Summary</Text>
              <View style={sheetStyles.summaryRow}><Text style={sheetStyles.summaryLabel}>From:</Text><Text style={sheetStyles.summaryValue}>{formData.from.split(',')[0]}</Text></View>
              <View style={sheetStyles.summaryRow}><Text style={sheetStyles.summaryLabel}>To:</Text><Text style={sheetStyles.summaryValue}>{formData.to.split(',')[0]}</Text></View>
              <View style={sheetStyles.summaryRow}><Text style={sheetStyles.summaryLabel}>Road Distance:</Text><Text style={sheetStyles.summaryValue}>{distance} km</Text></View>
              <View style={sheetStyles.summaryRow}><Text style={sheetStyles.summaryLabel}>Recipient:</Text><Text style={sheetStyles.summaryValue}>{formData.recipientName}</Text></View>
            </View>
            <Button title="Track Delivery" onPress={() => { closeSheet(); (global as any).openModalSheet('tracking'); }} variant="primary" style={sheetStyles.submitButton} />
            <Button title="Done" onPress={closeSheet} variant="outline" style={sheetStyles.submitButton} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>New Delivery</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={isFullScreen && sheetStyles.fullScreenScroll}>
        <Text style={sheetStyles.sectionLabel}>Pickup Details</Text>
        <View style={sheetStyles.inputContainer}>
          <View style={sheetStyles.inputWithButton}>
            <Input 
              label="Pickup Address" 
              placeholder="Enter pickup location" 
              value={formData.from}
              onChangeText={handleFromChange}
              icon={<MapPin size={20} color="#666" />}
            />
            <TouchableOpacity 
              style={sheetStyles.currentLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Locate size={18} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {isLoadingFrom && <ActivityIndicator size="small" color="#007AFF" style={sheetStyles.loadingIndicator} />}
          {showFromSuggestions && fromSuggestions.length > 0 && (
            <FlatList 
              data={fromSuggestions}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => selectFromLocation(item)} 
                  style={sheetStyles.suggestionItem}
                >
                  <View style={sheetStyles.suggestionIcon}>
                    {item.type === 'house' || item.type === 'residential' ? (
                      <Home size={16} color="#007AFF" />
                    ) : item.type === 'commercial' ? (
                      <Building size={16} color="#007AFF" />
                    ) : (
                      <MapPin size={16} color="#007AFF" />
                    )}
                  </View>
                  <View style={sheetStyles.suggestionContent}>
                    <Text style={sheetStyles.suggestionTitle}>{item.name}</Text>
                    <Text style={sheetStyles.suggestionAddress} numberOfLines={1}>
                      {item.address.road ? `${item.address.road}, ` : ''}
                      {item.address.suburb || ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
        
        <Text style={sheetStyles.sectionLabel}>Delivery Details</Text>
        <View style={sheetStyles.inputContainer}>
          <Input 
            label="Delivery Address" 
            placeholder="Enter delivery location" 
            value={formData.to}
            onChangeText={handleToChange}
            icon={<MapPin size={20} color="#666" />}
          />
          {isLoadingTo && <ActivityIndicator size="small" color="#007AFF" style={sheetStyles.loadingIndicator} />}
          {showToSuggestions && toSuggestions.length > 0 && (
            <FlatList 
              data={toSuggestions}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => selectToLocation(item)} 
                  style={sheetStyles.suggestionItem}
                >
                  <View style={sheetStyles.suggestionIcon}>
                    {item.type === 'house' || item.type === 'residential' ? (
                      <Home size={16} color="#007AFF" />
                    ) : item.type === 'commercial' ? (
                      <Building size={16} color="#007AFF" />
                    ) : (
                      <MapPin size={16} color="#007AFF" />
                    )}
                  </View>
                  <View style={sheetStyles.suggestionContent}>
                    <Text style={sheetStyles.suggestionTitle}>{item.name}</Text>
                    <Text style={sheetStyles.suggestionAddress} numberOfLines={1}>
                      {item.address.road ? `${item.address.road}, ` : ''}
                      {item.address.suburb || ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {(distance > 0 || isCalculatingRoute) && (
          <View style={sheetStyles.distanceCard}>
            <View style={sheetStyles.distanceHeader}>
              <Route size={20} color="#007AFF" />
              <Text style={sheetStyles.distanceLabel}>Estimated Road Distance</Text>
            </View>
            {isCalculatingRoute ? (
              <ActivityIndicator size="small" color="#007AFF" style={sheetStyles.routeLoading} />
            ) : (
              <Text style={sheetStyles.distanceValue}>{distance} km</Text>
            )}
          </View>
        )}
        
        <View style={sheetStyles.row}>
          <View style={sheetStyles.halfInput}>
            <Input 
              label="Recipient Name" 
              placeholder="Full name" 
              value={formData.recipientName} 
              onChangeText={(t) => setFormData(prev => ({ ...prev, recipientName: t }))} 
              icon={<User size={20} color="#666" />} 
            />
          </View>
          <View style={sheetStyles.halfInput}>
            <Input 
              label="Contact Number" 
              placeholder="Phone number" 
              value={formData.recipientContact} 
              onChangeText={(t) => setFormData(prev => ({ ...prev, recipientContact: t }))} 
              icon={<Phone size={20} color="#666" />} 
              keyboardType="phone-pad" 
            />
          </View>
        </View>
        
        <Text style={sheetStyles.sectionLabel}>Package Information</Text>
        <Input 
          label="Package Type" 
          placeholder="e.g., Document, Parcel, Food" 
          value={formData.packageType} 
          onChangeText={(t) => setFormData(prev => ({ ...prev, packageType: t }))} 
          icon={<Package size={20} color="#666" />} 
        />
        <Input 
          label="Description" 
          placeholder="Describe your package" 
          value={formData.description} 
          onChangeText={(t) => setFormData(prev => ({ ...prev, description: t }))} 
          multiline 
          numberOfLines={3} 
        />
        <Input 
          label="Weight (kg)" 
          placeholder="Approximate weight" 
          value={formData.weight} 
          onChangeText={(t) => setFormData(prev => ({ ...prev, weight: t }))} 
          keyboardType="numeric" 
        />
        
        <View style={sheetStyles.buttonRow}>
          <Button title="Cancel" onPress={closeSheet} style={sheetStyles.cancelButton} />
          <Button title="Create Delivery" onPress={handleCreateDelivery} variant="primary" style={sheetStyles.submitButton} disabled={isCalculatingRoute} />
        </View>
      </ScrollView>
      
      {/* Render route on main map */}
      {routeCoords.length > 0 && (
        <Polyline
          coordinates={routeCoords}
          strokeColor="#007AFF"
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
        />
      )}
      
      {/* Render markers on main map */}
      {formData.fromLat && formData.fromLng && (
        <Marker
          coordinate={{ latitude: formData.fromLat, longitude: formData.fromLng }}
          title="Pickup Location"
          pinColor="#FF9500"
        />
      )}
      
      {formData.toLat && formData.toLng && (
        <Marker
          coordinate={{ latitude: formData.toLat, longitude: formData.toLng }}
          title="Delivery Location"
          pinColor="#34C759"
        />
      )}
    </View>
  );
}

// Add this helper function at the top level
function calculateStraightDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(2));
}

// Update the TrackingSheet function to include mapRef parameter
function TrackingSheet({ closeSheet, isFullScreen, mapRef }: any) {
  // ... rest of the TrackingSheet code remains the same
  // Just add the mapRef parameter to the function signature
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mapContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  map: { flex: 1 },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  safeArea: { flex: 1 },
  safeAreaIos: { paddingTop: 10 },
  safeAreaAndroid: { paddingTop: StatusBar.currentHeight || 0, paddingBottom: 10 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Platform.OS === 'ios' ? 100 : 80 },
  quickActionsSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10, overflow: 'hidden', zIndex: 50 },
  quickActionsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', minHeight: MINIMIZED_HEIGHT },
  toggleBar: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, marginRight: 8 },
  toggleText: { fontSize: 16, fontWeight: '600', color: '#000', textAlign: 'center', flex: 1 },
  quickActionsContent: { flex: 1 },
  quickActionsScrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  newDeliveryButton: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, marginBottom: 16, gap: 8 },
  newDeliveryText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  quickActionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionButton: { flex: 1, alignItems: 'center', padding: 10 },
  quickActionIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0, 122, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionText: { fontSize: 12, fontWeight: '600', color: '#000' },
  sheetContainer: { position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10, zIndex: 100 },
  sheetHandle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  handleBar: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2 },
  fullScreenToggle: { position: 'absolute', right: 20, padding: 8 },
  sheetContent: { flex: 1 },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  userMarkerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapControls: {
    position: 'absolute',
    top: 80,
    right: 16,
    gap: 12,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

const sheetStyles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  fullScreenContainer: { paddingTop: 10 },
  fullScreenScroll: { paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#000' },
  fullScreenTitle: { fontSize: 28 },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: '#f5f5f5' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#666', marginTop: 16, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  halfInput: { flex: 1 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelButton: { flex: 1 },
  submitButton: { flex: 2, marginTop: 20 },
  successContainer: { alignItems: 'center', paddingVertical: 20 },
  checkmarkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#000', marginBottom: 8, textAlign: 'center' },
  trackingCard: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 20, width: '100%', alignItems: 'center' },
  trackingLabel: { fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  trackingNumber: { fontSize: 24, fontWeight: '700', color: '#007AFF', marginBottom: 12, fontFamily: 'Courier New', letterSpacing: 2 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, width: '100%', borderWidth: 1, borderColor: '#f0f0f0' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  summaryLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
  summaryValue: { fontSize: 13, fontWeight: '600', color: '#000', flex: 1, textAlign: 'right', paddingLeft: 10 },
  trackingContainer: { flex: 1, padding: 20 },
  trackButton: { marginTop: 20 },
  trackingIdCard: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 20, alignItems: 'center' },
  trackingIdLabel: { fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  trackingIdNumber: { fontSize: 20, fontWeight: '700', color: '#007AFF', fontFamily: 'Courier New', letterSpacing: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#000', marginTop: 20, marginBottom: 12 },
  driverCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#f0f0f0', alignItems: 'center' },
  driverAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  driverAvatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 4 },
  ratingStars: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 4 },
  vehicleInfo: { fontSize: 12, color: '#666', marginBottom: 4 },
  etaText: { fontSize: 13, fontWeight: '600', color: '#007AFF' },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  contactButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 10, gap: 8 },
  contactButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  messageButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 122, 255, 0.1)', paddingVertical: 12, borderRadius: 10, gap: 8, borderWidth: 1, borderColor: '#007AFF' },
  messageButtonText: { color: '#007AFF', fontWeight: '600', fontSize: 14 },
  progressStep: { flexDirection: 'row', marginBottom: 16 },
  progressDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#ddd', marginRight: 16, marginTop: 2 },
  completedDot: { backgroundColor: '#007AFF' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 2 },
  stepTime: { fontSize: 12, color: '#666' },
  packageItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  packageIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 122, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  packageInfo: { flex: 1 },
  packageTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  packageStatus: { fontSize: 12, color: '#666' },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  profileName: { fontSize: 24, fontWeight: '700', color: '#000', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#666' },
  menuSection: { marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuText: { fontSize: 16, color: '#000', flex: 1, marginLeft: 12 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  inputContainer: { marginBottom: 16, position: 'relative' },
  inputWithButton: { flexDirection: 'row', alignItems: 'center' },
  currentLocationButton: {
    position: 'absolute',
    right: 10,
    top: 35,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  loadingIndicator: { marginTop: 8, alignSelf: 'center' },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: { flex: 1 },
  suggestionTitle: { fontSize: 14, fontWeight: '600', color: '#000' },
  suggestionAddress: { fontSize: 12, color: '#666', marginTop: 2 },
  distanceCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  distanceLabel: { fontSize: 12, color: '#666', fontWeight: '600' },
  distanceValue: { fontSize: 24, fontWeight: '700', color: '#007AFF' },
  routeLoading: { marginTop: 8 },
});

// Make sure to export the function
export { calculateStraightDistance };