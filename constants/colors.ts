export const colors = {
  primary: '#00BCD4',
  primaryDark: '#0097A7',
  primaryLight: '#80DEEA',

  secondary: '#FF6B6B',
  secondaryLight: '#FFB3B3',

  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',

  neutral: '#F5F5F5',
  neutralLight: '#FAFAFA',
  neutralDark: '#9E9E9E',

  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',

  border: '#E0E0E0',
  background: '#FFFFFF',
  backgroundAlt: '#F5F5F5',

  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const statusColors = {
  pending: colors.warning,
  assigned: colors.primary,
  picked_up: colors.primaryLight,
  in_transit: colors.primary,
  delivered: colors.success,
  cancelled: colors.error,
};
