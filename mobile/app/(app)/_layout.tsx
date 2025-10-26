import React from 'react'
import { Stack } from 'expo-router'

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="map" options={{ title: 'Map' }} />
      <Stack.Screen name="venue-details" options={{ title: 'Venue' }} />
      <Stack.Screen name="buy-drink" options={{ title: 'Buy Drink' }} />
      <Stack.Screen name="user-profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="groups" options={{ title: 'Groups' }} />
      <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
    </Stack>
  )
}
