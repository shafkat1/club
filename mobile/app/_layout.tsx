import { useEffect } from 'react'
// import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { Stack, useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { UserProvider, useUser } from '@/lib/userContext'

SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

function RootLayoutContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useUser()

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(app)/map')
      } else {
        router.replace('/(auth)/login')
      }
    }
  }, [isLoading, isAuthenticated])

  // Show nothing while loading
  if (isLoading) {
    return null
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ animationEnabled: false }} />
      <Stack.Screen name="(app)" options={{ animationEnabled: false }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <UserProvider>
      <RootLayoutContent />
    </UserProvider>
  )
}
