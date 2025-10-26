# NestJS Backend Setup

This guide helps you scaffold the complete backend API for the Club app.

## Project Structure

```
backend/
├── src/
│   ├── main.ts                          # Bootstrap
│   ├── app.module.ts                    # Root module
│   ├── common/
│   │   ├── services/
│   │   │   ├── prisma.service.ts        # Database
│   │   │   ├── redis.service.ts         # Cache
│   │   │   └── s3.service.ts            # File storage
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts        # JWT auth
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts # Error handling
│   │   ├── interceptors/
│   │   │   └── sentry.interceptor.ts    # Error tracking
│   │   └── dto/                         # Data transfer objects
│   ├── modules/
│   │   ├── auth/                        # Authentication
│   │   ├── users/                       # User management
│   │   ├── venues/                      # Venue data
│   │   ├── orders/                      # Drink orders
│   │   ├── redemptions/                 # Bartender redemption
│   │   ├── presence/                    # User location tracking
│   │   └── groups/                      # Group hangouts
│   └── database/
│       └── migrations/                  # Prisma migrations
├── prisma/
│   └── schema.prisma                    # Database schema
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database (Prisma)

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Core models here (see next section)
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
npx prisma migrate dev --name init
```

### 4. Environment Variables

```bash
cp ../.env.example backend/.env

# Fill in values:
# DATABASE_URL, REDIS_HOST, JWT_SECRET, etc.
```

### 5. Run Development Server

```bash
npm run start:dev
```

Server runs on `http://localhost:3000`
API docs: `http://localhost:3000/api/docs`

---

## Database Schema (Prisma)

Add to `prisma/schema.prisma`:

```prisma
// Users
model User {
  id                String   @id @default(cuid())
  phoneNumber       String?  @unique
  email             String?  @unique
  passwordHash      String?
  firstName         String?
  lastName          String?
  profileImageUrl   String?
  dateOfBirth       DateTime?
  verified          Boolean  @default(false)
  blocked           Boolean  @default(false)
  
  // Relations
  socialAccounts    SocialAccount[]
  devices           Device[]
  presences         Presence[]
  groups            Group[]
  orders            Order[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// Social Authentication
model SocialAccount {
  id        String   @id @default(cuid())
  provider  String   // "google", "facebook", "instagram", etc.
  providerId String
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  
  createdAt DateTime @default(now())
  
  @@unique([provider, providerId])
}

// Device Tracking (for fingerprinting & anti-fraud)
model Device {
  id           String   @id @default(cuid())
  deviceId     String
  userAgent    String?
  lastIpAddress String?
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       String
  
  lastSeen     DateTime @default(now()) @updatedAt
}

// Venues
model Venue {
  id                String    @id @default(cuid())
  name              String
  address           String
  latitude          Float
  longitude         Float
  phoneNumber       String?
  verified          Boolean   @default(false)
  
  // Business hours
  openTime          String    // "09:00"
  closeTime         String    // "02:00"
  
  // Relations
  menu              MenuItem[]
  presences         Presence[]
  groups            Group[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

// Menu Items
model MenuItem {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float    // cents: 500 = $5.00
  category    String   // "cocktail", "beer", "wine", etc.
  
  venue       Venue    @relation(fields: [venueId], references: [id], onDelete: Cascade)
  venueId     String
  
  orders      Order[]
  
  createdAt   DateTime @default(now())
}

// User Presence at Venue
model Presence {
  userId          String
  venueId         String
  checkedInAt     DateTime @default(now())
  wantsDrink      Boolean  @default(false)
  offeringDrink   Boolean  @default(false)
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  venue           Venue    @relation(fields: [venueId], references: [id], onDelete: Cascade)
  
  @@id([userId, venueId])  // One presence per user-venue
}

// Groups (hangouts)
model Group {
  id        String   @id @default(cuid())
  name      String?
  venueId   String
  createdBy String
  
  venue     Venue    @relation(fields: [venueId], references: [id], onDelete: Cascade)
  creator   User     @relation(fields: [createdBy], references: [id], onDelete: SetNull)
  
  members   User[]   // Many-to-many via GroupMember
  
  createdAt DateTime @default(now())
}

// Group Memberships
model GroupMember {
  userId  String
  groupId String
  joinedAt DateTime @default(now())
  
  @@id([userId, groupId])
  @@unique([userId])  // One group per user
}

// Orders (drinks purchased)
model Order {
  id              String   @id @default(cuid())
  buyerId         String
  recipientId     String
  venueId         String
  status          String   // "pending", "accepted", "declined", "redeemed", "refunded"
  
  items           OrderItem[]
  
  totalAmount     Float    // cents
  tip             Float    @default(0)
  tax             Float    @default(0)
  
  expiresAt       DateTime
  redeemedAt      DateTime?
  
  buyer           User     @relation("OrderBuyer", fields: [buyerId], references: [id], onDelete: Cascade)
  recipient       User     @relation("OrderRecipient", fields: [recipientId], references: [id], onDelete: Cascade)
  venue           Venue    @relation(fields: [venueId], references: [id])
  
  redemptions     Redemption[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Order Items
model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  itemId    String
  quantity  Int      @default(1)
  price     Float    // Price at purchase time
  
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem  MenuItem @relation(fields: [itemId], references: [id])
}

// Redemptions (bartender verification)
model Redemption {
  id              String   @id @default(cuid())
  orderId         String
  staffUserId     String?
  method          String   // "qr_scan", "phone_lookup"
  idVerified      Boolean  @default(false)
  ageVerified     Boolean  @default(false)
  faceMatched     Boolean  @default(false)
  
  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
}

// Reports & Moderation
model Report {
  id              String   @id @default(cuid())
  reportedUserId  String
  reporterUserId  String
  reason          String
  resolved        Boolean  @default(false)
  
  createdAt       DateTime @default(now())
}

// Blocks
model Block {
  blockerId  String
  blockedId  String
  
  @@id([blockerId, blockedId])
}
```

---

## Module Structure

### Auth Module (`src/modules/auth/`)

```
auth/
├── auth.module.ts
├── auth.service.ts
├── auth.controller.ts
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   └── otp.dto.ts
├── strategies/
│   ├── jwt.strategy.ts
│   ├── google.strategy.ts
│   └── facebook.strategy.ts
```

**Key endpoints:**
- `POST /auth/register` – Register with phone/email
- `POST /auth/otp/send` – Send OTP
- `POST /auth/otp/verify` – Verify OTP + login
- `POST /auth/google` – Google OAuth callback
- `POST /auth/facebook` – Facebook OAuth callback

### Users Module (`src/modules/users/`)

```
users/
├── users.module.ts
├── users.service.ts
├── users.controller.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user.dto.ts
```

**Key endpoints:**
- `GET /users/:id` – Get user profile
- `PATCH /users/:id` – Update profile
- `GET /users/:id/friends` – Get user's friends
- `POST /users/:id/block` – Block user

### Venues Module (`src/modules/venues/`)

```
venues/
├── venues.module.ts
├── venues.service.ts
├── venues.controller.ts
├── dto/
│   ├── create-venue.dto.ts
│   └── venue.dto.ts
```

**Key endpoints:**
- `GET /venues?lat=X&lng=Y` – Search nearby venues with counts
- `GET /venues/:id` – Get venue details
- `GET /venues/:id/menu` – Get menu items
- `GET /venues/:id/people` – List people at venue (filtered by privacy)

### Orders Module (`src/modules/orders/`)

```
orders/
├── orders.module.ts
├── orders.service.ts
├── orders.controller.ts
├── dto/
│   ├── create-order.dto.ts
│   ├── order.dto.ts
│   └── accept-order.dto.ts
```

**Key endpoints:**
- `POST /orders` – Create order (buy drink)
- `GET /orders/:id` – Get order details
- `PATCH /orders/:id/accept` – Recipient accepts order
- `PATCH /orders/:id/decline` – Recipient declines order
- `GET /me/orders` – Get my orders (as buyer)
- `GET /me/received-orders` – Get orders received

### Redemptions Module (`src/modules/redemptions/`)

```
redemptions/
├── redemptions.module.ts
├── redemptions.service.ts
├── redemptions.controller.ts
├── dto/
│   ├── scan-qr.dto.ts
│   ├── phone-lookup.dto.ts
│   └── redemption.dto.ts
```

**Key endpoints:**
- `POST /redemptions/scan` – Bartender scans QR
- `POST /redemptions/lookup` – Phone number lookup
- `POST /redemptions/:id/verify-id` – Verify ID scan
- `POST /redemptions/:id/confirm` – Mark as redeemed

### Presence Module (`src/modules/presence/`)

```
presence/
├── presence.module.ts
├── presence.service.ts
├── presence.controller.ts
├── dto/
│   ├── check-in.dto.ts
│   └── presence.dto.ts
```

**Key endpoints:**
- `POST /presence/check-in` – Check into venue
- `POST /presence/check-out` – Check out
- `PATCH /presence/toggle-wants-drink` – Toggle "I want a drink"
- `PATCH /presence/toggle-offering-drink` – Toggle "I'm buying"
- `GET /presence/me` – Get current presence

### Groups Module (`src/modules/groups/`)

```
groups/
├── groups.module.ts
├── groups.service.ts
├── groups.controller.ts
├── dto/
│   ├── create-group.dto.ts
│   ├── group.dto.ts
│   └── add-member.dto.ts
```

**Key endpoints:**
- `POST /groups` – Create group
- `POST /groups/:id/members` – Add member
- `DELETE /groups/:id/members/:userId` – Remove member
- `GET /groups/:id` – Get group details
- `DELETE /groups/:id/leave` – Leave group

---

## Generating Modules with NestJS CLI

```bash
# Generate entire module (controller, service, module)
nest g module modules/auth
nest g service modules/auth --skip-import
nest g controller modules/auth --skip-import

# Repeat for other modules:
# - users
# - venues
# - orders
# - redemptions
# - presence
# - groups
```

---

## Common DTOs

### Create `src/common/dto/pagination.dto.ts`:

```typescript
export class PaginationDto {
  @IsInt()
  @IsOptional()
  skip: number = 0;

  @IsInt()
  @IsOptional()
  take: number = 20;
}
```

### Create `src/common/dto/geo.dto.ts`:

```typescript
export class GeoLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  radiusMeters?: number = 1000;
}
```

---

## Testing

Create `src/app.module.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
```

Run tests:

```bash
npm run test
npm run test:cov
```

---

## Docker (Optional)

Create `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

Build:

```bash
npm run build
docker build -t clubapp-backend:latest .
```

---

## Deployment to ECS

1. Build and push to ECR:

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 425687053209.dkr.ecr.us-east-1.amazonaws.com

docker tag clubapp-backend:latest 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest

docker push 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest
```

2. Update ECS task definition with new image URI
3. Redeploy service

---

## Next Steps

1. Copy all module boilerplate code
2. Run `npm install`
3. Create `.env` with DB credentials
4. Run `npx prisma migrate dev --name init`
5. `npm run start:dev`
6. Test `/health` endpoint

All Swagger endpoints auto-documented at `/api/docs` ✅
