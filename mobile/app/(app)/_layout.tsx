import React from 'react'
import { Tabs } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarLabel: 'Venues',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarLabel: 'Groups',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👫</Text>,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🍻</Text>,
        }}
      />
      <Tabs.Screen
        name="venue-details"
        options={{
          href: null,
          title: 'Venue Details',
        }}
      />
      <Tabs.Screen
        name="create-order"
        options={{
          href: null,
          title: 'Create Order',
        }}
      />
    </Tabs>
  )
}

const Text = require('react-native').Text

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
})
