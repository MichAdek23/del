import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar, Animated, PanResponder, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { Plus, MapPin, Package, Clock, User, X, Calendar, CreditCard, MessageSquare, Settings, ArrowRight, Star, Phone, Navigation, ChevronUp, ChevronDown, Maximize2, Minimize2, Check } from 'lucide-react-native';
import { mockConsumer, mockDeliveries } from '@/constants/mockData';

const { height } = Dimensions.get('window');
const QUICK_ACTIONS_HEIGHT = height * 0.35;
const MINIMIZED_HEIGHT = 70;
const SHEET_HALF_HEIGHT = Platform.OS === 'ios' ? height * 0.5 : height * 0.55;
const SHEET_FULL_HEIGHT = Platform.OS === 'ios' ? height * 0.85 : height * 0.9;

export default function ConsumerHome() {
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
      case 'newDelivery': return <NewDeliverySheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} />;
      case 'tracking': return <TrackingSheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} />;
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
        <LinearGradient colors={['#1a1a2e', '#0f3460', '#16213e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.map} />
        <View style={styles.mapOverlay} />
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

function NewDeliverySheet({ closeSheet, isFullScreen }: any) {
  const [formData, setFormData] = useState({ from: '', to: '', packageType: '', description: '', weight: '', recipientName: '', recipientContact: '' });
  const [deliveryCreated, setDeliveryCreated] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const generateTrackingId = () => `DEL${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const handleCreateDelivery = () => {
    if (!formData.from || !formData.to || !formData.recipientName || !formData.recipientContact) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setTrackingId(generateTrackingId());
    setDeliveryCreated(true);
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
              <View style={sheetStyles.summaryRow}><Text style={sheetStyles.summaryLabel}>From:</Text><Text style={sheetStyles.summaryValue}>{formData.from}</Text></View>
              <View style={sheetStyles.summaryRow}><Text style={sheetStyles.summaryLabel}>To:</Text><Text style={sheetStyles.summaryValue}>{formData.to}</Text></View>
              <View style={sheetStyles.summaryRow}><Text style={sheetStyles.summaryLabel}>Recipient:</Text><Text style={sheetStyles.summaryValue}>{formData.recipientName}</Text></View>
              <View style={sheetStyles.summaryRow}><Text style={sheetStyles.summaryLabel}>Contact:</Text><Text style={sheetStyles.summaryValue}>{formData.recipientContact}</Text></View>
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
        <Input label="Pickup Address" placeholder="Enter pickup location" value={formData.from} onChangeText={(t) => setFormData({ ...formData, from: t })} icon={<MapPin size={20} color="#666" />} />
        
        <Text style={sheetStyles.sectionLabel}>Delivery Details</Text>
        <Input label="Delivery Address" placeholder="Enter delivery location" value={formData.to} onChangeText={(t) => setFormData({ ...formData, to: t })} icon={<MapPin size={20} color="#666" />} />
        
        <View style={sheetStyles.row}>
          <View style={sheetStyles.halfInput}>
            <Input label="Recipient Name" placeholder="Full name" value={formData.recipientName} onChangeText={(t) => setFormData({ ...formData, recipientName: t })} icon={<User size={20} color="#666" />} />
          </View>
          <View style={sheetStyles.halfInput}>
            <Input label="Contact Number" placeholder="Phone number" value={formData.recipientContact} onChangeText={(t) => setFormData({ ...formData, recipientContact: t })} icon={<Phone size={20} color="#666" />} keyboardType="phone-pad" />
          </View>
        </View>
        
        <Text style={sheetStyles.sectionLabel}>Package Information</Text>
        <Input label="Package Type" placeholder="e.g., Document, Parcel, Food" value={formData.packageType} onChangeText={(t) => setFormData({ ...formData, packageType: t })} icon={<Package size={20} color="#666" />} />
        <Input label="Description" placeholder="Describe your package" value={formData.description} onChangeText={(t) => setFormData({ ...formData, description: t })} multiline numberOfLines={3} />
        <Input label="Weight (kg)" placeholder="Approximate weight" value={formData.weight} onChangeText={(t) => setFormData({ ...formData, weight: t })} keyboardType="numeric" />
        
        <View style={sheetStyles.buttonRow}>
          <Button title="Cancel" onPress={closeSheet} style={sheetStyles.cancelButton} />
          <Button title="Create Delivery" onPress={handleCreateDelivery} variant="primary" style={sheetStyles.submitButton} />
        </View>
      </ScrollView>
    </View>
  );
}

function TrackingSheet({ closeSheet, isFullScreen }: any) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleTrack = () => {
    if (trackingNumber.trim()) {
      setTrackingData({
        trackingId: trackingNumber,
        pickupAddress: '123 Main St, Lagos',
        deliveryAddress: '456 Oak Ave, Lagos',
        recipientName: 'Jane Doe',
        recipientContact: '+234 801 987 6543',
        estimatedDelivery: 'Today, 4:00 PM',
        progress: [
          { step: 'Package Picked Up', time: '10:30 AM', completed: true },
          { step: 'In Transit', time: '11:45 AM', completed: true },
          { step: 'Out for Delivery', time: 'Estimated: 2:00 PM', completed: false },
          { step: 'Delivered', time: 'Estimated: 4:00 PM', completed: false },
        ],
        driver: { name: 'John Smith', rating: 4.8, reviews: 127, vehicle: 'Toyota Corolla - Silver', avatar: 'JS', eta: '15 minutes' },
      });
    }
  };

  if (trackingData) {
    return (
      <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
        <View style={sheetStyles.header}>
          <TouchableOpacity onPress={() => setTrackingData(null)}><Text style={{ color: '#007AFF', fontSize: 16, fontWeight: '600' }}>← Back</Text></TouchableOpacity>
          <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Tracking</Text>
          <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 20 }}>
          <View style={sheetStyles.trackingIdCard}>
            <Text style={sheetStyles.trackingIdLabel}>Tracking Number</Text>
            <Text style={sheetStyles.trackingIdNumber}>{trackingData.trackingId}</Text>
          </View>
          
          <Text style={sheetStyles.sectionTitle}>Driver Assigned</Text>
          <View style={sheetStyles.driverCard}>
            <View style={sheetStyles.driverAvatar}><Text style={sheetStyles.driverAvatarText}>{trackingData.driver.avatar}</Text></View>
            <View style={sheetStyles.driverInfo}>
              <Text style={sheetStyles.driverName}>{trackingData.driver.name}</Text>
              <Text style={sheetStyles.ratingStars}>⭐ {trackingData.driver.rating}</Text>
              <Text style={sheetStyles.vehicleInfo}>{trackingData.driver.vehicle}</Text>
              <Text style={sheetStyles.etaText}>ETA: {trackingData.driver.eta}</Text>
            </View>
          </View>
          
          <View style={sheetStyles.contactRow}>
            <TouchableOpacity style={sheetStyles.contactButton}><Phone size={20} color="#fff" /><Text style={sheetStyles.contactButtonText}>Call</Text></TouchableOpacity>
            <TouchableOpacity style={sheetStyles.messageButton}><MessageSquare size={20} color="#007AFF" /><Text style={sheetStyles.messageButtonText}>Message</Text></TouchableOpacity>
          </View>
          
          <Text style={sheetStyles.sectionTitle}>Progress</Text>
          {trackingData.progress.map((step: any, i: number) => (
            <View key={i} style={sheetStyles.progressStep}>
              <View style={[sheetStyles.progressDot, step.completed && sheetStyles.completedDot]} />
              <View style={sheetStyles.stepContent}>
                <Text style={sheetStyles.stepTitle}>{step.step}</Text>
                <Text style={sheetStyles.stepTime}>{step.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Track Package</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>
      <View style={sheetStyles.trackingContainer}>
        <Input placeholder="Enter tracking number" value={trackingNumber} onChangeText={setTrackingNumber} icon={<Package size={20} color="#666" />} />
        <Button title="Track" onPress={handleTrack} variant="primary" style={sheetStyles.trackButton} />
      </View>
    </View>
  );
}

function PackagesSheet({ closeSheet, deliveries, isFullScreen }: any) {
  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>My Packages</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {deliveries.map((d: any) => (
          <View key={d.id} style={sheetStyles.packageItem}>
            <View style={sheetStyles.packageIcon}><Package size={20} color="#007AFF" /></View>
            <View style={sheetStyles.packageInfo}>
              <Text style={sheetStyles.packageTitle}>{d.packageDescription}</Text>
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
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Schedule Delivery</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}><X size={24} color="#666" /></TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Input label="Pickup Date & Time" placeholder="Select date and time" icon={<Calendar size={20} color="#666" />} />
        <Input label="Recipient Availability" placeholder="e.g., 9 AM - 5 PM" icon={<Clock size={20} color="#666" />} />
        <Button title="Schedule Delivery" onPress={closeSheet} variant="primary" style={sheetStyles.submitButton} />
      </ScrollView>
    </View>
  );
}

function ProfileSheet({ closeSheet, user, isFullScreen }: any) {
  // Navigation handler for modal routes
  const handleNavigation = (routeName: string) => {
    closeSheet(); // Close the sheet first
    
    // Navigate to the modal screen
    switch(routeName) {
      case 'Payment Methods':
        router.push('/others/payment-methods');
        break;
      case 'Saved Addresses':
        router.push('/others/saved-addresses');
        break;
      case 'Messages':
        router.push('/others/messages');
        break;
      case 'Settings':
        router.push('/others/settings');
        break;
      default:
        router.push('/others/settings');
    }
  };

  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>My Profile</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={sheetStyles.profileHeader}>
          <View style={sheetStyles.profileAvatar}>
            <Text style={sheetStyles.avatarText}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </Text>
          </View>
          <Text style={sheetStyles.profileName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={sheetStyles.profileEmail}>{user.email}</Text>
        </View>
        
        <View style={sheetStyles.menuSection}>
          {[
            { 
              label: 'Payment Methods', 
              icon: <CreditCard size={20} color="#666" />,
              route: 'payment-methods'
            },
            { 
              label: 'Saved Addresses', 
              icon: <MapPin size={20} color="#666" />,
              route: 'saved-addresses'
            },
            { 
              label: 'Messages', 
              icon: <MessageSquare size={20} color="#666" />,
              route: 'messages'
            },
            { 
              label: 'Settings', 
              icon: <Settings size={20} color="#666" />,
              route: 'settings'
            },
          ].map((item, i) => (
            <TouchableOpacity 
              key={i} 
              onPress={() => handleNavigation(item.label)} 
              style={sheetStyles.menuItem}
              activeOpacity={0.7}
            >
              <View style={sheetStyles.menuItemLeft}>
                {item.icon}
                <Text style={sheetStyles.menuText}>{item.label}</Text>
              </View>
              <ArrowRight size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Additional profile options */}
        <View style={sheetStyles.menuSection}>
          <TouchableOpacity 
            style={sheetStyles.menuItem}
            onPress={() => {
              closeSheet();
              router.push('/others/profile-edit');
            }}
            activeOpacity={0.7}
          >
            <View style={sheetStyles.menuItemLeft}>
              <User size={20} color="#666" />
              <Text style={sheetStyles.menuText}>Edit Profile</Text>
            </View>
            <ArrowRight size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={sheetStyles.menuItem}
            onPress={() => {
              closeSheet();
              router.push('/others/add-address');
            }}
            activeOpacity={0.7}
          >
            <View style={sheetStyles.menuItemLeft}>
              <MapPin size={20} color="#666" />
              <Text style={sheetStyles.menuText}>Add New Address</Text>
            </View>
            <ArrowRight size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
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
  trackingContainer: { flex: 1 },
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
  menuText: { fontSize: 16, color: '#000', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', } ,
  menuItemLeft: {  flexDirection: 'row',  alignItems: 'center',  gap: 12,  flex: 1,  },
});
