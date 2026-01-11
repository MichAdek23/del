import { Stack } from 'expo-router';

export default function OthersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="add-address" />
      <Stack.Screen name="add-payment-method" />
      <Stack.Screen name="chat-detail" />
      <Stack.Screen name="driver-details" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="payment-methods" />
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="saved-addresses  " />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
