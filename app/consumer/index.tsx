import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar, Animated, PanResponder, Alert, FlatList, ActivityIndicator, Linking } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Button, Input } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { Plus, MapPin, Package, Clock, User, X, Calendar, CreditCard, MessageSquare, Settings, ArrowRight, Star, Phone, Navigation, ChevronUp, ChevronDown, Maximize2, Minimize2, Check, Search, Locate, Target, Route, Home, Building } from 'lucide-react-native';
import { mockConsumer, mockDeliveries } from '@/constants/mockData';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const QUICK_ACTIONS_HEIGHT = height * 0.35;
const MINIMIZED_HEIGHT = 70;
const SHEET_HALF_HEIGHT = Platform.OS === 'ios' ? height * 0.5 : height * 0.55;
const SHEET_FULL_HEIGHT = Platform.OS === 'ios' ? height * 0.85 : height * 0.9;

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
  const [activeSheet, setActiveSheet] = useState<any>(null);
  const [sheetAnimation] = useState(new Animated.Value(height));
  const [panY] = useState(new Animated.Value(0));
  const [sheetHeight, setSheetHeight] = useState(SHEET_HALF_HEIGHT);
  const [isSheetFullScreen, setIsSheetFullScreen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const quickActionsHeight = useRef(new Animated.Value(MINIMIZED_HEIGHT)).current;
  const quickActionsDragY = useRef(new Animated.Value(0)).current;
  const activeDeliveries = mockDeliveries.filter((d) => d.status !== 'delivered');
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  // read-only mapRegion; do NOT pass as controlled `region` to MapView
  const [mapRegion, setMapRegion] = useState<any>({
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Map state to show on the MapView
  const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [pickupMarker, setPickupMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deliveryMarker, setDeliveryMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number>(0);

  // pick-on-map mode & handler registration
  const [selectMode, setSelectMode] = useState<'pickup' | 'delivery' | null>(null);
  const mapPickHandlerRef = useRef<null | ((payload: any) => void)>(null);

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

        // Animate to user location once (initial)
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

  const openSheet = (name: string) => {
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

  // register/unregister mechanism for sheet -> parent map pick communication
  const registerMapPickHandler = (fn: ((payload: any) => void) | null) => {
    mapPickHandlerRef.current = fn;
  };

  // handle long-press only when in selectMode
  const handleMapLongPress = async (e: any) => {
    if (!selectMode) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;

    let address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    try {
      const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (rev && rev.length > 0) {
        const p = rev[0];
        const namePart = p.name ? p.name : '';
        const streetPart = p.street ? `, ${p.street}` : '';
        const cityPart = p.city ? `, ${p.city}` : '';
        address = `${namePart}${streetPart}${cityPart}`.trim();
      }
    } catch (err) {
      console.warn('Reverse geocode failed', err);
    }

    // notify registered handler in sheet
    mapPickHandlerRef.current && mapPickHandlerRef.current({ type: selectMode, latitude, longitude, address });

    // update parent markers
    if (selectMode === 'pickup') {
      setPickupMarker({ latitude, longitude });
    } else {
      setDeliveryMarker({ latitude, longitude });
    }

    // if both markers exist compute straight-line preview
    const a = selectMode === 'pickup' ? { latitude, longitude } : pickupMarker;
    const b = selectMode === 'delivery' ? { latitude, longitude } : deliveryMarker;
    if (a && b) {
      setRouteCoords([{ latitude: a.latitude, longitude: a.longitude }, { latitude: b.latitude, longitude: b.longitude }]);
      const d = calculateStraightDistance(a.latitude, a.longitude, b.latitude, b.longitude);
      setCalculatedDistance(d);
      mapPickHandlerRef.current && mapPickHandlerRef.current({ type: 'both', distance: d });
    }

    setSelectMode(null);
  };

  const onRouteUpdateFromSheet = (payload: { routeCoords?: any[], distance?: number, from?: {lat:number,lng:number}, to?: {lat:number,lng:number} }) => {
    if (payload.routeCoords) setRouteCoords(payload.routeCoords);
    if (payload.from) setPickupMarker({ latitude: payload.from.lat, longitude: payload.from.lng });
    if (payload.to) setDeliveryMarker({ latitude: payload.to.lat, longitude: payload.to.lng });
    if (typeof payload.distance === 'number') setCalculatedDistance(payload.distance);
  };

  const renderSheetContent = () => {
    switch (activeSheet) {
      case 'newDelivery': return <NewDeliverySheet
        closeSheet={closeSheet}
        isFullScreen={isSheetFullScreen}
        mapRef={mapRef}
        userLocation={userLocation}
        onRouteUpdate={onRouteUpdateFromSheet}
        setSelectMode={setSelectMode}
        registerMapPickHandler={registerMapPickHandler}
      />;
      case 'tracking': return <TrackingSheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} mapRef={mapRef} />;
      case 'packages': return <PackagesSheet closeSheet={closeSheet} deliveries={activeDeliveries} isFullScreen={isSheetFullScreen} />;
      case 'schedule': return <ScheduleSheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} />;
      case 'profile': return <ProfileSheet closeSheet={closeSheet} user={user} isFullScreen={isSheetFullScreen} />;
      default: return null;
    }
  };

  // open native maps directions (Apple / Google)
  const openNativeMapsDirections = async (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
    if (![fromLat, fromLng, toLat, toLng].every(v => v !== null && v !== undefined)) return;
    const saddr = `${fromLat},${fromLng}`;
    const daddr = `${toLat},${toLng}`;
    if (Platform.OS === 'ios') {
      const url = `http://maps.apple.com/?saddr=${encodeURIComponent(saddr)}&daddr=${encodeURIComponent(daddr)}&dirflg=d`;
      try { await Linking.openURL(url); } catch (err) { console.warn('Open Apple Maps failed', err); }
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(saddr)}&destination=${encodeURIComponent(daddr)}&travelmode=driving`;
      try { await Linking.openURL(url); } catch (err) { console.warn('Open Google Maps failed', err); }
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
          onRegionChangeComplete={(region) => setMapRegion(region)}
          onLongPress={handleMapLongPress}
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

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#007AFF"
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {pickupMarker && (
            <Marker
              coordinate={pickupMarker}
              title="Pickup Location"
              pinColor="#FF9500"
            />
          )}

          {deliveryMarker && (
            <Marker
              coordinate={deliveryMarker}
              title="Delivery Location"
              pinColor="#34C759"
            />
          )}
        </MapView>

        <View style={styles.mapControls} pointerEvents="box-none">
          <TouchableOpacity style={styles.mapControlButton} onPress={focusOnUserLocation}>
            <Target size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControlButton} onPress={() => mapRef.current?.animateToRegion(mapRegion, 500)}>
            <Navigation size={20} color="#007AFF" />
          </TouchableOpacity>

          {pickupMarker && deliveryMarker && (
            <TouchableOpacity style={[styles.mapControlButton, { marginTop: 10 }]} onPress={() => openNativeMapsDirections(pickupMarker.latitude, pickupMarker.longitude, deliveryMarker.latitude, deliveryMarker.longitude)}>
              <Route size={18} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.safeArea, Platform.OS === 'android' && styles.safeAreaAndroid, Platform.OS === 'ios' && styles.safeAreaIos]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      <Animated.View
        style={[styles.quickActionsSheet, { height: Animated.add(quickActionsHeight, quickActionsDragY) }]}
        pointerEvents={isQuickActionsOpen ? 'auto' : 'box-none'}
      >
        <TouchableOpacity
          style={styles.quickActionsToggle}
          onPress={() => isQuickActionsOpen ? closeQuickActions() : openQuickActions()}
          activeOpacity={0.8}
          {...quickActionsPanResponder.panHandlers}
        >
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

      <Animated.View
        style={[styles.sheetContainer, { height: sheetHeight, maxHeight: height - MINIMIZED_HEIGHT, transform: [{ translateY: Animated.add(sheetAnimation, Animated.multiply(panY, 0.5)) }] }]}
        pointerEvents={activeSheet ? 'auto' : 'box-none'}
        {...sheetPanResponder.panHandlers}
      >
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

/* ---------------------------
   NewDeliverySheet (map-pick + reverse geocode + straight-line preview)
   --------------------------- */
function NewDeliverySheet({ closeSheet, isFullScreen, mapRef, userLocation, onRouteUpdate, setSelectMode, registerMapPickHandler }: any) {
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
  const [distance, setDistance] = useState(0);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  useEffect(() => {
    registerMapPickHandler && registerMapPickHandler((payload: any) => {
      if (!payload) return;
      if (payload.type === 'pickup') {
        setFormData(prev => {
          const updated = { ...prev, from: payload.address || `${payload.latitude}, ${payload.longitude}`, fromLat: payload.latitude, fromLng: payload.longitude };
          onRouteUpdate && onRouteUpdate({ from: { lat: updated.fromLat, lng: updated.fromLng }, routeCoords: (updated.toLat && updated.toLng) ? [{ latitude: updated.fromLat, longitude: updated.fromLng }, { latitude: updated.toLat, longitude: updated.toLng }] : [], distance });
          return updated;
        });
      } else if (payload.type === 'delivery') {
        setFormData(prev => {
          const updated = { ...prev, to: payload.address || `${payload.latitude}, ${payload.longitude}`, toLat: payload.latitude, toLng: payload.longitude };
          onRouteUpdate && onRouteUpdate({ to: { lat: updated.toLat, lng: updated.toLng }, routeCoords: (updated.fromLat && updated.fromLng) ? [{ latitude: updated.fromLat, longitude: updated.fromLng }, { latitude: updated.toLat, longitude: updated.toLng }] : [], distance });
          return updated;
        });
      } else if (payload.type === 'both' && typeof payload.distance === 'number') {
        setDistance(payload.distance);
      }
    });

    return () => registerMapPickHandler && registerMapPickHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateTrackingId = () => `DEL${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      const lat = userLocation.latitude;
      const lng = userLocation.longitude;
      setFormData(prev => {
        const updated = { ...prev, from: 'Current Location', fromLat: lat, fromLng: lng };
        onRouteUpdate && onRouteUpdate({ from: { lat, lng }, routeCoords: (updated.toLat && updated.toLng) ? [{ latitude: lat, longitude: lng }, { latitude: updated.toLat, longitude: updated.toLng }] : [], distance });
        if (updated.toLat && updated.toLng) {
          const straight = calculateStraightDistance(lat, lng, updated.toLat, updated.toLng);
          setDistance(straight);
          onRouteUpdate && onRouteUpdate({ from: { lat, lng }, to: { lat: updated.toLat, lng: updated.toLng }, distance: straight, routeCoords: [{ latitude: lat, longitude: lng }, { latitude: updated.toLat, longitude: updated.toLng }] });
        }
        mapRef?.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 800);
        return updated;
      });
    } else {
      Alert.alert('Location', 'User location unavailable');
    }
  };

  useEffect(() => {
    const { fromLat, fromLng, toLat, toLng } = formData;
    if (fromLat && fromLng && toLat && toLng) {
      setIsCalculatingRoute(true);
      const straight = calculateStraightDistance(fromLat, fromLng, toLat, toLng);
      setDistance(straight);
      onRouteUpdate && onRouteUpdate({ routeCoords: [{ latitude: fromLat, longitude: fromLng }, { latitude: toLat, longitude: toLng }], distance: straight, from: { lat: fromLat, lng: fromLng }, to: { lat: toLat, lng: toLng } });
      setIsCalculatingRoute(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.fromLat, formData.fromLng, formData.toLat, formData.toLng]);

  const handleCreateDelivery = () => {
    if (!formData.from || !formData.to || !formData.recipientName || !formData.recipientContact) {
      Alert.alert('Error', 'Please fill in all required fields and select locations');
      return;
    }
    setTrackingId(generateTrackingId());
    setDeliveryCreated(true);
  };

  const openNativeMapsDirections = async () => {
    if (formData.fromLat && formData.fromLng && formData.toLat && formData.toLng) {
      const saddr = `${formData.fromLat},${formData.fromLng}`;
      const daddr = `${formData.toLat},${formData.toLng}`;
      if (Platform.OS === 'ios') {
        const url = `http://maps.apple.com/?saddr=${encodeURIComponent(saddr)}&daddr=${encodeURIComponent(daddr)}&dirflg=d`;
        try { await Linking.openURL(url); } catch (err) { console.warn(err); }
      } else {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(saddr)}&destination=${encodeURIComponent(daddr)}&travelmode=driving`;
        try { await Linking.openURL(url); } catch (err) { console.warn(err); }
      }
    } else {
      Alert.alert('Directions', 'Please set both pickup and delivery locations first');
    }
  };

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
              <View style={sheetStyles.summaryRow}><Text style={sheetStyles.summaryLabel}>Straight Distance:</Text><Text style={sheetStyles.summaryValue}>{distance} km</Text></View>
              <View style={sheetStyles.summaryRow}><Text style={sheetStyles.summaryLabel}>Recipient:</Text><Text style={sheetStyles.summaryValue}>{formData.recipientName}</Text></View>
            </View>
            <Button title="Open Directions" onPress={openNativeMapsDirections} variant="primary" style={sheetStyles.submitButton} />
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
              placeholder="Enter pickup location or pick on map"
              value={formData.from}
              onChangeText={(txt: string) => setFormData(prev => ({ ...prev, from: txt }))}
              icon={<MapPin size={20} color="#666" />}
            />
            <TouchableOpacity
              style={sheetStyles.currentLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Locate size={18} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 8, flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => { setSelectMode && setSelectMode('pickup'); Alert.alert('Pick on map', 'Long-press on the map to choose pickup location'); }}>
              <Text style={{ color: '#007AFF', fontWeight: '700' }}>Pick pickup on map</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={sheetStyles.sectionLabel}>Delivery Details</Text>
        <View style={sheetStyles.inputContainer}>
          <Input
            label="Delivery Address"
            placeholder="Enter delivery location or pick on map"
            value={formData.to}
            onChangeText={(txt: string) => setFormData(prev => ({ ...prev, to: txt }))}
            icon={<MapPin size={20} color="#666" />}
          />
          <View style={{ marginTop: 8, flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => { setSelectMode && setSelectMode('delivery'); Alert.alert('Pick on map', 'Long-press on the map to choose delivery location'); }}>
              <Text style={{ color: '#007AFF', fontWeight: '700' }}>Pick delivery on map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {(distance > 0 || isCalculatingRoute) && (
          <View style={sheetStyles.distanceCard}>
            <View style={sheetStyles.distanceHeader}>
              <Route size={20} color="#007AFF" />
              <Text style={sheetStyles.distanceLabel}>Estimated Straight-line Distance</Text>
            </View>
            {isCalculatingRoute ? (
              <ActivityIndicator size="small" color="#007AFF" style={sheetStyles.routeLoading} />
            ) : (
              <Text style={sheetStyles.distanceValue}>{distance} km</Text>
            )}
            {(formData.fromLat && formData.fromLng && formData.toLat && formData.toLng) && (
              <TouchableOpacity style={{ marginTop: 10 }} onPress={openNativeMapsDirections}>
                <Text style={{ color: '#007AFF', fontWeight: '700' }}>Open turn-by-turn directions in Maps</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={sheetStyles.row}>
          <View style={sheetStyles.halfInput}>
            <Input
              label="Recipient Name"
              placeholder="Full name"
              value={formData.recipientName}
              onChangeText={(t: string) => setFormData(prev => ({ ...prev, recipientName: t }))}
              icon={<User size={20} color="#666" />}
            />
          </View>
          <View style={sheetStyles.halfInput}>
            <Input
              label="Contact Number"
              placeholder="Phone number"
              value={formData.recipientContact}
              onChangeText={(t: string) => setFormData(prev => ({ ...prev, recipientContact: t }))}
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
          onChangeText={(t: string) => setFormData(prev => ({ ...prev, packageType: t }))}
          icon={<Package size={20} color="#666" />}
        />
        <Input
          label="Description"
          placeholder="Describe your package"
          value={formData.description}
          onChangeText={(t: string) => setFormData(prev => ({ ...prev, description: t }))}
          multiline
          numberOfLines={3}
        />
        <Input
          label="Weight (kg)"
          placeholder="Approximate weight"
          value={formData.weight}
          onChangeText={(t: string) => setFormData(prev => ({ ...prev, weight: t }))}
          keyboardType="numeric"
        />

        <View style={sheetStyles.buttonRow}>
          <Button title="Cancel" onPress={closeSheet} style={sheetStyles.cancelButton} />
          <Button title="Create Delivery" onPress={handleCreateDelivery} variant="primary" style={sheetStyles.submitButton} disabled={isCalculatingRoute} />
        </View>
      </ScrollView>
    </View>
  );
}

// Haversine helper
function calculateStraightDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(2));
}

// TrackingSheet placeholder
function TrackingSheet({ closeSheet, isFullScreen, mapRef }: any) {
  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Track Delivery</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>
      <View style={{ padding: 20 }}>
        <Text style={{ marginBottom: 12 }}>Enter a tracking number to view status and live location on the map.</Text>
        <Input label="Tracking Number" placeholder="Tracking ID" onChangeText={() => { }} icon={<Search size={18} color="#666" />} />
        <Button title="Track" onPress={() => Alert.alert('Tracking', 'Tracking functionality placeholder')} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
}

// Packages, Schedule, Profile placeholders
function PackagesSheet({ closeSheet, deliveries, isFullScreen }: any) {
  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Packages</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>
      <ScrollView>
        {deliveries.map((d: any, idx: number) => (
          <View key={idx} style={sheetStyles.packageItem}>
            <View style={sheetStyles.packageIcon}><Package size={20} color="#007AFF" /></View>
            <View style={sheetStyles.packageInfo}>
              <Text style={sheetStyles.packageTitle}>{d.title || 'Package'}</Text>
              <Text style={sheetStyles.packageStatus}>{d.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ScheduleSheet({ closeSheet, isFullScreen }: any) {
  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Schedule</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>
      <View style={{ padding: 20 }}>
        <Text>Schedule placeholder content.</Text>
      </View>
    </View>
  );
}

function ProfileSheet({ closeSheet, user, isFullScreen }: any) {
  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Profile</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>
      <ScrollView>
        <View style={sheetStyles.profileHeader}>
          <View style={sheetStyles.profileAvatar}><Text style={sheetStyles.avatarText}>{(user?.name || 'U').charAt(0)}</Text></View>
          <Text style={sheetStyles.profileName}>{user?.name || 'User'}</Text>
          <Text style={sheetStyles.profileEmail}>{user?.email || 'you@example.com'}</Text>
        </View>
        <View style={sheetStyles.menuSection}>
          <TouchableOpacity style={sheetStyles.menuItem}><Text style={sheetStyles.menuText}>Settings</Text><Settings size={18} color="#666" /></TouchableOpacity>
          <TouchableOpacity style={sheetStyles.menuItem}><Text style={sheetStyles.menuText}>Payments</Text><CreditCard size={18} color="#666" /></TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* Styles (complete) */
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

  /* Sheet styles */
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },

  /* keep rest sheetStyles separate */
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
});

/* export helper in case other modules import it */
export { calculateStraightDistance };
