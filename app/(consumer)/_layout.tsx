import { Stack } from 'expo-router';

export default function ConsumerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="create-delivery"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="active" />
      <Stack.Screen name="history" />
      <Stack.Screen name="delivery" />
    </Stack>
  );
}
