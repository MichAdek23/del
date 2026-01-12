import { Stack } from 'expo-router';

export default function OthersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Add modal presentation for modal screens
        presentation: 'modal',
      }}
    >
      {/* Regular screens */}
      <Stack.Screen name="index" />
      
      {/* Modal screens - override presentation to be modal */}
      <Stack.Screen 
        name="add-address" 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="add-payment-method" 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="chat-detail" 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="driver-details" 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="messages" 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="payment-methods" 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="profile-edit" 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="saved-addresses" 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="settings" 
        options={{ presentation: 'modal' }}
      />
    </Stack>
  );
}