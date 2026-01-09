export type UserRole = 'vendor' | 'consumer' | 'rider';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  profileImage?: string;
  createdAt: string;
}

export interface Vendor extends User {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  operatingHours: string;
  rating: number;
}

export interface Consumer extends User {
  savedAddresses: Address[];
}

export interface Rider extends User {
  vehicleType: 'bike' | 'car' | 'van';
  vehicleRegistration: string;
  licenseNumber: string;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  balance: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export interface DeliveryRequest {
  id: string;
  vendorId?: string;
  consumerId: string;
  rideId?: string;
  pickupAddress: Address;
  dropoffAddress: Address;
  packageDescription: string;
  packageSize: 'small' | 'medium' | 'large';
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  estimatedCost: number;
  actualCost?: number;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  customerName: string;
  customerPhone: string;
}

export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  deliveryId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  createdAt: string;
}
