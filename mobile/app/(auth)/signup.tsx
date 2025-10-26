import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useUser } from '@/lib/userContext'

type SignupMethod = 'email' | 'phone'

export default function SignupScreen() {
  const router = useRouter()
  const { login } = useUser()
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('email')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateInputs = () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return false
    }
    
    if (signupMethod === 'email') {
      if (!email.trim()) {
        setError('Please enter your email')
        return false
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email')
        return false
      }
    } else {
      if (!phone.trim()) {
        setError('Please enter your phone number')
        return false
      }
      if (phone.length < 10) {
        setError('Please enter a valid phone number')
        return false
      }
    }
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSignup = async () => {
    setError('')
    if (!validateInputs()) {
      return
    }

    setLoading(true)
    try {
      // Create demo user account
      const identifier = signupMethod === 'email' ? email : phone
      
      // Show success message
      Alert.alert('Success', `Account created! Welcome to Club, ${name}!`, [
        {
          text: 'OK',
          onPress: async () => {
            try {
              // Auto-login with demo credentials
              if (signupMethod === 'email') {
                await login(email, password)
              } else {
                // For phone signup, use OTP demo (123456)
                await login(phone, '123456')
              }
              router.replace('/')
            } catch (err) {
              console.error('Auto-login error:', err)
              router.back()
            }
          },
        },
      ])
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err?.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    router.back()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f3ff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🍹</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Create Account</Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
            Join the Club community
          </Text>
        </View>

        {/* Signup Method Toggle */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => setSignupMethod('email')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
              backgroundColor: signupMethod === 'email' ? '#7c3aed' : '#e5e7eb',
            }}
          >
            <Text style={{
              color: signupMethod === 'email' ? '#fff' : '#6b7280',
              fontWeight: '600',
              fontSize: 14,
            }}>
              Email
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setSignupMethod('phone')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
              backgroundColor: signupMethod === 'phone' ? '#7c3aed' : '#e5e7eb',
            }}
          >
            <Text style={{
              color: signupMethod === 'phone' ? '#fff' : '#6b7280',
              fontWeight: '600',
              fontSize: 14,
            }}>
              Phone
            </Text>
          </TouchableOpacity>
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
          {/* Name Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
              Full Name
            </Text>
            <TextInput
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
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

          {/* Email or Phone Input */}
          {signupMethod === 'email' ? (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                Email
              </Text>
              <TextInput
                placeholder="john@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
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
          ) : (
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
          )}

          {/* Password Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
              Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
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
                  paddingRight: 45,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 16, top: 14 }}
              >
                <Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
              Confirm Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
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
                  paddingRight: 45,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: 16, top: 14 }}
              >
                <Text style={{ fontSize: 18 }}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={{ backgroundColor: '#fee2e2', borderRadius: 10, padding: 12, marginBottom: 20 }}>
              <Text style={{ color: '#dc2626', fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignup}
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
              {loading ? '⏳ Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center' }}>
              Already have an account?{' '}
              <Text style={{ color: '#7c3aed', fontWeight: '700' }}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
