import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Desh - Bartender Portal",
  description: "QR code scanner and drink redemption management for bartenders",
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
