import { useEffect } from 'react'
// import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { Stack, useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { getAuthToken } from '@/lib/auth'

SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function RootLayout() {
  // TODO: Add custom fonts (Geist-Regular, Geist-SemiBold) when ready
  // const [fontsLoaded, fontError] = useFonts({
  //   'Geist-Regular': require('@/assets/fonts/Geist-Regular.ttf'),
  //   'Geist-SemiBold': require('@/assets/fonts/Geist-SemiBold.ttf'),
  // })

  const router = useRouter()

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken()
      if (!token) {
        router.replace('/(auth)/login')
      } else {
        router.replace('/(app)/map')
      }
    }

    checkAuth()
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ animationEnabled: false }} />
      <Stack.Screen name="(app)" options={{ animationEnabled: false }} />
    </Stack>
  )
}
