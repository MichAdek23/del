import React, { useState, useRef } from 'react';
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
  PanResponder
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Input } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { 
  Plus, 
  MapPin, 
  Package, 
  Clock, 
  User,
  X, 
  Calendar,
  CreditCard,
  MessageSquare,
  Settings,
  ArrowRight,
  Star,
  Phone,
  Mail,
  Navigation,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2
} from 'lucide-react-native';
import { mockConsumer, mockDeliveries } from '@/constants/mockData';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
const QUICK_ACTIONS_HEIGHT = height * 0.35;
const MINIMIZED_HEIGHT = 70;
const MAXIMIZED_HEIGHT = QUICK_ACTIONS_HEIGHT;

// Sheet height states - constrain full screen to avoid safe area
const SHEET_HALF_HEIGHT = Platform.OS === 'ios' ? height * 0.5 : height * 0.55;
const SHEET_FULL_HEIGHT = Platform.OS === 'ios' ? height * 0.85 : height * 0.9; // Reduced from 0.9/0.95

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
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      panY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      const dragThreshold = 50;
      
      if (gestureState.dy > dragThreshold) {
        if (isSheetFullScreen) {
          minimizeToHalfScreen();
        } else {
          closeSheet();
        }
      } else if (gestureState.dy < -dragThreshold) {
        if (!isSheetFullScreen) {
          expandToFullScreen();
        }
      } else {
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const quickActionsPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      quickActionsDragY.setValue(0);
    },
    onPanResponderMove: (_, gestureState) => {
      if (isQuickActionsOpen && gestureState.dy > 0) {
        quickActionsDragY.setValue(gestureState.dy);
      } else if (!isQuickActionsOpen && gestureState.dy < 0) {
        quickActionsDragY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      const dragDistance = Math.abs(gestureState.dy);
      const dragVelocity = Math.abs(gestureState.vy);
      
      if (dragDistance > 50 || dragVelocity > 0.5) {
        if (gestureState.dy < 0) {
          openQuickActions();
        } else {
          closeQuickActions();
        }
      } else {
        if (isQuickActionsOpen) {
          openQuickActions();
        } else {
          closeQuickActions();
        }
      }
      
      quickActionsDragY.setValue(0);
    },
  });

  const expandToFullScreen = () => {
    setIsSheetFullScreen(true);
    setSheetHeight(SHEET_FULL_HEIGHT);
    Animated.spring(sheetAnimation, {
      toValue: height - SHEET_FULL_HEIGHT,
      useNativeDriver: true,
      tension: 60,
      friction: 7,
    }).start(() => {
      panY.setValue(0);
    });
  };

  const minimizeToHalfScreen = () => {
    setIsSheetFullScreen(false);
    setSheetHeight(SHEET_HALF_HEIGHT);
    Animated.spring(sheetAnimation, {
      toValue: height - SHEET_HALF_HEIGHT,
      useNativeDriver: true,
      tension: 60,
      friction: 7,
    }).start(() => {
      panY.setValue(0);
    });
  };

  const toggleSheetFullScreen = () => {
    if (isSheetFullScreen) {
      minimizeToHalfScreen();
    } else {
      expandToFullScreen();
    }
  };

  const openQuickActions = () => {
    setIsQuickActionsOpen(true);
    Animated.spring(quickActionsHeight, {
      toValue: MAXIMIZED_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const closeQuickActions = () => {
    setIsQuickActionsOpen(false);
    Animated.spring(quickActionsHeight, {
      toValue: MINIMIZED_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const toggleQuickActions = () => {
    if (isQuickActionsOpen) {
      closeQuickActions();
    } else {
      openQuickActions();
    }
  };

  const openSheet = (sheetName) => {
    setActiveSheet(sheetName);
    setIsSheetFullScreen(false);
    setSheetHeight(SHEET_HALF_HEIGHT);
    closeQuickActions();
    
    Animated.spring(sheetAnimation, {
      toValue: height - SHEET_HALF_HEIGHT,
      useNativeDriver: true,
      tension: 60,
      friction: 7,
    }).start();
  };

  const closeSheet = () => {
    Animated.spring(sheetAnimation, {
      toValue: height,
      useNativeDriver: true,
      tension: 60,
      friction: 7,
    }).start(() => {
      setActiveSheet(null);
      panY.setValue(0);
      setIsSheetFullScreen(false);
    });
  };

  React.useEffect(() => {
    const handler = (sheetName: string) => openSheet(sheetName);
    (global as any).openModalSheet = handler;
  }, []);

  const renderSheetContent = () => {
    switch (activeSheet) {
      case 'newDelivery':
        return <NewDeliverySheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} />;
      case 'tracking':
        return <TrackingSheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} />;
      case 'packages':
        return <PackagesSheet closeSheet={closeSheet} deliveries={activeDeliveries} isFullScreen={isSheetFullScreen} />;
      case 'schedule':
        return <ScheduleSheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} />;
      case 'profile':
        return <ProfileSheet closeSheet={closeSheet} user={user} isFullScreen={isSheetFullScreen} />;
      case 'deliveryDetails':
        return <DeliveryDetailsSheet closeSheet={closeSheet} isFullScreen={isSheetFullScreen} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      
      <View style={styles.mapContainer}>
        <LinearGradient
          colors={['#1a1a2e', '#0f3460', '#16213e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.map}
        />
        <View style={styles.mapOverlay} />
      </View>

      <View style={[
        styles.safeArea,
        Platform.OS === 'android' && styles.safeAreaAndroid,
        Platform.OS === 'ios' && styles.safeAreaIos,
      ]}>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Quick Actions Sheet */}
      <Animated.View 
        style={[
          styles.quickActionsSheet,
          {
            height: Animated.add(quickActionsHeight, quickActionsDragY),
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.quickActionsToggle}
          onPress={toggleQuickActions}
          activeOpacity={0.8}
          {...quickActionsPanResponder.panHandlers}
        >
          <View style={styles.toggleHandle}>
            <View style={styles.toggleBar} />
          </View>
          <Text style={styles.toggleText}>
            Quick Actions
          </Text>
          {isQuickActionsOpen ? (
            <ChevronDown size={20} color="#666" style={styles.chevron} />
          ) : (
            <ChevronUp size={20} color="#666" style={styles.chevron} />
          )}
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.quickActionsContent,
            {
              opacity: quickActionsHeight.interpolate({
                inputRange: [MINIMIZED_HEIGHT, MINIMIZED_HEIGHT + 10],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScrollContent}
          >
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.newDeliveryButton}
                onPress={() => openSheet('newDelivery')}
                activeOpacity={0.8}
              >
                <Plus size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.newDeliveryText}>New Delivery</Text>
              </TouchableOpacity>
              
              <View style={styles.quickActionRow}>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => openSheet('tracking')}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionIcon}>
                    <Navigation size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.quickActionText}>Track</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => openSheet('packages')}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionIcon}>
                    <Package size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.quickActionText}>Packages</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => openSheet('schedule')}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionIcon}>
                    <Calendar size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.quickActionText}>Schedule</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => openSheet('profile')}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionIcon}>
                    <User size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.quickActionText}>Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>

      {/* Overlay */}
      {activeSheet && (
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: sheetAnimation.interpolate({
                inputRange: [height - SHEET_FULL_HEIGHT, height - SHEET_HALF_HEIGHT],
                outputRange: [1, 0.7],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject}
            onPress={closeSheet}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Sheet Modal - Constrained to not exceed quick actions */}
      <Animated.View 
        style={[
          styles.sheetContainer,
          {
            height: sheetHeight,
            maxHeight: height - MINIMIZED_HEIGHT, // Constrain below quick actions
            transform: [
              { 
                translateY: Animated.add(
                  sheetAnimation, 
                  Animated.multiply(panY, 0.5) // Reduce drag sensitivity in full screen
                ) 
              },
            ],
          },
        ]}
        {...sheetPanResponder.panHandlers}
      >
        <View style={styles.sheetHandle}>
          <View style={styles.handleBar} />
          <TouchableOpacity 
            style={styles.fullScreenToggle}
            onPress={toggleSheetFullScreen}
          >
            {isSheetFullScreen ? (
              <Minimize2 size={20} color="#666" />
            ) : (
              <Maximize2 size={20} color="#666" />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.sheetContent}>
          {renderSheetContent()}
        </View>
      </Animated.View>
    </View>
  );
}

// Sheet Components
function NewDeliverySheet({ closeSheet, isFullScreen }: any) {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    packageType: '',
    description: '',
    weight: '',
  });

  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>New Delivery</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={isFullScreen && sheetStyles.fullScreenScroll}
      >
        <Input
          label="Pickup Address"
          placeholder="Enter pickup location"
          value={formData.from}
          onChangeText={(text) => setFormData({...formData, from: text})}
          icon={<MapPin size={20} color="#666" />}
          variant="light"
        />
        
        <Input
          label="Delivery Address"
          placeholder="Enter delivery location"
          value={formData.to}
          onChangeText={(text) => setFormData({...formData, to: text})}
          icon={<MapPin size={20} color="#666" />}
          variant="light"
        />
        
        <Input
          label="Package Type"
          placeholder="e.g., Document, Parcel, Food"
          value={formData.packageType}
          onChangeText={(text) => setFormData({...formData, packageType: text})}
          icon={<Package size={20} color="#666" />}
          variant="light"
        />
        
        <Input
          label="Description"
          placeholder="Describe your package"
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          multiline
          numberOfLines={3}
          variant="light"
        />
        
        <Input
          label="Weight (kg)"
          placeholder="Approximate weight"
          value={formData.weight}
          onChangeText={(text) => setFormData({...formData, weight: text})}
          keyboardType="numeric"
          variant="light"
        />
        
        <View style={sheetStyles.buttonRow}>
          <Button
            title="Cancel"
            onPress={closeSheet}
            variant="outline"
            style={sheetStyles.cancelButton}
          />
          <Button
            title="Create Delivery"
            onPress={() => {
              closeSheet();
            }}
            variant="primary"
            style={sheetStyles.submitButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function TrackingSheet({ closeSheet, isFullScreen }: any) {
  const [trackingNumber, setTrackingNumber] = useState('');
  
  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Track Package</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={[sheetStyles.trackingContainer, isFullScreen && sheetStyles.fullScreenContent]}>
        <Input
          placeholder="Enter tracking number"
          value={trackingNumber}
          onChangeText={setTrackingNumber}
          icon={<Package size={20} color="#666" />}
          variant="light"
        />
        
        <Button
          title="Track"
          onPress={() => {}}
          variant="primary"
          style={sheetStyles.trackButton}
        />
        
        <View style={sheetStyles.trackingStatus}>
          <Text style={sheetStyles.sectionTitle}>Delivery Progress</Text>
          <View style={sheetStyles.statusStep}>
            <View style={[sheetStyles.statusDot, sheetStyles.activeDot]} />
            <Text style={sheetStyles.statusText}>Package Picked Up</Text>
            <Text style={sheetStyles.statusTime}>Today, 10:30 AM</Text>
          </View>
          
          <View style={sheetStyles.statusStep}>
            <View style={[sheetStyles.statusDot, sheetStyles.activeDot]} />
            <Text style={sheetStyles.statusText}>In Transit</Text>
            <Text style={sheetStyles.statusTime}>Today, 11:45 AM</Text>
          </View>
          
          <View style={sheetStyles.statusStep}>
            <View style={sheetStyles.statusDot} />
            <Text style={sheetStyles.statusText}>Out for Delivery</Text>
            <Text style={sheetStyles.statusTime}>Estimated: 2:00 PM</Text>
          </View>
          
          <View style={sheetStyles.statusStep}>
            <View style={sheetStyles.statusDot} />
            <Text style={sheetStyles.statusText}>Delivered</Text>
            <Text style={sheetStyles.statusTime}>Estimated: 4:00 PM</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function PackagesSheet({ closeSheet, deliveries, isFullScreen }: any) {
  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>My Packages</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={isFullScreen && sheetStyles.fullScreenScroll}
      >
        {deliveries.map((delivery: any) => (
          <View key={delivery.id} style={sheetStyles.packageItem}>
            <View style={sheetStyles.packageIcon}>
              <Package size={20} color="#007AFF" />
            </View>
            <View style={sheetStyles.packageInfo}>
              <Text style={sheetStyles.packageTitle}>{delivery.packageDescription}</Text>
              <Text style={sheetStyles.packageStatus}>{delivery.status}</Text>
              <Text style={sheetStyles.packageCost}>${delivery.estimatedCost.toFixed(2)}</Text>
            </View>
            <ArrowRight size={20} color="#666" />
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
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={isFullScreen && sheetStyles.fullScreenScroll}
      >
        <Input
          label="Pickup Date & Time"
          placeholder="Select date and time"
          icon={<Calendar size={20} color="#666" />}
          variant="light"
        />
        
        <Input
          label="Recipient Availability"
          placeholder="e.g., 9 AM - 5 PM"
          icon={<Clock size={20} color="#666" />}
          variant="light"
        />
        
        <View style={sheetStyles.scheduleOptions}>
          <Text style={sheetStyles.sectionTitle}>Schedule Options</Text>
          {['Express (2 hours)', 'Same Day', 'Next Day', 'Scheduled'].map((option, index) => (
            <TouchableOpacity key={index} style={sheetStyles.optionItem}>
              <Text style={sheetStyles.optionText}>{option}</Text>
              <Text style={sheetStyles.optionPrice}>$15.99</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Button
          title="Schedule Delivery"
          onPress={closeSheet}
          variant="primary"
          style={sheetStyles.submitButton}
        />
      </ScrollView>
    </View>
  );
}

function ProfileSheet({ closeSheet, user, isFullScreen }: any) {
  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>My Profile</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={isFullScreen && sheetStyles.fullScreenScroll}
      >
        <View style={sheetStyles.profileHeader}>
          <View style={sheetStyles.profileAvatar}>
            <Text style={sheetStyles.avatarText}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </Text>
          </View>
          <Text style={sheetStyles.profileName}>{user.firstName} {user.lastName}</Text>
          <Text style={sheetStyles.profileEmail}>{user.email}</Text>
        </View>
        
        <View style={sheetStyles.menuSection}>
          {[
            { icon: <CreditCard size={20} color="#007AFF" />, label: 'Payment Methods' },
            { icon: <MapPin size={20} color="#007AFF" />, label: 'Saved Addresses' },
            { icon: <MessageSquare size={20} color="#007AFF" />, label: 'Messages' },
            { icon: <Settings size={20} color="#007AFF" />, label: 'Settings' },
            { icon: <Star size={20} color="#007AFF" />, label: 'Rate Us' },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={sheetStyles.menuItem}>
              {item.icon}
              <Text style={sheetStyles.menuText}>{item.label}</Text>
              <ArrowRight size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
        
        <Button
          title="Sign Out"
          onPress={() => router.replace('/auth/login')}
          variant="outline"
          style={sheetStyles.signOutButton}
        />
      </ScrollView>
    </View>
  );
}

function DeliveryDetailsSheet({ closeSheet, isFullScreen }: any) {
  return (
    <View style={[sheetStyles.container, isFullScreen && sheetStyles.fullScreenContainer]}>
      <View style={sheetStyles.header}>
        <Text style={[sheetStyles.title, isFullScreen && sheetStyles.fullScreenTitle]}>Delivery Details</Text>
        <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={isFullScreen && sheetStyles.fullScreenScroll}
      >
        <View style={sheetStyles.deliveryHeader}>
          <View style={sheetStyles.deliveryIcon}>
            <Package size={30} color="#007AFF" />
          </View>
          <Text style={sheetStyles.deliveryTitle}>Document Package</Text>
          <Text style={sheetStyles.deliveryStatus}>In Transit</Text>
        </View>
        
        <View style={sheetStyles.deliveryInfo}>
          <View style={sheetStyles.infoRow}>
            <Text style={sheetStyles.infoLabel}>Tracking Number:</Text>
            <Text style={sheetStyles.infoValue}>DEL123456789</Text>
          </View>
          
          <View style={sheetStyles.infoRow}>
            <Text style={sheetStyles.infoLabel}>Estimated Delivery:</Text>
            <Text style={sheetStyles.infoValue}>Today, 4:00 PM</Text>
          </View>
          
          <View style={sheetStyles.infoRow}>
            <Text style={sheetStyles.infoLabel}>Cost:</Text>
            <Text style={sheetStyles.infoValue}>$12.50</Text>
          </View>
        </View>
        
        <View style={sheetStyles.driverSection}>
          <Text style={sheetStyles.sectionTitle}>Driver Information</Text>
          <View style={sheetStyles.driverCard}>
            <View style={sheetStyles.driverAvatar}>
              <User size={20} color="#fff" />
            </View>
            <View style={sheetStyles.driverInfo}>
              <Text style={sheetStyles.driverName}>John Driver</Text>
              <Text style={sheetStyles.driverRating}>⭐ 4.8 (120 reviews)</Text>
            </View>
            <TouchableOpacity style={sheetStyles.callButton}>
              <Phone size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={sheetStyles.messageButton}>
              <MessageSquare size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Button
          title="Track Package"
          onPress={() => {}}
          variant="primary"
          style={sheetStyles.trackButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
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
  safeAreaIos: {
    paddingTop: 10,
  },
  safeAreaAndroid: {
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: 10,
    paddingHorizontal: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    paddingHorizontal: 0,
  },
  quickActionsSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
    zIndex: 50,
  },
  quickActionsToggle: {
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
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
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
    color: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 99,
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 100,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  sheetContent: {
    flex: 1,
  },
});

const sheetStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  trackButton: {
    marginTop: 20,
  },
  trackingContainer: {
    flex: 1,
  },
  trackingStatus: {
    marginTop: 30,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ddd',
    marginRight: 12,
    zIndex: 1,
  },
  activeDot: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  statusTime: {
    fontSize: 12,
    color: '#666',
  },
  packageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  packageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  packageStatus: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  packageCost: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  scheduleOptions: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
    flex: 1,
  },
  signOutButton: {
    marginTop: 20,
  },
  deliveryHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  deliveryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  deliveryStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deliveryInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  driverSection: {
    marginBottom: 20,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  driverRating: {
    fontSize: 12,
    color: '#666',
  },
  callButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    marginHorizontal: 4,
  },
  messageButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    marginHorizontal: 4,
  },
});
