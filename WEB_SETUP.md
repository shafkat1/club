# Next.js Web Portal (Bartender/Admin) Setup

## Quick Start

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
web/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home/login
│   ├── (auth)/
│   │   └── login/page.tsx   # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx       # Dashboard layout
│   │   ├── page.tsx         # Dashboard home
│   │   ├── scan/page.tsx    # QR scanner (bartender)
│   │   ├── lookup/page.tsx  # Phone lookup
│   │   ├── redemptions/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── venue/page.tsx
│   │   └── admin/page.tsx   # Admin dashboard
│   └── api/
│       ├── auth/
│       ├── orders/
│       └── redemptions/
├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── QRScanner.tsx
│   ├── OrderCard.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Badge.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useCamera.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── qr.ts
├── store/
│   ├── auth.store.ts
│   ├── redemption.store.ts
│   └── order.store.ts
├── lib/
│   ├── constants.ts
│   ├── validation.ts
│   └── geo.ts
├── styles/
│   └── globals.css
├── public/
│   └── assets/
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Key Dependencies

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "tailwindcss": "^3.3.0",
  "zustand": "^4.4.0",
  "react-query": "^3.39.0",
  "axios": "^1.6.0",
  "@zxing/browser": "^0.1.2",
  "stripe-react-native": "^0.32.0",
  "@radix-ui/react-dialog": "^1.1.1",
  "@radix-ui/react-tooltip": "^1.0.7",
  "react-hook-form": "^7.50.0",
  "zod": "^3.22.0",
  "next-auth": "^4.24.0",
  "recharts": "^2.10.0"
}
```

## Setup Steps

### 1. Initialize Project

```bash
npx create-next-app@latest web --typescript
cd web
npm install
```

### 2. Configure Tailwind

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Create Layout (app/layout.tsx)

```typescript
import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
```

### 4. Login Page (app/(auth)/login/page.tsx)

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await api.auth.sendOtp(phone);
      router.push(`/verify?phone=${phone}`);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Club Bartender</h1>
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded"
        />
        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
}
```

### 5. QR Scanner Component (components/QRScanner.tsx)

```typescript
'use client';
import { useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

export function QRScanner({ onScan }: { onScan: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = new BrowserQRCodeReader();

  useEffect(() => {
    if (!videoRef.current) return;

    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      (result) => {
        if (result) {
          onScan(result.getText());
        }
      },
    );

    return () => codeReader.reset();
  }, []);

  return <video ref={videoRef} style={{ width: '100%' }} />;
}
```

### 6. Redemption Workflow (app/(dashboard)/scan/page.tsx)

```typescript
'use client';
import { useState } from 'react';
import { QRScanner } from '@/components/QRScanner';
import { api } from '@/services/api';

export default function ScanPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleQRScan = async (qrCode: string) => {
    setLoading(true);
    try {
      const data = await api.redemptions.scan({ qrCode });
      setResult(data);
    } catch (error) {
      console.error('Scan failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Scan QR Code</h1>
      <div className="grid grid-cols-2 gap-6">
        <QRScanner onScan={handleQRScan} />
        {result && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">{result.recipientName}</h2>
            <p className="mb-2">
              <strong>Item:</strong> {result.items.map((i: any) => i.name).join(', ')}
            </p>
            <p className="mb-4">
              <strong>Amount:</strong> ${(result.totalAmount / 100).toFixed(2)}
            </p>
            <button
              onClick={() => api.redemptions.confirm(result.id)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Confirm Redemption
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 7. API Routes (app/api/auth/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
  }
}
```

### 8. State Management (store/redemption.store.ts)

```typescript
import { create } from 'zustand';

interface RedemptionStore {
  orders: any[];
  redeemed: string[];
  addRedeemed: (orderId: string) => void;
  clearRedeemed: () => void;
}

export const useRedemptionStore = create<RedemptionStore>((set) => ({
  orders: [],
  redeemed: [],
  addRedeemed: (orderId) =>
    set((state) => ({ redeemed: [...state.redeemed, orderId] })),
  clearRedeemed: () => set({ redeemed: [] }),
}));
```

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
API_SECRET_KEY=...
STRIPE_SECRET_KEY=sk_live_...
```

## Running in Production

```bash
npm run build
npm start
```

Deploy to Vercel:

```bash
vercel
```

## Common Issues

- **QR Scanner not working**: Check browser camera permissions
- **API calls failing**: Ensure backend is running on NEXT_PUBLIC_API_URL
- **Authentication errors**: Verify JWT tokens in localStorage

For details: https://nextjs.org/docs
