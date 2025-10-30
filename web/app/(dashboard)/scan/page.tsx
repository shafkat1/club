'use client'

import { useRef, useEffect, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { apiClient } from '@/utils/api-client'
import { getErrorMessage } from '@/utils/error-handler'

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(true)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  // Initialize QR code scanner
  useEffect(() => {
    if (!scanning || !videoRef.current) return

    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    const handleResult = async (result: any) => {
      const code = result.getText()
      if (code && code !== scannedCode) {
        setScannedCode(code)
        await processQRCode(code)
      }
    }

    const startScanning = async () => {
      try {
        console.log('📱 Starting QR scanner...')
        await reader.decodeFromVideoElement(videoRef.current!, handleResult)
      } catch (err) {
        if (err instanceof Error && !err.message.includes('Not found')) {
          console.error('Scanner error:', err)
          setError('Camera access denied or not available')
        }
      }
    }

    startScanning()

    return () => {
      try {
        reader.reset()
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }, [scanning, scannedCode])

  const processQRCode = async (code: string) => {
    try {
      setProcessing(true)
      setError(null)
      setSuccess(null)

      console.log('🔄 Processing QR code...')

      // Call redemption API
      const result = await apiClient.post('/redemptions/scan', {
        qrCode: code,
      })

      console.log('✅ Redemption successful:', result)
      
      setSuccess(
        `✅ Redeemed${result.itemName ? ': ' + result.itemName : ''}!`
      )
      setScannedCode(null)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
        setProcessing(false)
      }, 3000)
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('❌ Redemption failed:', message)
      setError(message)
      setProcessing(false)
    }
  }

  const toggleScanning = () => {
    setScanning(!scanning)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">QR Code Scanner</h1>
          <div className="text-sm text-gray-500">
            {scanning ? '🔴 Live' : '⚫ Stopped'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          {/* Scanner Container */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mb-6">
            <video
              ref={videoRef}
              className="w-full bg-black"
              style={{
                maxWidth: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={toggleScanning}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                scanning
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {scanning ? '⏹ Stop Scanning' : '▶ Start Scanning'}
            </button>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}

          {/* Processing */}
          {processing && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-600 text-sm">Processing...</p>
            </div>
          )}

          {/* Last Scanned Code */}
          {scannedCode && !success && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Last Scanned:</p>
              <p className="font-mono text-blue-700 break-all text-sm mt-1">
                {scannedCode}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-xs text-gray-600">
              📱 Hold QR code in front of camera
            </p>
            <p className="text-xs text-gray-600 mt-1">
              ⏳ Codes are processed automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
