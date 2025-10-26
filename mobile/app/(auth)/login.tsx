import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView, Alert } from 'react-native'
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

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      await login('+1 (555) 123-4567', '123456')
      router.replace('/(app)/map')
    } catch (err) {
      console.error('Demo login error:', err)
      router.replace('/(app)/map')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = () => {
    router.push('/(auth)/signup')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f3ff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🍹</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Club</Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 4 }}>
            Find drinks & connect with friends
          </Text>
          {step === 'otp' && (
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              We sent a code to {phone}
            </Text>
          )}
        </View>

        {/* Form Card */}
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
          marginBottom: 24,
        }}>
          {step === 'phone' ? (
            <View>
              {/* Phone Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                  Phone Number
                </Text>
                <TextInput
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!loading}
                  placeholderTextColor="#d1d5db"
                  style={{
                    borderWidth: 1.5,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: '#111827',
                    backgroundColor: '#f9fafb',
                  }}
                />
              </View>

              {/* Error */}
              {error ? (
                <View style={{ backgroundColor: '#fee2e2', borderRadius: 10, padding: 12, marginBottom: 20 }}>
                  <Text style={{ color: '#dc2626', fontSize: 13 }}>{error}</Text>
                </View>
              ) : null}

              {/* Send Code Button */}
              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={loading}
                style={{
                  backgroundColor: '#7c3aed',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginBottom: 16,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  {loading ? '⏳ Sending...' : 'Send Code'}
                </Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center' }}>
                  Don't have an account?{' '}
                  <Text style={{ color: '#7c3aed', fontWeight: '700' }}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* OTP Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                  Verification Code
                </Text>
                <TextInput
                  placeholder="000000"
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                  placeholderTextColor="#d1d5db"
                  style={{
                    borderWidth: 1.5,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 24,
                    fontWeight: '700',
                    textAlign: 'center',
                    letterSpacing: 8,
                    color: '#111827',
                    backgroundColor: '#f9fafb',
                    fontFamily: 'monospace',
                  }}
                />
              </View>

              {/* Error */}
              {error ? (
                <View style={{ backgroundColor: '#fee2e2', borderRadius: 10, padding: 12, marginBottom: 20 }}>
                  <Text style={{ color: '#dc2626', fontSize: 13 }}>{error}</Text>
                </View>
              ) : null}

              {/* Verify Button */}
              <TouchableOpacity
                onPress={handleVerifyOtp}
                disabled={loading}
                style={{
                  backgroundColor: '#7c3aed',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginBottom: 16,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  {loading ? '⏳ Verifying...' : 'Verify & Login'}
                </Text>
              </TouchableOpacity>

              {/* Back Link */}
              <TouchableOpacity
                onPress={() => {
                  setStep('phone')
                  setError('')
                  setOtp('')
                }}
                disabled={loading}
              >
                <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center' }}>
                  <Text style={{ color: '#7c3aed', fontWeight: '700' }}>← </Text>
                  Use different number
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Demo Login Button */}
        <TouchableOpacity
          onPress={handleDemoLogin}
          disabled={loading}
          style={{
            borderWidth: 2,
            borderColor: '#7c3aed',
            paddingVertical: 13,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 20,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: '#7c3aed', fontWeight: '700', fontSize: 15 }}>
            {loading ? '🔄 Loading...' : '🚀 Demo Login'}
          </Text>
        </TouchableOpacity>

        {/* Social Links */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
          <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20 }}>f</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20 }}>🐦</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20 }}>in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
