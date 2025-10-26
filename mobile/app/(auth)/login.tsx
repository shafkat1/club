import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { authAPI } from '@/lib/api'
import { useUser } from '@/lib/userContext'

export default function LoginScreen() {
  const router = useRouter()
  const { login } = useUser()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authAPI.sendOtp(phone)
      setStep('otp')
    } catch (err: any) {
      console.error('Send OTP error:', err)
      const message = err?.response?.data?.message || err?.message || 'Failed to send OTP'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 4) {
      setError('Please enter a valid code')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(phone, otp)
      router.replace('/(app)/map')
    } catch (err: any) {
      console.error('Verify OTP error:', err)
      const message = err?.response?.data?.message || err?.message || 'Invalid OTP. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-blue-600 to-purple-600">
      <View className="flex-1 justify-center items-center p-6 min-h-screen">
        <View className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <Text className="text-3xl font-bold text-center text-gray-900 mb-2">
            🍹 Club
          </Text>
          <Text className="text-center text-gray-600 mb-8">
            Find drinks & connect with friends
          </Text>

          {/* Form */}
          {step === 'phone' ? (
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </Text>
                <TextInput
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                  editable={!loading}
                  placeholderTextColor="#9CA3AF"
                />
                <Text className="text-xs text-gray-500 mt-1">
                  We'll send you a verification code via SMS
                </Text>
              </View>
            </View>
          ) : (
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </Text>
                <TextInput
                  placeholder="000000"
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg font-mono"
                  editable={!loading}
                  placeholderTextColor="#9CA3AF"
                />
                <Text className="text-xs text-gray-500 mt-1 text-center">
                  Enter the 6-digit code sent to {phone}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setStep('phone')
                  setError('')
                  setOtp('')
                }}
                disabled={loading}
                className="py-2"
              >
                <Text className="text-sm text-blue-600 font-medium text-center">
                  Use a different phone number
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <Text className="text-sm text-red-700">{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
            disabled={loading || (step === 'phone' ? !phone : !otp)}
            className={`w-full py-3 px-4 rounded-lg mt-6 flex-row justify-center items-center ${
              loading || (step === 'phone' ? !phone : !otp)
                ? 'bg-gray-400'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-center">
                {step === 'phone' ? 'Send Code' : 'Verify & Login'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <Text className="text-center text-xs text-gray-500 mt-6">
            We take your privacy seriously. Your data is encrypted.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
