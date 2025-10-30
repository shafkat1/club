'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { otpAuthService } from '@/services/auth-otp-service'
import { getErrorMessage } from '@/utils/error-handler'

type AuthStep = 'phone' | 'otp' | 'loading'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  
  // Form state
  const [step, setStep] = useState<AuthStep>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Auto-decrement resend timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

  /**
   * Step 1: Send OTP to phone number
   */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate phone number format
      if (!phone.match(/^\+?[\d\s\-()]{10,}$/)) {
        throw new Error('Please enter a valid phone number (e.g., +1 234 567 8900)')
      }

      console.log(`📱 Sending OTP to ${phone}...`)
      await otpAuthService.sendOtp(phone)
      
      setStep('otp')
      setResendTimer(60)
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
      // Validate OTP
      if (otp.length !== 6 || !otp.match(/^\d{6}$/)) {
        throw new Error('Please enter a valid 6-digit OTP')
      }

      console.log(`🔐 Verifying OTP...`)
      const result = await otpAuthService.verifyOtp(phone, otp)
      
      // Save user to store
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
    setResendTimer(0)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Desh</h1>
            <p className="text-gray-600 mt-2">Bartender Portal</p>
            <p className="text-xs text-gray-500 mt-4">
              {step === 'phone' ? 'Enter your phone number to receive OTP' : 'Enter the OTP code sent to your phone'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium">⚠️ Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}

          {/* Form */}
          {step === 'phone' ? (
            // PHONE ENTRY STEP
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:text-gray-500"
                  required
                  autoComplete="tel"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your registered phone number where you'll receive the OTP code
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !phone.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  <>📱 Send OTP</>
                )}
              </button>
            </form>
          ) : (
            // OTP ENTRY STEP
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Sent to <span className="font-semibold">{phone}</span>
                </p>
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
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:text-gray-500 text-center text-3xl tracking-widest font-mono"
                  required
                  autoComplete="one-time-code"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the 6-digit code from your text message
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>✅ Verify & Login</>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading || resendTimer > 0}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition"
                >
                  {resendTimer > 0 ? (
                    <>Resend OTP in {resendTimer}s</>
                  ) : (
                    <>📤 Resend OTP</>
                  )}
                </button>
              </div>

              {/* Back Button */}
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="w-full text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium py-2 transition"
              >
                ← Change Phone Number
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-2 text-center">
            <p className="text-xs text-gray-500">
              Only authorized bartenders can access this portal
            </p>
            <p className="text-xs text-gray-500">
              Questions? Contact support@desh.co
            </p>
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
