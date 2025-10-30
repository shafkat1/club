# API ENDPOINT MAPPING CHECKLIST - Social Networking App → Club App NestJS

**Created:** October 30, 2025  
**Purpose:** Direct mapping of all Social Networking App component API calls to Club App NestJS endpoints  
**Approach:** NO adapter layer - Direct 1:1 endpoint mapping  
**Status:** Ready for Implementation

---

## OVERVIEW

This document provides a comprehensive reference for developers migrating Social Networking App components to Club App. Each endpoint mapping shows:

- **Component Name** - Which Social Networking App component makes the call
- **Current Call** - How the component currently calls Supabase
- **NestJS Endpoint** - The Club App backend endpoint to use instead
- **Required Changes** - Field names, parameter mapping, etc.
- **Status** - ✅ Endpoint exists, ⏳ Needs implementation, ❌ No equivalent

---

## QUICK REFERENCE TABLE

| Category | Count | Status |
|----------|-------|--------|
| **Authentication** | 4 | ✅ All exist |
| **Profile & Users** | 5 | ✅ All exist |
| **Venues** | 3 | ✅ All exist |
| **Orders/Offers** | 5 | ✅ All exist |
| **Presence/Check-ins** | 4 | ✅ All exist |
| **Messages & Groups** | 5 | ⏳ Some exist |
| **Friends & Social** | 4 | ⏳ May need creation |
| **Redemptions** | 2 | ✅ All exist |
| **Admin/Bartender** | 3 | ✅ All exist |
| **TOTAL** | 35 | 🟢 75% Verified |

---

## DETAILED ENDPOINT MAPPING

### 1. AUTHENTICATION (4 Endpoints)

#### 1.1 User Signup
```
Component: AuthScreen.tsx
Current (Supabase):
  const { data, error } = await supabase.auth.signUpWithPassword({
    email: "user@example.com",
    password: "password123"
  });

Direct NestJS Call:
  POST /api/auth/signup
  Body: {
    email: "user@example.com",
    password: "password123",
    displayName?: "Display Name"  // Optional
  }

Response:
  {
    accessToken: "eyJhbGciOiJIUzI1NiIs...",
    refreshToken: "eyJhbGciOiJIUzI1NiIs...",
    user: {
      id: "user_123",
      email: "user@example.com",
      displayName: "Display Name"
    }
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/auth/auth.controller.ts
```

---

#### 1.2 User Login
```
Component: AuthScreen.tsx
Current (Supabase):
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "user@example.com",
    password: "password123"
  });

Direct NestJS Call:
  POST /api/auth/login
  Body: {
    email: "user@example.com",
    password: "password123"
  }

Response:
  {
    accessToken: "eyJhbGciOiJIUzI1NiIs...",
    refreshToken: "eyJhbGciOiJIUzI1NiIs...",
    user: { id, email, displayName, ... }
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/auth/auth.controller.ts
```

---

#### 1.3 Token Refresh
```
Component: Any component (automatic via interceptor)
Current (Supabase):
  // Automatic
  const { data, error } = await supabase.auth.refreshSession();

Direct NestJS Call:
  POST /api/auth/refresh-token
  Headers: Authorization: Bearer [refreshToken]

Response:
  {
    accessToken: "new_eyJhbGciOiJIUzI1NiIs...",
    expiresIn: 86400
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/auth/auth.controller.ts
Note: Automatic via axios interceptor in api-client.ts
```

---

#### 1.4 User Logout
```
Component: ProfileSettings.tsx, Navigation.tsx
Current (Supabase):
  await supabase.auth.signOut();

Direct NestJS Call:
  POST /api/auth/logout
  Headers: Authorization: Bearer [accessToken]

Response:
  {
    message: "Logged out successfully"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/auth/auth.controller.ts
```

---

### 2. PROFILE & USERS (5 Endpoints)

#### 2.1 Get Current User Profile
```
Component: App.tsx (initial load), ProfileSettings.tsx
Current (Supabase):
  const { data: { user } } = await supabase.auth.getUser();

Direct NestJS Call:
  GET /api/users/me
  Headers: Authorization: Bearer [accessToken]

Response:
  {
    id: "user_123",
    email: "user@example.com",
    displayName: "John Doe",
    profileImage: "https://...",
    bio: "I love drinks!",
    age: 28,
    interests: ["sports", "music"],
    preferredDrinks: ["beer", "cocktails"],
    phoneVerified: true,
    emailVerified: true,
    stats: {
      drinksReceived: 45,
      drinksGiven: 52,
      currentStreak: 3,
      rating: 4.8,
      reviewCount: 15
    },
    verificationBadges: {
      ageVerified: true,
      phoneVerified: true,
      emailVerified: true,
      idVerified: false
    }
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/users/users.controller.ts
```

---

#### 2.2 Update User Profile
```
Component: ProfileSettings.tsx
Current (Supabase):
  await supabase.from('users').update({
    displayName: "New Name",
    bio: "New bio"
  }).eq('id', userId);

Direct NestJS Call:
  PUT /api/users/me
  Headers: Authorization: Bearer [accessToken]
  Body: {
    displayName?: "New Name",
    bio?: "New bio",
    profileImage?: "https://...",
    age?: 28,
    interests?: ["sports", "music"],
    preferredDrinks?: ["beer", "cocktails"],
    pronouns?: "he/him"
  }

Response:
  {
    id: "user_123",
    displayName: "New Name",
    bio: "New bio",
    updatedAt: "2025-10-30T10:30:00Z"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/users/users.controller.ts
```

---

#### 2.3 Get User by ID
```
Component: UserProfile.tsx, UserCard.tsx
Current (Supabase):
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

Direct NestJS Call:
  GET /api/users/:userId
  Headers: Authorization: Bearer [accessToken]

Response:
  {
    id: "user_456",
    displayName: "Jane Smith",
    username: "janesmith",
    profileImage: "https://...",
    bio: "Cocktail enthusiast",
    age: 26,
    interests: ["cocktails", "nightlife"],
    stats: { ... }
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/users/users.controller.ts
```

---

#### 2.4 Search Users
```
Component: UserDiscovery.tsx
Current (Supabase):
  const { data } = await supabase
    .from('users')
    .select('*')
    .ilike('displayName', '%john%')
    .limit(20);

Direct NestJS Call:
  GET /api/users/search?query=john&limit=20
  Headers: Authorization: Bearer [accessToken]

Response:
  [
    {
      id: "user_123",
      displayName: "John Doe",
      username: "johndoe",
      profileImage: "https://...",
      stats: { ... }
    },
    // ... more results
  ]

Status: ✅ Endpoint exists
Location: /backend/src/modules/users/users.controller.ts
```

---

#### 2.5 Upload Profile Image
```
Component: ProfileSettings.tsx
Current (Supabase):
  await supabase.storage
    .from('avatars')
    .upload(`${userId}/profile.jpg`, file);

Direct NestJS Call:
  POST /api/users/me/upload-avatar
  Headers: Authorization: Bearer [accessToken]
  Content-Type: multipart/form-data
  Body: { avatar: File }

Response:
  {
    profileImage: "https://s3.aws.com/clubapp-assets/avatars/user_123/profile.jpg",
    message: "Profile image updated"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/users/users.controller.ts
```

---

### 3. VENUES (3 Endpoints)

#### 3.1 Get Venues Near User
```
Component: MapView.tsx, App.tsx (initial load)
Current (Supabase):
  const { data } = await supabase
    .from('venues')
    .select('*')
    .gte('latitude', minLat)
    .lte('latitude', maxLat)
    .gte('longitude', minLng)
    .lte('longitude', maxLng);

Direct NestJS Call:
  GET /api/venues?latitude=40.7128&longitude=-74.0060&radius=5000
  Headers: Authorization: Bearer [accessToken]

Parameters:
  - latitude: number (required)
  - longitude: number (required)
  - radius: number (optional, default: 5000 meters)

Response:
  [
    {
      id: "venue_123",
      name: "The Tipsy Tavern",
      latitude: 40.7138,
      longitude: -74.0050,
      address: "123 Main St, New York, NY",
      description: "Classic Irish pub with great beer selection",
      image: "https://...",
      rating: 4.5,
      reviewCount: 120,
      priceRange: "$$",
      openingHours: "11:00-02:00",
      distance: 250,  // meters from user
      currentCrowd: 45,  // number of people checked in
      topDrinks: ["Guinness", "Irish Whiskey", "Jameson"],
      tags: ["bar", "pub", "nightlife"]
    },
    // ... more venues
  ]

Status: ✅ Endpoint exists
Location: /backend/src/modules/venues/venues.controller.ts
Note: Automatically filtered by proximity
```

---

#### 3.2 Get Venue Details
```
Component: VenueDetailSheet.tsx
Current (Supabase):
  const { data } = await supabase
    .from('venues')
    .select('*')
    .eq('id', venueId)
    .single();

Direct NestJS Call:
  GET /api/venues/:venueId
  Headers: Authorization: Bearer [accessToken]

Response:
  {
    id: "venue_123",
    name: "The Tipsy Tavern",
    latitude: 40.7138,
    longitude: -74.0050,
    address: "123 Main St, New York, NY",
    description: "Classic Irish pub with great beer selection",
    image: "https://...",
    rating: 4.5,
    reviewCount: 120,
    priceRange: "$$",
    openingHours: "11:00-02:00",
    currentCrowd: 45,
    topDrinks: ["Guinness", "Irish Whiskey", "Jameson"],
    tags: ["bar", "pub", "nightlife"],
    menu: [
      {
        id: "item_456",
        name: "Guinness",
        category: "beer",
        price: 6.50,
        description: "Irish stout"
      },
      // ... more menu items
    ],
    usersHere: [  // People currently checked in
      {
        id: "user_456",
        displayName: "Jane Smith",
        profileImage: "https://..."
      },
      // ... more users
    ]
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/venues/venues.controller.ts
```

---

#### 3.3 Get Venue Menu
```
Component: DrinkMenuDialog.tsx
Current (Supabase):
  const { data } = await supabase
    .from('menu_items')
    .select('*')
    .eq('venue_id', venueId);

Direct NestJS Call:
  GET /api/venues/:venueId/menu
  Headers: Authorization: Bearer [accessToken]

Response:
  [
    {
      id: "item_456",
      name: "Guinness",
      category: "beer",
      price: 6.50,
      description: "Irish stout",
      image: "https://...",
      alcohol_percentage: 4.2
    },
    {
      id: "item_457",
      name: "Jameson",
      category: "whiskey",
      price: 8.00,
      description: "Irish whiskey",
      image: "https://...",
      alcohol_percentage: 40.0
    },
    // ... more items
  ]

Status: ✅ Endpoint exists
Location: /backend/src/modules/venues/venues.controller.ts
```

---

### 4. ORDERS/OFFERS (5 Endpoints)

#### 4.1 Get User's Orders (Sent & Received)
```
Component: App.tsx, OffersTab.tsx
Current (Supabase):
  // Sent offers
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('sender_id', userId);
  
  // Received offers
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('recipient_id', userId);

Direct NestJS Call:
  GET /api/orders?type=sent
  GET /api/orders?type=received
  Headers: Authorization: Bearer [accessToken]

Parameters:
  - type: "sent" | "received" | "all" (optional, default: "all")
  - status: "pending" | "accepted" | "rejected" | "expired" (optional)

Response:
  [
    {
      id: "order_123",
      senderId: "user_456",        // ⚠️ Note: "sender" in Social App → "senderId" in Club App
      recipientId: "user_789",     // ⚠️ Note: "recipient" in Social App → "recipientId" in Club App
      sender: {
        id: "user_456",
        displayName: "Jane Smith",
        profileImage: "https://..."
      },
      recipient: {
        id: "user_789",
        displayName: "John Doe",
        profileImage: "https://..."
      },
      drinkItem: {                 // ⚠️ Note: "item" in Social App → "drinkItem" in Club App
        id: "item_456",
        name: "Guinness",
        price: 6.50
      },
      venueId: "venue_123",        // ⚠️ Note: New field in Club App
      venueName: "The Tipsy Tavern",
      message: "Let's celebrate!",
      status: "pending",           // pending, accepted, rejected, expired, redeemed
      createdAt: "2025-10-30T10:30:00Z",
      expiresAt: "2025-10-31T10:30:00Z"
    },
    // ... more orders
  ]

Status: ✅ Endpoint exists
Location: /backend/src/modules/orders/orders.controller.ts

COMPONENT MAPPING REQUIRED:
  // In component code, map these field names:
  offer.sender → offer.senderId + offer.sender
  offer.receiver → offer.recipientId + offer.recipient
  offer.item → offer.drinkItem
```

---

#### 4.2 Create Order (Send Drink)
```
Component: SendOfferDialog.tsx, VenueDetailSheet.tsx
Current (Supabase):
  await supabase.from('orders').insert({
    sender_id: currentUserId,
    recipient_id: recipientId,
    item_id: itemId,
    message: "Let's celebrate!",
    status: "pending",
    created_at: new Date()
  });

Direct NestJS Call:
  POST /api/orders
  Headers: Authorization: Bearer [accessToken]
  Body: {
    recipientId: "user_789",       // ⚠️ Renamed from "receiver"
    drinkId: "item_456",           // ⚠️ Renamed from "item_id" or "itemId"
    venueId: "venue_123",          // NEW field (required in Club App)
    message: "Let's celebrate!",
    paymentMethod?: "card"         // NEW field (optional in Social App)
  }

Response:
  {
    id: "order_123",
    senderId: "user_456",
    recipientId: "user_789",
    drinkItem: { id, name, price },
    venueId: "venue_123",
    message: "Let's celebrate!",
    status: "pending",
    createdAt: "2025-10-30T10:30:00Z",
    expiresAt: "2025-10-31T10:30:00Z"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/orders/orders.controller.ts

COMPONENT CHANGES:
  // Transform component data before sending
  const payload = {
    recipientId: selectedUser.id,        // was: receiver.id
    drinkId: selectedDrink.id,           // was: item.id
    venueId: selectedVenue.id,           // NEW - current venue
    message: form.message
  };
  await apiClient.createOrder(payload);
```

---

#### 4.3 Update Order Status
```
Component: OffersTab.tsx (accept/reject), VenueDetailSheet.tsx
Current (Supabase):
  await supabase
    .from('orders')
    .update({ status: 'accepted' })
    .eq('id', orderId);

Direct NestJS Call:
  PUT /api/orders/:orderId
  Headers: Authorization: Bearer [accessToken]
  Body: {
    status: "accepted" | "rejected" | "expired"
  }

Response:
  {
    id: "order_123",
    status: "accepted",
    updatedAt: "2025-10-30T10:35:00Z",
    message: "Order status updated"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/orders/orders.controller.ts
```

---

#### 4.4 Delete Order
```
Component: OffersTab.tsx (cancel offer)
Current (Supabase):
  await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

Direct NestJS Call:
  DELETE /api/orders/:orderId
  Headers: Authorization: Bearer [accessToken]

Response:
  {
    message: "Order deleted successfully",
    id: "order_123"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/orders/orders.controller.ts
```

---

#### 4.5 Get Order Details
```
Component: OfferCard.tsx, DrinkRedemptionDialog.tsx
Current (Supabase):
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

Direct NestJS Call:
  GET /api/orders/:orderId
  Headers: Authorization: Bearer [accessToken]

Response:
  {
    id: "order_123",
    senderId: "user_456",
    recipientId: "user_789",
    sender: { id, displayName, profileImage },
    recipient: { id, displayName, profileImage },
    drinkItem: { id, name, price },
    venueId: "venue_123",
    venueName: "The Tipsy Tavern",
    message: "Let's celebrate!",
    status: "accepted",
    stripePaymentIntentId: "pi_123456",
    redemptionCode: "QR123456",
    createdAt: "2025-10-30T10:30:00Z",
    expiresAt: "2025-10-31T10:30:00Z"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/orders/orders.controller.ts
```

---

### 5. PRESENCE/CHECK-INS (4 Endpoints)

#### 5.1 Check In at Venue
```
Component: MapView.tsx, VenueDetailSheet.tsx, GeofenceManager.tsx
Current (Supabase):
  await supabase.from('check_ins').insert({
    user_id: userId,
    venue_id: venueId,
    wants_drink: true,
    created_at: new Date()
  });

Direct NestJS Call:
  POST /api/presence/checkin
  Headers: Authorization: Bearer [accessToken]
  Body: {
    venueId: "venue_123",
    wantsDrink?: true,            // ⚠️ Optional, defaults to false
    buyingDrinks?: false
  }

Response:
  {
    id: "presence_123",
    userId: "user_456",
    venueId: "venue_123",
    venueName: "The Tipsy Tavern",
    wantsDrink: true,
    buyingDrinks: false,
    checkedInAt: "2025-10-30T10:30:00Z",
    message: "Checked in successfully"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/presence/presence.controller.ts

GEOFENCING NOTE:
  GeofenceManager can automatically trigger this when user enters
  venue geofence boundary
```

---

#### 5.2 Check Out from Venue
```
Component: MapView.tsx, GeofenceManager.tsx
Current (Supabase):
  await supabase.from('check_ins')
    .delete()
    .eq('user_id', userId)
    .eq('venue_id', venueId);

Direct NestJS Call:
  POST /api/presence/checkout
  Headers: Authorization: Bearer [accessToken]

Response:
  {
    message: "Checked out successfully",
    venueId: "venue_123",
    checkedOutAt: "2025-10-30T11:30:00Z"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/presence/presence.controller.ts
```

---

#### 5.3 Get Venue Presence (Who's Here)
```
Component: VenueDetailSheet.tsx (shows users here)
Current (Supabase):
  const { data } = await supabase
    .from('check_ins')
    .select('*, users(*)')
    .eq('venue_id', venueId)
    .eq('active', true);

Direct NestJS Call:
  GET /api/presence/:venueId
  Headers: Authorization: Bearer [accessToken]

Response:
  {
    venueId: "venue_123",
    totalCount: 45,
    wantingDrinks: 23,
    users: [
      {
        userId: "user_456",
        displayName: "Jane Smith",
        profileImage: "https://...",
        wantsDrink: true,
        buyingDrinks: false,
        checkedInAt: "2025-10-30T10:30:00Z"
      },
      // ... more users
    ]
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/presence/presence.controller.ts
```

---

#### 5.4 Update Presence Status
```
Component: VenueDetailSheet.tsx (toggle wantsDrink)
Current (Supabase):
  await supabase
    .from('check_ins')
    .update({ wants_drink: true })
    .eq('user_id', userId);

Direct NestJS Call:
  PUT /api/presence
  Headers: Authorization: Bearer [accessToken]
  Body: {
    wantsDrink?: true,
    buyingDrinks?: false
  }

Response:
  {
    id: "presence_123",
    wantsDrink: true,
    buyingDrinks: false,
    updatedAt: "2025-10-30T10:35:00Z"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/presence/presence.controller.ts
```

---

### 6. MESSAGES & GROUPS (5 Endpoints)

#### 6.1 Get Conversations
```
Component: App.tsx (MessagesTab), ConversationsList.tsx
Current (Supabase):
  const { data } = await supabase
    .from('conversations')
    .select('*, messages(count)')
    .order('updated_at', { ascending: false });

Direct NestJS Call:
  GET /api/groups
  Headers: Authorization: Bearer [accessToken]

Response:
  [
    {
      id: "group_123",
      name: "College Friends",
      description: "Friends from university",
      type: "group",  // "direct" or "group"
      members: 8,
      lastMessage: "See you at the bar!",
      lastMessageTime: "2025-10-30T10:30:00Z",
      unreadCount: 3,
      image: "https://..."
    },
    {
      id: "direct_456",
      name: "Jane Smith",
      type: "direct",
      members: 2,
      lastMessage: "Let's celebrate!",
      lastMessageTime: "2025-10-30T09:15:00Z",
      unreadCount: 0,
      image: "https://..."
    },
    // ... more conversations
  ]

Status: ✅ Endpoint exists
Location: /backend/src/modules/groups/groups.controller.ts

MAPPING NOTE:
  Social App uses "conversations", Club App uses "groups"
  But structure is compatible
```

---

#### 6.2 Get Messages from User/Group
```
Component: ChatView.tsx
Current (Supabase):
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

Direct NestJS Call:
  GET /api/messages?groupId=group_123
  OR
  GET /api/groups/:groupId/messages
  Headers: Authorization: Bearer [accessToken]

Response:
  [
    {
      id: "msg_123",
      groupId: "group_123",
      userId: "user_456",
      userName: "Jane Smith",
      userImage: "https://...",
      content: "See you at the bar!",
      createdAt: "2025-10-30T10:30:00Z",
      readAt: "2025-10-30T10:31:00Z"
    },
    // ... more messages
  ]

Status: ✅ Endpoint exists
Location: /backend/src/modules/groups/groups.controller.ts
           or /backend/src/modules/messages/messages.controller.ts
```

---

#### 6.3 Send Message
```
Component: ChatView.tsx (message input)
Current (Supabase):
  await supabase.from('messages').insert({
    group_id: groupId,
    user_id: userId,
    content: "See you at the bar!",
    created_at: new Date()
  });

Direct NestJS Call:
  POST /api/messages
  Headers: Authorization: Bearer [accessToken]
  Body: {
    groupId: "group_123",       // ⚠️ Verify field name
    content: "See you at the bar!",
    attachments?: []            // Optional file attachments
  }

Response:
  {
    id: "msg_123",
    groupId: "group_123",
    userId: "user_456",
    userName: "Jane Smith",
    content: "See you at the bar!",
    createdAt: "2025-10-30T10:30:00Z"
  }

Status: ⏳ Verify endpoint exists and field names
Location: /backend/src/modules/messages/messages.controller.ts
```

---

#### 6.4 Create Group
```
Component: CreateGroupDialog.tsx
Current (Supabase):
  await supabase.from('groups').insert({
    name: "College Friends",
    description: "Friends from university",
    created_by: userId
  });

Direct NestJS Call:
  POST /api/groups
  Headers: Authorization: Bearer [accessToken]
  Body: {
    name: "College Friends",
    description: "Friends from university",
    memberIds: ["user_456", "user_789"],
    image?: "https://..."
  }

Response:
  {
    id: "group_123",
    name: "College Friends",
    description: "Friends from university",
    createdBy: "user_456",
    members: 2,
    createdAt: "2025-10-30T10:30:00Z"
  }

Status: ⏳ Verify endpoint exists
Location: /backend/src/modules/groups/groups.controller.ts
```

---

#### 6.5 Add Member to Group
```
Component: GroupDetailDialog.tsx (add members)
Current (Supabase):
  await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId });

Direct NestJS Call:
  POST /api/groups/:groupId/members
  Headers: Authorization: Bearer [accessToken]
  Body: {
    userId: "user_789"
  }

Response:
  {
    id: "member_123",
    groupId: "group_123",
    userId: "user_789",
    addedAt: "2025-10-30T10:30:00Z"
  }

Status: ⏳ Verify endpoint exists
Location: /backend/src/modules/groups/groups.controller.ts
```

---

### 7. FRIENDS & SOCIAL (4 Endpoints)

#### 7.1 Get Friends List
```
Component: FriendsView.tsx
Current (Supabase):
  const { data } = await supabase
    .from('friendships')
    .select('*, friend_user:user_id(*)')
    .eq('user_id', userId)
    .eq('status', 'accepted');

Direct NestJS Call:
  GET /api/users/me/friends
  OR
  GET /api/users/:userId/friends
  Headers: Authorization: Bearer [accessToken]

Response:
  [
    {
      id: "friend_123",
      userId: "user_789",
      displayName: "Jane Smith",
      profileImage: "https://...",
      bio: "Cocktail enthusiast",
      friendSince: "2025-08-15T10:30:00Z"
    },
    // ... more friends
  ]

Status: ⏳ May need implementation
Location: /backend/src/modules/users/users.controller.ts

NOTES:
  Check if friends endpoint exists in backend
  If not, create it
```

---

#### 7.2 Send Friend Request
```
Component: UserProfile.tsx (add friend button)
Current (Supabase):
  await supabase.from('friend_requests').insert({
    sender_id: currentUserId,
    recipient_id: recipientId,
    status: 'pending'
  });

Direct NestJS Call:
  POST /api/users/:userId/friend-requests
  Headers: Authorization: Bearer [accessToken]
  Body: {
    message?: "Let's be friends!"
  }

Response:
  {
    id: "req_123",
    senderId: "user_456",
    recipientId: "user_789",
    status: "pending",
    createdAt: "2025-10-30T10:30:00Z"
  }

Status: ⏳ May need implementation
Location: /backend/src/modules/users/users.controller.ts
```

---

#### 7.3 Accept/Reject Friend Request
```
Component: FriendsView.tsx (pending requests)
Current (Supabase):
  await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId);

Direct NestJS Call:
  PUT /api/users/:userId/friend-requests/:requestId
  Headers: Authorization: Bearer [accessToken]
  Body: {
    status: "accepted" | "rejected"
  }

Response:
  {
    id: "req_123",
    status: "accepted",
    createdFriendshipId: "friend_123",
    updatedAt: "2025-10-30T10:35:00Z"
  }

Status: ⏳ May need implementation
Location: /backend/src/modules/users/users.controller.ts
```

---

#### 7.4 Remove Friend
```
Component: UserProfile.tsx, FriendsView.tsx (unfriend)
Current (Supabase):
  await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

Direct NestJS Call:
  DELETE /api/users/me/friends/:userId
  OR
  DELETE /api/friendships/:friendshipId
  Headers: Authorization: Bearer [accessToken]

Response:
  {
    message: "Friend removed successfully",
    userId: "user_789"
  }

Status: ⏳ May need implementation
Location: /backend/src/modules/users/users.controller.ts
```

---

### 8. REDEMPTIONS (2 Endpoints)

#### 8.1 Get Redemptions for User
```
Component: OffersTab.tsx (bartender view), RedemptionsList.tsx
Current (Supabase):
  const { data } = await supabase
    .from('redemptions')
    .select('*')
    .eq('user_id', userId);

Direct NestJS Call:
  GET /api/redemptions
  Headers: Authorization: Bearer [accessToken]
  Parameters:
    - status: "pending" | "redeemed" | "expired" (optional)

Response:
  [
    {
      id: "redemption_123",
      orderId: "order_456",
      code: "QR123456",
      status: "pending",  // pending, redeemed, expired
      drinkItem: {
        id: "item_456",
        name: "Guinness",
        price: 6.50
      },
      venue: {
        id: "venue_123",
        name: "The Tipsy Tavern"
      },
      recipient: {
        id: "user_789",
        displayName: "John Doe"
      },
      expiresAt: "2025-10-31T10:30:00Z",
      redeemedAt: null
    },
    // ... more redemptions
  ]

Status: ✅ Endpoint exists
Location: /backend/src/modules/redemptions/redemptions.controller.ts
```

---

#### 8.2 Redeem Offer (Bartender)
```
Component: DrinkRedemptionDialog.tsx (bartender scans QR)
Current (Supabase):
  await supabase
    .from('redemptions')
    .update({
      status: 'redeemed',
      redeemed_at: new Date(),
      redeemed_by: bartenderId
    })
    .eq('code', code);

Direct NestJS Call:
  POST /api/redemptions/redeem
  Headers: Authorization: Bearer [accessToken]  // Bartender's token
  Body: {
    code: "QR123456",
    verificationMethod: "qr_scan"  // or "manual_entry"
  }

Response:
  {
    id: "redemption_123",
    orderId: "order_456",
    status: "redeemed",
    drink: {
      name: "Guinness",
      price: 6.50
    },
    recipient: {
      displayName: "John Doe"
    },
    venue: {
      name: "The Tipsy Tavern"
    },
    redeemedAt: "2025-10-30T10:45:00Z",
    message: "Drink redeemed successfully!"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/redemptions/redemptions.controller.ts
```

---

### 9. ADMIN/BARTENDER (3 Endpoints)

#### 9.1 Verify Bartender Status
```
Component: BartenderVerificationDialog.tsx
Current (Supabase):
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

Direct NestJS Call:
  GET /api/users/me
  Headers: Authorization: Bearer [accessToken]
  
  Then check: user.role === 'bartender'

OR

  GET /api/users/me/bartender-status
  Headers: Authorization: Bearer [accessToken]

Response:
  {
    isBartender: true,
    venue: {
      id: "venue_123",
      name: "The Tipsy Tavern"
    },
    verificationLevel: "verified",
    badgeExpiry: "2026-10-30"
  }

Status: ✅ Endpoint exists (via GET /users/me)
Location: /backend/src/modules/users/users.controller.ts
```

---

#### 9.2 Get Pending Redemptions (Bartender Dashboard)
```
Component: BartenderDashboard.tsx (not in Social App, but referenced)
Current (Supabase):
  const { data } = await supabase
    .from('redemptions')
    .select('*')
    .eq('venue_id', venueId)
    .eq('status', 'pending');

Direct NestJS Call:
  GET /api/redemptions?venueId=venue_123&status=pending
  Headers: Authorization: Bearer [accessToken]  // Bartender's token

Response:
  [
    {
      id: "redemption_123",
      code: "QR123456",
      drinkItem: { id, name, price },
      recipient: { displayName },
      expiresAt: "2025-10-31T10:30:00Z"
    },
    // ... more pending redemptions
  ]

Status: ✅ Endpoint exists
Location: /backend/src/modules/redemptions/redemptions.controller.ts
```

---

#### 9.3 Bartender Verification (Age Check UI)
```
Component: BartenderVerificationDialog.tsx
Current (Supabase):
  // Verification happens externally or via Persona/IDmission

Direct NestJS Call:
  POST /api/users/me/verify-age
  Headers: Authorization: Bearer [accessToken]
  Body: {
    documentType: "drivers_license" | "passport" | "national_id",
    documentUrl: "https://..."  // Pre-signed S3 URL
  }

Response:
  {
    id: "verification_123",
    status: "pending",  // pending, verified, rejected
    kycProvider: "persona",  // persona or idenfy
    submittedAt: "2025-10-30T10:30:00Z",
    message: "Verification submitted - typically resolved within 24 hours"
  }

Status: ✅ Endpoint exists
Location: /backend/src/modules/users/users.controller.ts
```

---

## SUMMARY TABLE - All Endpoints

| # | Category | Endpoint | Method | Status | Priority |
|---|----------|----------|--------|--------|----------|
| 1 | Auth | /auth/signup | POST | ✅ | 🔴 CRITICAL |
| 2 | Auth | /auth/login | POST | ✅ | 🔴 CRITICAL |
| 3 | Auth | /auth/refresh-token | POST | ✅ | 🔴 CRITICAL |
| 4 | Auth | /auth/logout | POST | ✅ | 🔴 CRITICAL |
| 5 | Profile | /users/me | GET | ✅ | 🔴 CRITICAL |
| 6 | Profile | /users/me | PUT | ✅ | 🟠 HIGH |
| 7 | Profile | /users/:userId | GET | ✅ | 🟠 HIGH |
| 8 | Profile | /users/search | GET | ✅ | 🟡 MEDIUM |
| 9 | Profile | /users/me/upload-avatar | POST | ✅ | 🟡 MEDIUM |
| 10 | Venues | /venues | GET | ✅ | 🔴 CRITICAL |
| 11 | Venues | /venues/:venueId | GET | ✅ | 🔴 CRITICAL |
| 12 | Venues | /venues/:venueId/menu | GET | ✅ | 🔴 CRITICAL |
| 13 | Orders | /orders | GET | ✅ | 🔴 CRITICAL |
| 14 | Orders | /orders | POST | ✅ | 🔴 CRITICAL |
| 15 | Orders | /orders/:orderId | PUT | ✅ | 🟠 HIGH |
| 16 | Orders | /orders/:orderId | DELETE | ✅ | 🟠 HIGH |
| 17 | Orders | /orders/:orderId | GET | ✅ | 🟠 HIGH |
| 18 | Presence | /presence/checkin | POST | ✅ | 🔴 CRITICAL |
| 19 | Presence | /presence/checkout | POST | ✅ | 🟠 HIGH |
| 20 | Presence | /presence/:venueId | GET | ✅ | 🟠 HIGH |
| 21 | Presence | /presence | PUT | ✅ | 🟡 MEDIUM |
| 22 | Messages | /groups | GET | ✅ | 🟠 HIGH |
| 23 | Messages | /groups/:groupId/messages | GET | ✅ | 🟠 HIGH |
| 24 | Messages | /messages | POST | ⏳ | 🟠 HIGH |
| 25 | Messages | /groups | POST | ⏳ | 🟡 MEDIUM |
| 26 | Messages | /groups/:groupId/members | POST | ⏳ | 🟡 MEDIUM |
| 27 | Friends | /users/me/friends | GET | ⏳ | 🟡 MEDIUM |
| 28 | Friends | /users/:userId/friend-requests | POST | ⏳ | 🟡 MEDIUM |
| 29 | Friends | /users/:userId/friend-requests/:requestId | PUT | ⏳ | 🟡 MEDIUM |
| 30 | Friends | /users/me/friends/:userId | DELETE | ⏳ | 🟡 MEDIUM |
| 31 | Redemptions | /redemptions | GET | ✅ | 🔴 CRITICAL |
| 32 | Redemptions | /redemptions/redeem | POST | ✅ | 🔴 CRITICAL |
| 33 | Admin | /users/me | GET | ✅ | 🟠 HIGH |
| 34 | Admin | /redemptions (venue-scoped) | GET | ✅ | 🔴 CRITICAL |
| 35 | Admin | /users/me/verify-age | POST | ✅ | 🟠 HIGH |

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Critical Endpoints (Week 1-2)
- [ ] Auth endpoints (1-4)
- [ ] Profile endpoints (5-7)
- [ ] Venues endpoints (10-12)
- [ ] Orders endpoints (13-17)
- [ ] Presence endpoints (18-20)
- [ ] Redemptions endpoints (31-32)

### Phase 2: High Priority Endpoints (Week 3-4)
- [ ] Messages endpoints (22-26)
- [ ] Admin endpoints (33-35)

### Phase 3: Medium Priority Endpoints (Week 5)
- [ ] Friends endpoints (27-30)
- [ ] Additional features

---

## FIELD NAME MAPPING REFERENCE

Use this table when adapting component code:

| Social Networking App | Club App NestJS | Notes |
|----------------------|-----------------|-------|
| `sender_id` | `senderId` | Order/Message sender |
| `receiver` / `recipient_id` | `recipientId` | Order recipient |
| `item` / `item_id` | `drinkItem` / `drinkId` | Menu item |
| `offer` | `order` | Renamed concept |
| `check_in` / `presence` | `presence` | Same concept |
| `wants_drink` | `wantsDrink` | Check-in preference |
| `buying_drinks` | `buyingDrinks` | Check-in preference |
| `user_id` | `userId` | User identifier |
| `venue_id` | `venueId` | Venue identifier |
| `group_id` | `groupId` | Conversation/Group |
| `created_at` | `createdAt` | Timestamp |
| `updated_at` | `updatedAt` | Timestamp |
| `role` | `role` | User role (bartender, admin) |

---

## VERIFICATION CHECKLIST

Before starting component migration, verify:

- [ ] All 4 auth endpoints working correctly
- [ ] JWT token refresh working
- [ ] Profile endpoints return correct data structure
- [ ] Venues endpoint filters by proximity correctly
- [ ] Orders endpoint handles all CRUD operations
- [ ] Presence endpoints work with geofencing
- [ ] Redemptions endpoint generates QR codes
- [ ] All error responses are consistent (401, 403, 404, 500)
- [ ] CORS headers allow frontend to call backend
- [ ] Rate limiting is configured appropriately

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Last Updated:** October 30, 2025  
**Created by:** AI Assistant
