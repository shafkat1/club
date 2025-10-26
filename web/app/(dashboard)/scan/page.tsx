'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { redemptionsAPI } from '@/lib/api'
import Link from 'next/link'

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [redeeming, setRedeeming] = useState(false)
  const codeReader = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    const startScanning = async () => {
      try {
        codeReader.current = new BrowserMultiFormatReader()
        setScanning(true)

        const result = await codeReader.current.decodeFromVideoElement(
          videoRef.current!,
          async (result) => {
            if (result) {
              const qrCode = result.getText()
              await handleRedemption(qrCode)
            }
          }
        )
      } catch (error) {
        console.error('Scanner error:', error)
        setMessage({ type: 'error', text: 'Failed to start camera' })
      }
    }

    startScanning()

    return () => {
      codeReader.current?.reset()
    }
  }, [])

  const handleRedemption = async (redemptionId: string) => {
    if (redeeming) return

    setRedeeming(true)
    setMessage(null)

    try {
      await redemptionsAPI.redeem(redemptionId)
      setMessage({ type: 'success', text: '✅ Drink redeemed successfully!' })

      // Reset after 2 seconds
      setTimeout(() => {
        setMessage(null)
        setRedeeming(false)
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to redeem drink',
      })
      setRedeeming(false)
    }
  }

  const handleManualEntry = async () => {
    const qrCode = prompt('Enter QR code or Redemption ID:')
    if (qrCode) {
      await handleRedemption(qrCode)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Scan Drinks</h1>
        <Link href="/orders" className="text-blue-600 hover:text-blue-700 font-medium">
          Orders
        </Link>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Video Feed */}
          <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-square">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>

          {/* Scanner Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">How to Scan</h2>
            <p className="text-sm text-blue-800">
              Ask the customer to show their phone with the drink QR code. Position the QR code within the scanner frame.
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`p-4 rounded-lg mb-6 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Manual Entry Button */}
          <button
            onClick={handleManualEntry}
            disabled={redeeming}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {redeeming ? 'Processing...' : 'Enter Code Manually'}
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${scanning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-sm text-gray-600">
            {scanning ? 'Camera Active' : 'Starting Camera...'}
          </span>
        </div>
      </div>
    </div>
  )
}
