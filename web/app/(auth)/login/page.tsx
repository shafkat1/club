'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { otpAuthService } from '@/services/auth-otp-service'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/utils/error-handler'
import { Mail, Calendar, Loader2 } from 'lucide-react'

type AuthStep = 'phone' | 'otp' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const { isAuthenticated } = useAuthStore()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Form state
  const [step, setStep] = useState<AuthStep>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [selectedTab, setSelectedTab] = useState('signin')

  // Sign up state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    name: '',
    dateOfBirth: '',
  })

  // Sign in state
  const [signinData, setSigninData] = useState({
    email: '',
    password: '',
  })

  // Auto-decrement resend timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

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

  /**
   * Step 1: Send OTP to phone number
   */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!phone.match(/^\+?[\d\s\-()]{10,}$/)) {
        throw new Error('Please enter a valid phone number (e.g., +1 234 567 8900)')
      }

      console.log(`📱 Sending OTP to ${phone}...`)
      await otpAuthService.sendOtp(phone)

      setStep('otp')
      setResendTimer(60)
      setSuccessMessage(`✅ OTP sent to ${phone}`)
      console.log('✅ OTP sent successfully')
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('❌ Error sending OTP:', message)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Step 2: Verify OTP and login
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (otp.length !== 6 || !otp.match(/^\d{6}$/)) {
        throw new Error('Please enter a valid 6-digit OTP')
      }

      console.log(`🔐 Verifying OTP...`)
      const result = await otpAuthService.verifyOtp(phone, otp)

      if (result.user) {
        setUser(result.user)
        console.log('✅ Login successful, redirecting...')
        router.push('/dashboard')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('❌ Error verifying OTP:', message)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Resend OTP
   */
  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    setError(null)
    setIsLoading(true)

    try {
      console.log(`📱 Resending OTP to ${phone}...`)
      await otpAuthService.sendOtp(phone)
      setResendTimer(60)
      setSuccessMessage(`✅ OTP resent to ${phone}`)
      console.log('✅ OTP resent successfully')
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('❌ Error resending OTP:', message)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Go back to phone entry
   */
  const handleBack = () => {
    setStep('phone')
    setOtp('')
    setError(null)
    setSuccessMessage(null)
    setResendTimer(0)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
            {!error && !successMessage && step === 'phone' && (
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded text-sm text-left">
                <p className="font-medium mb-1">🎉 First time here?</p>
                <p className="text-xs text-gray-700">
                  Use your phone number to receive an OTP code for instant access!
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

            {/* Main Content - Phone Entry */}
            {step === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="text-gray-400 mt-3 text-xl">📱</div>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        setError(null)
                      }}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:text-gray-500"
                      required
                      autoComplete="tel"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter your phone number to receive an OTP code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !phone.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>📱 Send OTP</>
                  )}
                </button>
              </form>
            )}

            {/* OTP Entry */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <p className="text-sm text-gray-600">
                    Sent to <span className="font-semibold">{phone}</span>
                  </p>
                  <div className="flex gap-2">
                    <div className="text-gray-400 mt-3 text-xl">🔐</div>
                    <input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setOtp(value)
                        setError(null)
                      }}
                      disabled={isLoading}
                      maxLength={6}
                      inputMode="numeric"
                      className="flex-1 px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-100 disabled:text-gray-500 text-center text-3xl tracking-widest font-mono"
                      required
                      autoComplete="one-time-code"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter the 6-digit code from your text message
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>✅ Verify & Login</>
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center space-y-3">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || resendTimer > 0}
                    className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition"
                  >
                    {resendTimer > 0 ? (
                      <>⏱️ Resend OTP in {resendTimer}s</>
                    ) : (
                      <>📤 Resend OTP</>
                    )}
                  </button>

                  {/* Back Button */}
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="w-full text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 font-medium py-2 transition"
                  >
                    ← Change Phone Number
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or use email</span>
              </div>
            </div>

            {/* Email/Password Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800">
                <span className="font-medium">💡 Email/Password Authentication</span>
              </p>
              <p className="text-xs text-blue-600 mt-2">
                For development use, the OTP method via phone is recommended for bartenders.
              </p>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 text-center text-xs text-gray-300 space-y-1">
          <p>🔒 Secure OTP-based authentication</p>
          <p>Your credentials are never stored</p>
        </div>
      </div>
    </div>
  )
}
