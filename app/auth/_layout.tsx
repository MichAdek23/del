import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="vendor-signup" />
      <Stack.Screen name="consumer-signup" />
      <Stack.Screen name="rider-signup" />
    </Stack>
  );
}
