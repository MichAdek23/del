export * from './colors';

export const USER_ROLES = {
  VENDOR: 'vendor',
  CONSUMER: 'consumer',
  RIDER: 'rider',
};

export const DELIVERY_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PACKAGE_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

export const VEHICLE_TYPES = {
  BIKE: 'bike',
  CAR: 'car',
  VAN: 'van',
};

export const TAX_RATE = 0.1;
export const BASE_DELIVERY_FEE = 2.5;
export const DISTANCE_RATE = 0.5;
