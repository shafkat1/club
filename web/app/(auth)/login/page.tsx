'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/utils/error-handler'
import { Mail, Calendar, Phone, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const { isAuthenticated } = useAuthStore()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/app/map')
    }
  }, [isAuthenticated, router])

  // Tab state
  const [activeTab, setActiveTab] = useState('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Sign In state
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  })

  // Sign Up state
  const [signUpData, setSignUpData] = useState({
    name: '',
    dateOfBirth: '',
    email: '',
    password: '',
  })

  // OTP state
  const [otpData, setOtpData] = useState({
    phone: '',
    otp: '',
  })
  const [otpSent, setOtpSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Calculate age helper
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Auto-decrement resend timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (!signInData.email || !signInData.password) {
        throw new Error('Email and password are required')
      }

      // TODO: Integrate with backend
      console.log('Sign In:', signInData)
      setSuccessMessage('✅ Sign in successful!')
      setTimeout(() => {
        router.push('/app/map')
      }, 1500)
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (!signUpData.name || !signUpData.dateOfBirth || !signUpData.email || !signUpData.password) {
        throw new Error('All fields are required')
      }

      const age = calculateAge(signUpData.dateOfBirth)
      if (age < 21) {
        throw new Error(`You must be at least 21 years old. You are currently ${age} years old.`)
      }

      if (new Date(signUpData.dateOfBirth) > new Date()) {
        throw new Error('Date of birth cannot be in the future')
      }

      // TODO: Integrate with backend
      console.log('Sign Up:', signUpData)
      setSuccessMessage('✅ Account created successfully! Please sign in.')
      setTimeout(() => {
        setActiveTab('signin')
        setSignUpData({ name: '', dateOfBirth: '', email: '', password: '' })
      }, 1500)
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (!otpData.phone.match(/^\+?[\d\s\-()]{10,}$/)) {
        throw new Error('Please enter a valid phone number')
      }

      // TODO: Integrate with backend
      console.log('Send OTP:', otpData.phone)
      setOtpSent(true)
      setResendTimer(60)
      setSuccessMessage(`✅ OTP sent to ${otpData.phone}`)
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (otpData.otp.length !== 6 || !otpData.otp.match(/^\d{6}$/)) {
        throw new Error('Please enter a valid 6-digit OTP')
      }

      // TODO: Integrate with backend
      console.log('Verify OTP:', otpData.phone, otpData.otp)
      setSuccessMessage('✅ OTP verified! Redirecting...')
      setTimeout(() => {
        router.push('/app/map')
      }, 1500)
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    setLoading(true)
    setError(null)

    try {
      // TODO: Integrate with backend
      console.log('Resend OTP:', otpData.phone)
      setResendTimer(60)
      setSuccessMessage(`✅ OTP resent to ${otpData.phone}`)
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-lg shadow-2xl border-0 overflow-hidden">
          {/* Header */}
          <div className="text-center space-y-2 p-8 pb-6">
            <div className="mx-auto mb-4 text-5xl">🍹</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to Desh
            </h1>
            <p className="text-gray-600 text-base">
              Bartender Portal - QR Code Scanner & Redemption
            </p>

            {/* First-time user help */}
            {!error && !successMessage && (
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded text-sm text-left">
                <p className="font-medium mb-1">🎉 First time here?</p>
                <p className="text-xs text-gray-700">
                  Use the <span className="font-semibold">Sign Up</span> tab to create an account or <span className="font-semibold">OTP</span> for phone-based authentication!
                </p>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="px-8 pb-8 pt-4 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium">⚠️ Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 font-medium">{successMessage}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="space-y-4">
              {/* Tab List */}
              <div className="grid grid-cols-3 gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setActiveTab('signin')
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className={`py-2 px-4 rounded transition font-medium text-sm ${
                    activeTab === 'signin'
                      ? 'bg-white text-gray-900 shadow'
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActiveTab('signup')
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className={`py-2 px-4 rounded transition font-medium text-sm ${
                    activeTab === 'signup'
                      ? 'bg-white text-gray-900 shadow'
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    setActiveTab('otp')
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className={`py-2 px-4 rounded transition font-medium text-sm ${
                    activeTab === 'otp'
                      ? 'bg-white text-gray-900 shadow'
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  OTP
                </button>
              </div>

              {/* Tab Content */}

              {/* Sign In Tab */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="flex gap-2">
                      <Mail className="h-5 w-5 text-gray-400 mt-3" />
                      <input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        disabled={loading}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      className="flex-1 bg-white border-2 border-indigo-200 hover:bg-indigo-50 disabled:bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg transition"
                    >
                      🔍 Test
                    </button>
                  </div>
                </form>
              )}

              {/* Sign Up Tab */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-dob" className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <div className="flex gap-2">
                      <Calendar className="h-5 w-5 text-gray-400 mt-3" />
                      <input
                        id="signup-dob"
                        type="date"
                        value={signUpData.dateOfBirth}
                        onChange={(e) => setSignUpData({ ...signUpData, dateOfBirth: e.target.value })}
                        disabled={loading}
                        max={new Date().toISOString().split('T')[0]}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      You must be 21+ to use this service (U.S. federal minimum)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="flex gap-2">
                      <Mail className="h-5 w-5 text-gray-400 mt-3" />
                      <input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        disabled={loading}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition shadow-md flex items-center justify-center gap-2 pt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>
              )}

              {/* OTP Tab */}
              {activeTab === 'otp' && (
                <form onSubmit={!otpSent ? handleSendOtp : handleVerifyOtp} className="space-y-4">
                  {!otpSent ? (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="otp-phone" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <div className="flex gap-2">
                          <Phone className="h-5 w-5 text-gray-400 mt-3" />
                          <input
                            id="otp-phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={otpData.phone}
                            onChange={(e) => setOtpData({ ...otpData, phone: e.target.value })}
                            disabled={loading}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Enter your phone number to receive an OTP code
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          <>📱 Send OTP</>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700">
                          Verification Code
                        </label>
                        <p className="text-sm text-gray-600">
                          Sent to <span className="font-semibold">{otpData.phone}</span>
                        </p>
                        <input
                          id="otp-code"
                          type="text"
                          placeholder="000000"
                          value={otpData.otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setOtpData({ ...otpData, otp: value })
                          }}
                          disabled={loading}
                          maxLength={6}
                          inputMode="numeric"
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-100 text-center text-3xl tracking-widest font-mono"
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Enter the 6-digit code from your text message
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otpData.otp.length !== 6}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>✅ Verify & Login</>
                        )}
                      </button>

                      <div className="flex gap-2 flex-col text-center space-y-2">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading || resendTimer > 0}
                          className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 font-medium transition"
                        >
                          {resendTimer > 0 ? (
                            <>⏱️ Resend OTP in {resendTimer}s</>
                          ) : (
                            <>📤 Resend OTP</>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false)
                            setOtpData({ phone: '', otp: '' })
                            setError(null)
                          }}
                          disabled={loading}
                          className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 font-medium transition"
                        >
                          ← Change Phone Number
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Google
              </button>
              <button
                type="button"
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Facebook
              </button>
              <button
                type="button"
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Apple
              </button>
              <button
                type="button"
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Instagram
              </button>
            </div>
            <p className="text-xs text-center text-gray-500">
              Social sign-in requires configuration in backend
            </p>

            {/* Debug Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button
                type="button"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                🧪 Create Test User
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-900 transition font-medium text-xs"
                >
                  📊 Debug Info
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-900 transition font-medium text-xs"
                >
                  🗑️ Cleanup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-6 text-center text-xs text-gray-300 space-y-1">
          <p>🔒 Secure authentication</p>
          <p>Your credentials are never stored</p>
        </div>
      </div>
    </div>
  )
}
