// ConsumerHome.tsx with Mapbox GL JS via WebView - COMPLETE
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

import WebView from 'react-native-webview';
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

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWljaGFlZGsyMyIsImEiOiJjbWlxNzBtYTEwazU1M2ZwcTZma2tmb2lvIn0.6-HyhIEjrxIeCSEqALU9EQ';

export default function ConsumerHome() {
  const webViewRef = useRef<WebView>(null);
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
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const [deliveries, setDeliveries] = useState<any[]>(mockDeliveries || []);
  const drivers = [
    { id: 'DRV001', name: 'John Smith', phone: '+1 555-234-5678' },
    { id: 'DRV002', name: 'Mike Johnson', phone: '+1 555-987-6543' },
    { id: 'DRV003', name: 'Sarah Williams', phone: '+1 555-111-2222' },
  ];

  const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [pickupMarker, setPickupMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deliveryMarker, setDeliveryMarker] = useState<{ latitude: number; longitude: number } | null>(null);

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

  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [selectMode, setSelectMode] = useState<'pickup' | 'delivery' | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        setIsLoadingLocation(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });

        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(
            `window.userLocation = {lat: ${latitude}, lng: ${longitude}}; map.flyTo({center: [${longitude}, ${latitude}], zoom: 14});`
          );
        }
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapLongPress') {
        const { latitude, longitude, address } = data.payload;
        
        if (!selectMode) return;

        if (selectMode === 'pickup') {
          setPickupMarker({ latitude, longitude });
          setNewDeliveryForm(prev => ({ ...prev, from: address, fromLat: latitude, fromLng: longitude }));
        } else {
          setDeliveryMarker({ latitude, longitude });
          setNewDeliveryForm(prev => ({ ...prev, to: address, toLat: latitude, toLng: longitude }));
        }

        const a = selectMode === 'pickup' ? { latitude, longitude } : pickupMarker;
        const b = selectMode === 'delivery' ? { latitude, longitude } : deliveryMarker;
        if (a && b) {
          setRouteCoords([{ latitude: a.latitude, longitude: a.longitude }, { latitude: b.latitude, longitude: b.longitude }]);
          await computeRoadDistanceAndRoute(a.latitude, a.longitude, b.latitude, b.longitude);
        }

        setSelectMode(null);
      }
    } catch (error) {
      console.error('WebView message error:', error);
    }
  };

  const focusOnUserLocation = () => {
    if (userLocation && webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `map.flyTo({center: [${userLocation.longitude}, ${userLocation.latitude}], zoom: 14});`
      );
    }
  };

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

  async function computeRoadDistanceAndRoute(fromLat: number, fromLng: number, toLat: number, toLng: number) {
    setIsCalculatingRoute(true);
    setRouteDistanceKm(null);

    try {
      const coordsStr = `${fromLng},${fromLat};${toLng},${toLat}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsStr}?geometries=geojson&overview=full&annotations=distance&access_token=${MAPBOX_ACCESS_TOKEN}`;

      const resp = await fetch(url);
      const json = await resp.json();

      if (json?.routes?.[0]) {
        const route = json.routes[0];
        const distKm = parseFloat((route.distance / 1000).toFixed(2));
        const coords = (route.geometry?.coordinates || []).map((c: number[]) => ({ latitude: c[1], longitude: c[0] }));
        
        if (coords.length > 0) setRouteCoords(coords);
        setRouteDistanceKm(distKm);

        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(
            `updateRoute(${JSON.stringify(route.geometry.coordinates)});`
          );
        }

        setIsCalculatingRoute(false);
        return distKm;
      } else {
        const straight = calculateStraightDistance(fromLat, fromLng, toLat, toLng);
        setRouteDistanceKm(straight);
        setIsCalculatingRoute(false);
        return straight;
      }
    } catch (err) {
      console.warn('Route calculation failed', err);
      const straight = calculateStraightDistance(fromLat, fromLng, toLat, toLng);
      setRouteDistanceKm(straight);
      setIsCalculatingRoute(false);
      return straight;
    }
  }

  const generateTrackingId = () => `DEL${Date.now().toString(36).toUpperCase().slice(0, 8)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const handleCreateDelivery = async () => {
    const f = newDeliveryForm;
    if (!f.from || !f.to || !f.recipientName || !f.recipientContact || !f.fromLat || !f.toLat) {
      Alert.alert('Error', 'Please fill required fields and pick both locations.');
      return;
    }

    setIsCalculatingRoute(true);
    const distanceKm = await computeRoadDistanceAndRoute(f.fromLat, f.fromLng, f.toLat, f.toLng);

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

    setDeliveries(prev => [newDelivery, ...prev]);

    const msgThread = {
      id: `${Date.now()}`,
      driverName: assigned.name,
      lastMessage: `Driver ${assigned.name} assigned to delivery ${trackingId}. Tap to chat or track.`,
      timestamp: 'just now',
      unread: 1,
      avatar: assigned.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      deliveryId: trackingId,
    };

    (global as any).MESSAGES = (global as any).MESSAGES || [];
    (global as any).MESSAGES.unshift(msgThread);
    DeviceEventEmitter.emit('newMessage', msgThread);

    setNewDeliveryForm({
      from: '', to: '', packageType: '', description: '', weight: '',
      recipientName: '', recipientContact: '', fromLat: 0, fromLng: 0, toLat: 0, toLng: 0,
    });
    setPickupMarker(null);
    setDeliveryMarker(null);
    setRouteCoords([]);
    setRouteDistanceKm(null);
    setIsCalculatingRoute(false);

    Alert.alert('Delivery Created', `${trackingId} was created and assigned to ${assigned.name}.`);
    closeSheet();
  };

  const renderSheetContent = () => {
    switch (activeSheet) {
      case 'newDelivery':
        return <NewDeliverySheet
          closeSheet={closeSheet}
          isFullScreen={isSheetFullScreen}
          webViewRef={webViewRef}
          userLocation={userLocation}
          form={newDeliveryForm}
          setForm={setNewDeliveryForm}
          setSelectMode={setSelectMode}
          handleCreateDelivery={handleCreateDelivery}
          isCalculatingRoute={isCalculatingRoute}
          routeDistanceKm={routeDistanceKm}
        />;
      case 'tracking':
        return <TrackingSheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} webViewRef={webViewRef} deliveries={deliveries} />;
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

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='utf-8' />
      <title>Mapbox GL</title>
      <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />
      <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
      <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
      <style>
        * { margin: 0; padding: 0; }
        body { overflow: hidden; }
        #map { position: absolute; top: 0; bottom: 0; width: 100%; }
      </style>
    </head>
    <body>
      <div id='map'></div>
      <script>
        mapboxgl.accessToken = '${MAPBOX_ACCESS_TOKEN}';
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [3.3792, 6.5244],
          zoom: 12,
        });

        window.userLocation = null;
        let pickupMarker = null;
        let deliveryMarker = null;
        let routeSource = null;
        let lastTouchTime = 0;

        map.on('load', () => {
          console.log('Map loaded');
        });

        map.on('contextmenu', (e) => {
          e.preventDefault();
          const { lng, lat } = e.lngLat;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapLongPress',
            payload: { latitude: lat, longitude: lng, address: \`\${lat.toFixed(5)}, \${lng.toFixed(5)}\` }
          }));
        });

        document.addEventListener('touchstart', (e) => {
          lastTouchTime = Date.now();
        });

        document.addEventListener('touchend', (e) => {
          if (Date.now() - lastTouchTime > 500) {
            const touch = e.changedTouches[0];
            if (touch) {
              const canvas = map.getCanvas();
              const rect = canvas.getBoundingClientRect();
              const x = touch.clientX - rect.left;
              const y = touch.clientY - rect.top;
              
              const { lng, lat } = map.unproject([x, y]);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapLongPress',
                payload: { latitude: lat, longitude: lng, address: \`\${lat.toFixed(5)}, \${lng.toFixed(5)}\` }
              }));
            }
          }
        });

        window.updateRoute = (coordinates) => {
          if (!routeSource) {
            map.addSource('route', { 
              type: 'geojson', 
              data: { 
                type: 'Feature', 
                geometry: { type: 'LineString', coordinates: [] } 
              } 
            });
            map.addLayer({ 
              id: 'route', 
              type: 'line', 
              source: 'route', 
              layout: { 'line-join': 'round', 'line-cap': 'round' }, 
              paint: { 'line-color': '#007AFF', 'line-width': 4 } 
            });
            routeSource = true;
          }
          map.getSource('route').setData({ 
            type: 'Feature', 
            geometry: { type: 'LineString', coordinates } 
          });
        };

        window.addMarker = (lng, lat, type) => {
          const el = document.createElement('div');
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = type === 'pickup' ? 'rgba(0,122,255,0.2)' : 'rgba(52,199,89,0.15)';
          el.style.border = \`2px solid \${type === 'pickup' ? '#007AFF' : '#34C759'}\`;
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          
          if (type === 'pickup') {
            if (pickupMarker) pickupMarker.remove();
            pickupMarker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
          } else {
            if (deliveryMarker) deliveryMarker.remove();
            deliveryMarker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
          }
        };

        window.clearMarkers = () => {
          if (pickupMarker) pickupMarker.remove();
          if (deliveryMarker) deliveryMarker.remove();
          pickupMarker = null;
          deliveryMarker = null;
        };

        window.clearRoute = () => {
          if (routeSource && map.getSource('route')) {
            map.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
          }
        };
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          onMessage={handleWebViewMessage}
          style={styles.map}
          scrollEnabled={false}
          pinchZoomEnabled={true}
          javaScriptEnabled={true}
          originWhitelist={['*']}
        />

        <View style={styles.mapControls} pointerEvents="box-none">
          <TouchableOpacity style={styles.mapControlButton} onPress={focusOnUserLocation}>
            <Target size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.safeArea, Platform.OS === 'android' && styles.safeAreaAndroid, Platform.OS === 'ios' && styles.safeAreaIos]} pointerEvents="box-none">
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} pointerEvents="box-none">
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

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

      {activeSheet && (
        <Animated.View pointerEvents="auto" style={[{ opacity: sheetAnimation.interpolate({ inputRange: [height - SHEET_FULL_HEIGHT, height - SHEET_HALF_HEIGHT], outputRange: [1, 0.7], extrapolate: 'clamp' }) }]}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeSheet} activeOpacity={1} />
        </Animated.View>
      )}

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

function NewDeliverySheet({ closeSheet, isFullScreen, webViewRef, userLocation, form, setForm, setSelectMode, handleCreateDelivery, isCalculatingRoute, routeDistanceKm }: any) {
  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Create Delivery</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={isFullScreen && sheetStyles.fullScreenScroll}>
        <View style={sheetStyles.card}>
          <Text style={sheetStyles.cardTitle}>Pickup</Text>
          <Input label="Pickup Address" placeholder="Tap to pick or enter address" value={form.from} onChangeText={(txt: string) => setForm((p: any) => ({ ...p, from: txt }))} icon={<MapPin size={20} color="#666" />} />
          <View style={sheetStyles.cardRow}>
            <TouchableOpacity style={sheetStyles.ghostBtn} onPress={() => { setSelectMode('pickup'); Alert.alert('Pick on map', 'Long-press on map to select'); }}>
              <Text style={sheetStyles.ghostBtnText}>Pick on map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sheetStyles.ghostBtn} onPress={() => {
              if (userLocation) setForm((p: any) => ({ ...p, from: 'Current location', fromLat: userLocation.latitude, fromLng: userLocation.longitude }));
            }}>
              <Locate size={14} color="#007AFF" />
              <Text style={[sheetStyles.ghostBtnText, { marginLeft: 8 }]}>Use current</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={sheetStyles.card}>
          <Text style={sheetStyles.cardTitle}>Delivery</Text>
          <Input label="Delivery Address" placeholder="Tap to pick or enter" value={form.to} onChangeText={(txt: string) => setForm((p: any) => ({ ...p, to: txt }))} icon={<MapPin size={20} color="#666" />} />
          <TouchableOpacity style={sheetStyles.ghostBtn} onPress={() => { setSelectMode('delivery'); Alert.alert('Pick on map', 'Long-press on map to select'); }}>
            <Text style={sheetStyles.ghostBtnText}>Pick on map</Text>
          </TouchableOpacity>
        </View>

        <View style={sheetStyles.row}>
          <View style={sheetStyles.halfInput}>
            <Input label="Package Type" placeholder="e.g., Parcel" value={form.packageType} onChangeText={(t: string) => setForm((p: any) => ({ ...p, packageType: t }))} icon={<Package size={20} color="#666" />} />
          </View>
          <View style={sheetStyles.halfInput}>
            <Input label="Weight (kg)" placeholder="e.g., 2.5" value={form.weight} onChangeText={(t: string) => setForm((p: any) => ({ ...p, weight: t }))} keyboardType="numeric" />
          </View>
        </View>

        <Input label="Recipient Name" placeholder="Full name" value={form.recipientName} onChangeText={(t: string) => setForm((p: any) => ({ ...p, recipientName: t }))} icon={<User size={20} color="#666" />} />
        <Input label="Recipient Contact" placeholder="Phone number" value={form.recipientContact} onChangeText={(t: string) => setForm((p: any) => ({ ...p, recipientContact: t }))} icon={<Phone size={20} color="#666" />} keyboardType="phone-pad" />
        <Input label="Description" placeholder="Notes for driver (optional)" value={form.description} onChangeText={(t: string) => setForm((p: any) => ({ ...p, description: t }))} multiline numberOfLines={3} />

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

function TrackingSheet({ closeSheet, isFullScreen, webViewRef, deliveries }: any) {
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

    if (d.fromLat && d.toLat && webViewRef.current) {
      const midLat = (d.fromLat + d.toLat) / 2;
      const midLng = (d.fromLng + d.toLng) / 2;
      webViewRef.current.injectJavaScript(`map.flyTo({center: [${midLng}, ${midLat}], zoom: 11});`);
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
        {deliveries.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No packages yet</Text>
          </View>
        ) : (
          deliveries.map((d: any, idx: number) => (
            <View key={idx} style={sheetStyles.packageItem}>
              <View style={sheetStyles.packageIcon}><Package size={20} color="#007AFF" /></View>
              <View style={sheetStyles.packageInfo}>
                <Text style={sheetStyles.packageTitle}>{d.title || 'Package'}</Text>
                <Text style={sheetStyles.packageStatus}>{d.status} • {d.id}</Text>
              </View>
              <ArrowRight size={18} color="#666" />
            </View>
          ))
        )}
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
        <Text style={{ color: '#666' }}>Schedule your deliveries coming soon</Text>
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

function calculateStraightDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

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
  mapControls: { position: 'absolute', top: 80, right: 16, gap: 12 },
  mapControlButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
});

const sheetStyles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  fullScreenContainer: { paddingTop: 10 },
  fullScreenScroll: { paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#000' },
  fullScreenTitle: { fontSize: 28 },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f0f0f0' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
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