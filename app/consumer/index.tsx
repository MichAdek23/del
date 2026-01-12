// ConsumerHome.tsx
import React, { useState, useRef, useEffect } from 'react';
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
  PanResponder,
  Alert,
  ActivityIndicator,
  Linking,
  DeviceEventEmitter,
} from 'react-native';

// Mapbox
import Mapbox from '@rnmapbox/maps';

// UI & icons
import { Button, Input } from '@/components';
import { router } from 'expo-router';
import {
  Plus, MapPin, Package, User, X, Calendar, CreditCard,
  MessageSquare, Settings, ArrowRight, Phone, Navigation,
  ChevronUp, ChevronDown, Maximize2, Minimize2, Check, Search,
  Locate, Target, Route,
} from 'lucide-react-native';

import { mockConsumer, mockDeliveries } from '@/constants/mockData';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const QUICK_ACTIONS_HEIGHT = height * 0.35;
const MINIMIZED_HEIGHT = 70;
const SHEET_HALF_HEIGHT = Platform.OS === 'ios' ? height * 0.5 : height * 0.55;
const SHEET_FULL_HEIGHT = Platform.OS === 'ios' ? height * 0.85 : height * 0.9;

// -----------------------
// IMPORTANT: Mapbox setup
// 1) Install @rnmapbox/maps and configure native (expo dev build or bare RN).
// 2) Restrict token in Mapbox dashboard.
// -----------------------
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWljaGFkZWsyMyIsImEiOiJjbWlxNzBtYTEwazU1M2ZwcTZma2tmb2lvIn0.6-HyhIEjrxIeCSEqALU9EQ';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function ConsumerHome() {
  // map ref (Mapbox MapView)
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const [user] = useState(mockConsumer);
  const [activeSheet, setActiveSheet] = useState<any>(null);
  const [sheetAnimation] = useState(new Animated.Value(height));
  const [panY] = useState(new Animated.Value(0));
  const [sheetHeight, setSheetHeight] = useState(SHEET_HALF_HEIGHT);
  const [isSheetFullScreen, setIsSheetFullScreen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const quickActionsHeight = useRef(new Animated.Value(MINIMIZED_HEIGHT)).current;
  const quickActionsDragY = useRef(new Animated.Value(0)).current;

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<any>({
    // fallback center Lagos
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // deliveries state
  const [deliveries, setDeliveries] = useState<any[]>(mockDeliveries || []);

  // drivers pool (mock)
  const drivers = [
    { id: 'DRV001', name: 'John Smith', phone: '+1 555-234-5678' },
    { id: 'DRV002', name: 'Mike Johnson', phone: '+1 555-987-6543' },
    { id: 'DRV003', name: 'Sarah Williams', phone: '+1 555-111-2222' },
  ];

  // map visuals
  const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [pickupMarker, setPickupMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deliveryMarker, setDeliveryMarker] = useState<{ latitude: number; longitude: number } | null>(null);

  // Persisted new-delivery form (parent-controlled)
  const [newDeliveryForm, setNewDeliveryForm] = useState({
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

  // UI helpers
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);

  // pick-on-map registration
  const [selectMode, setSelectMode] = useState<'pickup' | 'delivery' | null>(null);
  const mapPickHandlerRef = useRef<null | ((payload: any) => void)>(null);
  const registerMapPickHandler = (fn: ((payload: any) => void) | null) => {
    mapPickHandlerRef.current = fn;
  };

  // request user location once
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for better experience');
        setIsLoadingLocation(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });

        // animate camera to user location
        if (mapRef.current?.setCamera) {
          mapRef.current.setCamera({
            centerCoordinate: [longitude, latitude],
            zoomLevel: 14,
            animationDuration: 1000,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  // focus on user
  const focusOnUserLocation = () => {
    if (userLocation && mapRef.current?.setCamera) {
      mapRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 14,
        animationDuration: 800,
      });
    }
  };

  // sheet pan responders (unchanged)
  const sheetPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,
    onPanResponderMove: (_, g) => panY.setValue(g.dy),
    onPanResponderRelease: (_, g) => {
      if (g.dy > 50) (isSheetFullScreen ? minimizeToHalfScreen() : closeSheet());
      else if (g.dy < -50) !isSheetFullScreen && expandToFullScreen();
      else Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
    },
  });

  const quickActionsPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => quickActionsDragY.setValue(0),
    onPanResponderMove: (_, g) => {
      if ((isQuickActionsOpen && g.dy > 0) || (!isQuickActionsOpen && g.dy < 0)) quickActionsDragY.setValue(g.dy);
    },
    onPanResponderRelease: (_, g) => {
      const d = Math.abs(g.dy);
      if (d > 50 || Math.abs(g.vy) > 0.5) (g.dy < 0 ? openQuickActions() : closeQuickActions());
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

  const toggleSheetFullScreen = () => (isSheetFullScreen ? minimizeToHalfScreen() : expandToFullScreen());
  const openQuickActions = () => { setIsQuickActionsOpen(true); Animated.spring(quickActionsHeight, { toValue: QUICK_ACTIONS_HEIGHT, useNativeDriver: false, tension: 50, friction: 8 }).start(); };
  const closeQuickActions = () => { setIsQuickActionsOpen(false); Animated.spring(quickActionsHeight, { toValue: MINIMIZED_HEIGHT, useNativeDriver: false, tension: 50, friction: 8 }).start(); };

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

  React.useEffect(() => {
    (global as any).openModalSheet = (name: string) => openSheet(name);
  }, []);

  // Map long-press: Mapbox event shape is different; remap to expected format
  const handleMapLongPress = async (e: any) => {
    // for compatibility with sheet logic, we accept either Mapbox geometry or RN maps event
    let latitude: number, longitude: number;
    if (e && e.geometry && Array.isArray(e.geometry.coordinates)) {
      const [lng, lat] = e.geometry.coordinates;
      latitude = lat; longitude = lng;
    } else if (e && e.nativeEvent && e.nativeEvent.coordinate) {
      latitude = e.nativeEvent.coordinate.latitude;
      longitude = e.nativeEvent.coordinate.longitude;
    } else {
      return;
    }

    if (!selectMode) return;

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

    // notify registered handler
    mapPickHandlerRef.current && mapPickHandlerRef.current({ type: selectMode, latitude, longitude, address });

    // update markers and persisted form values
    if (selectMode === 'pickup') {
      setPickupMarker({ latitude, longitude });
      setNewDeliveryForm(prev => ({ ...prev, from: address, fromLat: latitude, fromLng: longitude }));
    } else {
      setDeliveryMarker({ latitude, longitude });
      setNewDeliveryForm(prev => ({ ...prev, to: address, toLat: latitude, toLng: longitude }));
    }

    // if both exist, fetch road route immediately
    const a = selectMode === 'pickup' ? { latitude, longitude } : pickupMarker;
    const b = selectMode === 'delivery' ? { latitude, longitude } : deliveryMarker;
    if (a && b) {
      setRouteCoords([{ latitude: a.latitude, longitude: a.longitude }, { latitude: b.latitude, longitude: b.longitude }]);
      computeRoadDistanceAndRoute(a.latitude, a.longitude, b.latitude, b.longitude);
    }

    setSelectMode(null);
  };

  // -------------------------
  // Mapbox Directions (road distance + geometry)
  // -------------------------
  async function computeRoadDistanceAndRoute(fromLat: number, fromLng: number, toLat: number, toLng: number) {
    setIsCalculatingRoute(true);
    setRouteDistanceKm(null);

    try {
      // build Mapbox Directions API URL
      // note: Mapbox expects lng,lat pairs
      const coordsStr = `${fromLng},${fromLat};${toLng},${toLat}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsStr}?geometries=geojson&overview=full&annotations=distance&access_token=${MAPBOX_ACCESS_TOKEN}`;

      const resp = await fetch(url);
      const json = await resp.json();

      if (json && json.routes && json.routes.length > 0) {
        const route = json.routes[0];
        // distance is in meters
        const distKm = parseFloat((route.distance / 1000).toFixed(2));

        // geometry coordinates come as [lng, lat] pairs
        const coords = (route.geometry?.coordinates || []).map((c: number[]) => ({ latitude: c[1], longitude: c[0] }));
        if (coords.length > 0) setRouteCoords(coords);
        setRouteDistanceKm(distKm);
        setIsCalculatingRoute(false);
        return distKm;
      } else {
        // fallback to straight-line
        const straight = calculateStraightDistance(fromLat, fromLng, toLat, toLng);
        setRouteDistanceKm(straight);
        setRouteCoords([{ latitude: fromLat, longitude: fromLng }, { latitude: toLat, longitude: toLng }]);
        setIsCalculatingRoute(false);
        return straight;
      }
    } catch (err) {
      console.warn('Mapbox Directions failed', err);
      const straight = calculateStraightDistance(fromLat, fromLng, toLat, toLng);
      setRouteDistanceKm(straight);
      setRouteCoords([{ latitude: fromLat, longitude: fromLng }, { latitude: toLat, longitude: toLng }]);
      setIsCalculatingRoute(false);
      return straight;
    }
  }

  // -------------------------
  // Create delivery (ID + assign driver + notify messages)
  // -------------------------
  const generateTrackingId = () => `DEL${Date.now().toString(36).toUpperCase().slice(0, 8)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const handleCreateDelivery = async () => {
    const f = newDeliveryForm;
    if (!f.from || !f.to || !f.recipientName || !f.recipientContact || !f.fromLat || !f.toLat) {
      Alert.alert('Error', 'Please fill the required fields and pick both locations.');
      return;
    }

    setIsCalculatingRoute(true);
    const distanceKm = await computeRoadDistanceAndRoute(f.fromLat, f.fromLng, f.toLat, f.toLng);

    // assign driver randomly (demo)
    const assigned = drivers[Math.floor(Math.random() * drivers.length)];

    const trackingId = generateTrackingId();
    const newDelivery = {
      id: trackingId,
      title: f.packageType || 'Delivery',
      from: f.from,
      to: f.to,
      fromLat: f.fromLat,
      fromLng: f.fromLng,
      toLat: f.toLat,
      toLng: f.toLng,
      recipientName: f.recipientName,
      recipientContact: f.recipientContact,
      description: f.description,
      weight: f.weight,
      status: 'assigned',
      distanceKm,
      assignedDriver: assigned,
      createdAt: new Date().toISOString(),
    };

    // persist locally
    setDeliveries(prev => [newDelivery, ...prev]);

    // create a message thread entry and emit event so Messages page can pick up
    const msgThread = {
      id: `${Date.now()}`,
      driverName: assigned.name,
      lastMessage: `Driver ${assigned.name} assigned to your delivery ${trackingId}. Tap to chat or track.`,
      timestamp: 'just now',
      unread: 1,
      avatar: assigned.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      deliveryId: trackingId,
    };

    (global as any).MESSAGES = (global as any).MESSAGES || [];
    (global as any).MESSAGES.unshift(msgThread);
    DeviceEventEmitter.emit('newMessage', msgThread);

    // clear persisted form and visuals (only after successful create)
    setNewDeliveryForm({
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
    setPickupMarker(null);
    setDeliveryMarker(null);
    setRouteCoords([]);
    setRouteDistanceKm(null);
    setIsCalculatingRoute(false);

    Alert.alert('Delivery Created', `Your delivery ${trackingId} was created and ${assigned.name} was assigned. You can track it from Messages or Packages.`);
    closeSheet();
  };

  // register handler for compatibility (sheet <-> parent)
  useEffect(() => {
    registerMapPickHandler && registerMapPickHandler((payload: any) => { /* kept for compatibility */ });
    return () => registerMapPickHandler && registerMapPickHandler(null);
  }, []);

  // when form coords change compute route & update markers
  useEffect(() => {
    const { fromLat, fromLng, toLat, toLng } = newDeliveryForm;
    if (fromLat && fromLng && toLat && toLng) {
      computeRoadDistanceAndRoute(fromLat, fromLng, toLat, toLng);
      setPickupMarker({ latitude: fromLat, longitude: fromLng });
      setDeliveryMarker({ latitude: toLat, longitude: toLng });

      // center map roughly to midpoint
      if (mapRef.current?.setCamera) {
        const midLat = (fromLat + toLat) / 2;
        const midLng = (fromLng + toLng) / 2;
        mapRef.current.setCamera({ centerCoordinate: [midLng, midLat], zoomLevel: 11, animationDuration: 600 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newDeliveryForm.fromLat, newDeliveryForm.fromLng, newDeliveryForm.toLat, newDeliveryForm.toLng]);

  // render sheet content
  const renderSheetContent = () => {
    switch (activeSheet) {
      case 'newDelivery':
        return <NewDeliverySheet
          closeSheet={closeSheet}
          isFullScreen={isSheetFullScreen}
          mapRef={mapRef}
          userLocation={userLocation}
          form={newDeliveryForm}
          setForm={setNewDeliveryForm}
          setSelectMode={setSelectMode}
          computeRoadDistance={computeRoadDistanceAndRoute}
          handleCreateDelivery={handleCreateDelivery}
          isCalculatingRoute={isCalculatingRoute}
          routeDistanceKm={routeDistanceKm}
          registerMapPickHandler={registerMapPickHandler}
        />;
      case 'tracking':
        return <TrackingSheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} mapRef={mapRef} deliveries={deliveries} />;
      case 'packages':
        return <PackagesSheet closeSheet={closeSheet} deliveries={deliveries} isFullScreen={isSheetFullScreen} />;
      case 'schedule':
        return <ScheduleSheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} />;
      case 'profile':
        return <ProfileSheet closeSheet={closeSheet} user={user} isFullScreen={isSheetFullScreen} />;
      default:
        return null;
    }
  };

  // open native directions (unchanged)
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

  // -----------------------
  // Render main view with Mapbox MapView
  // -----------------------
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.mapContainer}>
        <Mapbox.MapView
          ref={mapRef}
          styleURL={Mapbox.StyleURL.Street}
          style={styles.map}
          onLongPress={handleMapLongPress}
          onPress={() => {
            /* optional: tap to dismiss pick mode */
            // nothing for now
          }}
        >
          {/* Camera */}
          <Mapbox.Camera
            ref={cameraRef}
            // initial center from state
            centerCoordinate={[mapRegion.longitude, mapRegion.latitude]}
            zoomLevel={12}
          />

          {/* user location */}
          <Mapbox.UserLocation visible />

          {/* route polyline (Mapbox needs geojson shape) */}
          {routeCoords.length > 0 && (
            <Mapbox.ShapeSource
              id="routeSource"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoords.map(p => [p.longitude, p.latitude]),
                },
              }}
            >
              <Mapbox.LineLayer id="routeLine" style={{ lineWidth: 4, lineColor: '#007AFF', lineCap: 'round', lineJoin: 'round' }} />
            </Mapbox.ShapeSource>
          )}

          {/* pickup marker */}
          {pickupMarker && (
            <Mapbox.PointAnnotation id="pickup" coordinate={[pickupMarker.longitude, pickupMarker.latitude]}>
              <View style={styles.userMarker}>
                <View style={styles.userMarkerInner}><Locate size={14} color="#fff" /></View>
              </View>
            </Mapbox.PointAnnotation>
          )}

          {/* delivery marker */}
          {deliveryMarker && (
            <Mapbox.PointAnnotation id="delivery" coordinate={[deliveryMarker.longitude, deliveryMarker.latitude]}>
              <View style={[styles.userMarker, { backgroundColor: 'rgba(52,199,89,0.15)', borderColor: '#34C759' }]}>
                <View style={[styles.userMarkerInner, { backgroundColor: '#34C759' }]}><Route size={12} color="#fff" /></View>
              </View>
            </Mapbox.PointAnnotation>
          )}
        </Mapbox.MapView>

        {/* floating map controls */}
        <View style={styles.mapControls} pointerEvents="box-none">
          <TouchableOpacity style={styles.mapControlButton} onPress={focusOnUserLocation}><Target size={20} color="#007AFF" /></TouchableOpacity>
          <TouchableOpacity style={styles.mapControlButton} onPress={() => {
            // re-center to mapRegion
            if (mapRef.current?.setCamera) {
              mapRef.current.setCamera({
                centerCoordinate: [mapRegion.longitude, mapRegion.latitude],
                animationDuration: 500,
              });
            }
          }}><Navigation size={20} color="#007AFF" /></TouchableOpacity>

          {pickupMarker && deliveryMarker && (
            <TouchableOpacity style={[styles.mapControlButton, { marginTop: 10 }]} onPress={() => openNativeMapsDirections(pickupMarker.latitude, pickupMarker.longitude, deliveryMarker.latitude, deliveryMarker.longitude)}>
              <Route size={18} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* overlay that should let taps pass through where empty */}
      <View
        style={[styles.safeArea, Platform.OS === 'android' && styles.safeAreaAndroid, Platform.OS === 'ios' && styles.safeAreaIos]}
        pointerEvents="box-none"
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} pointerEvents="box-none">
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Quick actions sheet */}
      <Animated.View style={[styles.quickActionsSheet, { height: Animated.add(quickActionsHeight, quickActionsDragY) }]} pointerEvents={isQuickActionsOpen ? 'auto' : 'box-none'}>
        <TouchableOpacity style={styles.quickActionsToggle} onPress={() => isQuickActionsOpen ? closeQuickActions() : openQuickActions()} activeOpacity={0.8} {...quickActionsPanResponder.panHandlers}>
          <View style={styles.toggleBar} />
          <Text style={styles.toggleText}>Quick Actions</Text>
          {isQuickActionsOpen ? <ChevronDown size={20} color="#666" /> : <ChevronUp size={20} color="#666" />}
        </TouchableOpacity>

        <Animated.View style={[styles.quickActionsContent, { opacity: quickActionsHeight.interpolate({ inputRange: [MINIMIZED_HEIGHT, MINIMIZED_HEIGHT + 10], outputRange: [0, 1], extrapolate: 'clamp' }) }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.quickActionsScrollContent}>
            <TouchableOpacity style={styles.newDeliveryButton} onPress={() => openSheet('newDelivery')} activeOpacity={0.9}>
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

      {/* Backdrop when sheet open */}
      {activeSheet && (
        <Animated.View pointerEvents="auto" style={[{ opacity: sheetAnimation.interpolate({ inputRange: [height - SHEET_FULL_HEIGHT, height - SHEET_HALF_HEIGHT], outputRange: [1, 0.7], extrapolate: 'clamp' }) }]}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeSheet} activeOpacity={1} />
        </Animated.View>
      )}

      {/* sheet container */}
      <Animated.View style={[styles.sheetContainer, { height: sheetHeight, maxHeight: height - MINIMIZED_HEIGHT, transform: [{ translateY: Animated.add(sheetAnimation, Animated.multiply(panY, 0.5)) }] }]} pointerEvents={activeSheet ? 'auto' : 'box-none'} {...sheetPanResponder.panHandlers}>
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
   NewDeliverySheet (parent-controlled)
   --------------------------- */
function NewDeliverySheet({
  closeSheet,
  isFullScreen,
  mapRef,
  userLocation,
  form,
  setForm,
  setSelectMode,
  computeRoadDistance,
  handleCreateDelivery,
  isCalculatingRoute,
  routeDistanceKm,
  registerMapPickHandler,
}: any) {
  useEffect(() => {
    registerMapPickHandler && registerMapPickHandler((payload: any) => {
      if (!payload) return;
      if (payload.type === 'pickup') {
        setForm((prev: any) => ({ ...prev, from: payload.address || `${payload.latitude}, ${payload.longitude}`, fromLat: payload.latitude, fromLng: payload.longitude }));
      } else if (payload.type === 'delivery') {
        setForm((prev: any) => ({ ...prev, to: payload.address || `${payload.latitude}, ${payload.longitude}`, toLat: payload.latitude, toLng: payload.longitude }));
      }
    });
    return () => registerMapPickHandler && registerMapPickHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Create Delivery</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={isFullScreen && sheetStyles.fullScreenScroll}>
        {/* Pickup */}
        <View style={sheetStyles.card}>
          <Text style={sheetStyles.cardTitle}>Pickup</Text>
          <Input label="Pickup Address" placeholder="Tap to pick or enter address" value={form.from} onChangeText={(txt: string) => setForm((p: any) => ({ ...p, from: txt }))} icon={<MapPin size={20} color="#666" />} />
          <View style={sheetStyles.cardRow}>
            <TouchableOpacity style={sheetStyles.ghostBtn} onPress={() => { setSelectMode && setSelectMode('pickup'); Alert.alert('Pick on map', 'Long-press on the map to choose pickup location'); }}>
              <Text style={sheetStyles.ghostBtnText}>Pick on map</Text>
            </TouchableOpacity>

            <TouchableOpacity style={sheetStyles.ghostBtn} onPress={() => {
              if (userLocation) {
                setForm((p: any) => ({ ...p, from: 'Current location', fromLat: userLocation.latitude, fromLng: userLocation.longitude }));
                if (mapRef.current?.setCamera) mapRef.current.setCamera({ centerCoordinate: [userLocation.longitude, userLocation.latitude], zoomLevel: 14, animationDuration: 600 });
              } else Alert.alert('Location', 'User location unavailable');
            }}>
              <Locate size={14} color="#007AFF" />
              <Text style={[sheetStyles.ghostBtnText, { marginLeft: 8 }]}>Use current</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery */}
        <View style={sheetStyles.card}>
          <Text style={sheetStyles.cardTitle}>Delivery</Text>
          <Input label="Delivery Address" placeholder="Tap to pick or enter address" value={form.to} onChangeText={(txt: string) => setForm((p: any) => ({ ...p, to: txt }))} icon={<MapPin size={20} color="#666" />} />
          <View style={sheetStyles.cardRow}>
            <TouchableOpacity style={sheetStyles.ghostBtn} onPress={() => { setSelectMode && setSelectMode('delivery'); Alert.alert('Pick on map', 'Long-press on the map to choose delivery location'); }}>
              <Text style={sheetStyles.ghostBtnText}>Pick on map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sheetStyles.ghostBtn} onPress={() => {
              if (form.toLat && form.toLng && mapRef.current?.setCamera) mapRef.current.setCamera({ centerCoordinate: [form.toLng, form.toLat], zoomLevel: 14, animationDuration: 600 });
            }}>
              <Text style={sheetStyles.ghostBtnText}>Center on delivery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Package & recipient */}
        <View style={sheetStyles.row}>
          <View style={sheetStyles.halfInput}>
            <Input label="Package Type" placeholder="e.g., Parcel, Documents" value={form.packageType} onChangeText={(t: string) => setForm((p: any) => ({ ...p, packageType: t }))} icon={<Package size={20} color="#666" />} />
          </View>
          <View style={sheetStyles.halfInput}>
            <Input label="Weight (kg)" placeholder="e.g., 2.5" value={form.weight} onChangeText={(t: string) => setForm((p: any) => ({ ...p, weight: t }))} keyboardType="numeric" />
          </View>
        </View>

        <Input label="Recipient Name" placeholder="Full name" value={form.recipientName} onChangeText={(t: string) => setForm((p: any) => ({ ...p, recipientName: t }))} icon={<User size={20} color="#666" />} />
        <Input label="Recipient Contact" placeholder="Phone number" value={form.recipientContact} onChangeText={(t: string) => setForm((p: any) => ({ ...p, recipientContact: t }))} icon={<Phone size={20} color="#666" />} keyboardType="phone-pad" />
        <Input label="Description" placeholder="Notes for the driver (optional)" value={form.description} onChangeText={(t: string) => setForm((p: any) => ({ ...p, description: t }))} multiline numberOfLines={3} />

        {/* Route preview */}
        <View style={sheetStyles.routeCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={sheetStyles.routeTitle}>Route & Distance</Text>
            {isCalculatingRoute ? <ActivityIndicator size="small" /> : <Text style={sheetStyles.routeDistance}>{routeDistanceKm !== null ? `${routeDistanceKm} km` : '—'}</Text>}
          </View>
          <Text style={sheetStyles.routeSubtitle}>{form.from ? form.from.split(',')[0] : 'Pickup'} → {form.to ? form.to.split(',')[0] : 'Delivery'}</Text>
        </View>

        <View style={sheetStyles.buttonRow}>
          <Button title="Cancel" onPress={closeSheet} style={sheetStyles.cancelButton} variant="outline" />
          <Button title="Create Delivery" onPress={handleCreateDelivery} style={sheetStyles.submitButton} variant="primary" disabled={isCalculatingRoute} />
        </View>
      </ScrollView>
    </View>
  );
}

/* TrackingSheet, PackagesSheet, ScheduleSheet, ProfileSheet */
function TrackingSheet({ closeSheet, isFullScreen, mapRef, deliveries }: any) {
  const [trackingId, setTrackingId] = useState('');
  const [found, setFound] = useState<any | null>(null);

  const handleTrack = () => {
    const d = deliveries.find((x: any) => x.id === trackingId.trim());
    if (!d) {
      Alert.alert('Not found', 'Tracking ID not found.');
      setFound(null);
      return;
    }
    setFound(d);

    // center camera to midpoint
    if (d.fromLat && d.toLat && mapRef.current?.setCamera) {
      const midLat = (d.fromLat + d.toLat) / 2;
      const midLng = (d.fromLng + d.toLng) / 2;
      mapRef.current.setCamera({ centerCoordinate: [midLng, midLat], zoomLevel: 11, animationDuration: 800 });
    }
  };

  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Track Delivery</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>

      <View style={{ padding: 20 }}>
        <Input label="Tracking Number" placeholder="DEL..." onChangeText={(t: string) => setTrackingId(t)} value={trackingId} icon={<Search size={18} color="#666" />} />
        <Button title="Track" onPress={handleTrack} style={{ marginTop: 12 }} variant="primary" />
        {found && (
          <View style={{ marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0' }}>
            <Text style={{ fontWeight: '700', fontSize: 16 }}>{found.title || 'Delivery'}</Text>
            <Text style={{ color: '#666', marginTop: 6 }}>Status: {found.status}</Text>
            <Text style={{ color: '#666' }}>Driver: {found.assignedDriver?.name || '—'}</Text>
            <Text style={{ color: '#666' }}>Distance: {found.distanceKm} km</Text>
          </View>
        )}
      </View>
    </View>
  );
}

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
              <Text style={sheetStyles.packageStatus}>{d.status} • {d.id}</Text>
            </View>
            <ArrowRight size={18} color="#666" />
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
  const handleNavigation = (routeName: string) => {
    closeSheet();
    switch (routeName) {
      case 'Payment Methods': router.push('/others/payment-methods'); break;
      case 'Saved Addresses': router.push('/others/saved-addresses'); break;
      case 'Messages': router.push('/others/messages'); break;
      case 'Settings': router.push('/others/settings'); break;
      default: router.push('/others/settings');
    }
  };

  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>My Profile</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={sheetStyles.profileHeader}>
          <View style={sheetStyles.profileAvatar}><Text style={sheetStyles.avatarText}>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</Text></View>
          <Text style={sheetStyles.profileName}>{user.firstName} {user.lastName}</Text>
          <Text style={sheetStyles.profileEmail}>{user.email}</Text>
        </View>
        <View style={sheetStyles.menuSection}>
          {[
            { label: 'Payment Methods', icon: <CreditCard size={20} color="#666" /> },
            { label: 'Saved Addresses', icon: <MapPin size={20} color="#666" /> },
            { label: 'Messages', icon: <MessageSquare size={20} color="#666" /> },
            { label: 'Settings', icon: <Settings size={20} color="#666" /> },
          ].map((item, i) => (
            <TouchableOpacity key={i} onPress={() => handleNavigation(item.label)} style={sheetStyles.menuItem} activeOpacity={0.7}>
              <View style={sheetStyles.menuItemLeft}>
                {item.icon}
                <Text style={sheetStyles.menuText}>{item.label}</Text>
              </View>
              <ArrowRight size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* Helpers */
function calculateStraightDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/* Styles (kept & extended) */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mapContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  map: { flex: 1 },
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
  mapControls: { position: 'absolute', top: 80, right: 16, gap: 12 },
  mapControlButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },

  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginTop: 8, gap: 8 },
  distanceCard: { backgroundColor: '#f0f8ff', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#007AFF' },

  inputContainer: { marginBottom: 16, position: 'relative' },
  inputWithButton: { flexDirection: 'row', alignItems: 'center' },
  currentLocationButton: { position: 'absolute', right: 10, top: 35, padding: 8, borderRadius: 20, backgroundColor: 'rgba(0, 122, 255, 0.1)' },
});

const sheetStyles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  fullScreenContainer: { paddingTop: 10 },
  fullScreenScroll: { paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#000' },
  fullScreenTitle: { fontSize: 28 },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: '#f5f5f5' },

  /* NEW card styles for prettier New Delivery UI */
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f0f0f0' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },

  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#666', marginTop: 16, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  halfInput: { flex: 1 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelButton: { flex: 1 },
  submitButton: { flex: 2, marginTop: 20 },

  ghostBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'rgba(0,122,255,0.06)' },
  ghostBtnText: { color: '#007AFF', fontWeight: '700' },

  routeCard: { marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: '#fbfcff', borderWidth: 1, borderColor: '#eef6ff' },
  routeTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  routeDistance: { fontSize: 14, fontWeight: '700', color: '#007AFF' },
  routeSubtitle: { color: '#666', marginTop: 6 },

  successContainer: { alignItems: 'center', paddingVertical: 20 },
  checkmarkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: 10 },

  packageItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingHorizontal: 4 },
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

/* export helper */
export { calculateStraightDistance };
