# 🚀 TreatMe App - Quick Start Guide

## 📍 Accessing the App

```bash
# Start the development server
cd C:\ai4\desh\club\web
npm run dev

# Open browser
http://localhost:3000
```

---

## 🗺️ **App Navigation Structure**

```
http://localhost:3000
├── /login                    # Tab-based auth (Sign In, Sign Up, OTP)
└── /app/map                  # Main app (protected route)
    ├── /app/map              # 🗺️ Venue map with check-ins
    ├── /app/discover         # 👥 User discovery cards
    ├── /app/friends          # 👫 Friends & requests
    ├── /app/groups           # 👥 Groups management
    ├── /app/offers           # 🎁 Drink offers
    ├── /app/messages         # 💬 Messaging
    ├── /app/profile          # 👤 User profile
    └── /app/settings         # ⚙️ App settings
```

---

## 🎯 **Each Page at a Glance**

### 1. **Map Page** (`/app/map`)
- **What You See**: Leaflet map of San Francisco with venue markers
- **Markers**: Color-coded by type (Cafe🟤, Bar🔴, Nightclub🟣, Restaurant🟢)
- **Numbers**: Show check-in counts at each venue
- **Legend**: Top-right shows venue type colors
- **Zoom**: + and - buttons in bottom-right
- **Click Marker**: Shows venue details popup
- **Stats**: "124 people checked in nearby" badge

### 2. **Discover Page** (`/app/discover`)
- **What You See**: Tinder-style user cards
- **Card Info**: Name, age, location, bio, interests
- **Stats**: Mutual friends, shared venues, shared interests
- **Actions**: Pass (gray), Like (pink), Message (outline)
- **Progress**: Shows "1 of 4 users" with progress bar

### 3. **Friends Page** (`/app/friends`)
- **Tab 1 - My Friends**: List of accepted friends
- **Tab 2 - Requests**: Pending friend requests
- **Friends Card**: Avatar, name, mutual friends count
- **Actions**: Message button, options menu
- **Requests**: Accept/Reject buttons

### 4. **Groups Page** (`/app/groups`)
- **Your Groups**: Groups you've joined (Wine Lovers, Craft Beer Heads)
- **Recommended**: Groups you can join (Cocktail Mixers, Weekend Warriors, Foodie & Drinker)
- **Actions**: View button for joined groups, Join button for others
- **Create**: "Create Group" button in header

### 5. **Offers Page** (`/app/offers`)
- **Tab 1 - Received**: Drink offers sent to you
- **Tab 2 - Sent**: Drink offers you sent
- **Offer Card**: Sender, drink type, venue, message, status
- **Status Badges**: Pending (yellow), Accepted (green), Declined (red)
- **Actions**: Accept/Decline buttons for pending received offers

### 6. **Messages Page** (`/app/messages`)
- **Left Side**: Conversation list (Sarah, Alex, Emma)
- **Right Side**: Chat view with message bubbles
- **Conversations**: Show avatar, name, last message, timestamp, unread indicator
- **Messages**: Different styles for sent (gradient) vs received (gray)
- **Input**: Text box with attachments, emoji, send button
- **Enter Key**: Sends message

### 7. **Profile Page** (`/app/profile`)
- **Avatar**: Emoji with gradient background
- **Edit Mode**: Click "Edit Profile" button to edit
- **Fields**: Name, age, location, bio (not editable), interests
- **Stats**: Friends count, groups joined, offers sent
- **Save**: "Save Changes" button in edit mode

### 8. **Settings Page** (`/app/settings`)
- **Notifications**: Messages, Friend Requests, Offers, Check-Ins (toggles)
- **Privacy**: Public Profile, Online Status, Allow Messages (toggles)
- **Appearance**: Dark Mode toggle, Font Size selector
- **Account**: Change Password, 2FA, Download Data links
- **Help**: Contact Support, Report Bug, Help Center
- **Danger Zone**: Delete Account button (red)

---

## 🎨 **Design System**

### Colors
- **Primary**: Indigo → Purple → Pink gradients
- **Text**: Dark gray (#111827), light gray (#6B7280)
- **Background**: White, light gray
- **Accents**: Red (alerts), Green (success), Yellow (warning)

### Typography
- **Headers**: 3xl bold (24px)
- **Subheaders**: lg bold (18px)
- **Body**: base regular (16px)
- **Small**: sm/xs (14px/12px)

### Spacing
- **Gap**: 4 units (16px)
- **Padding**: 6 units (24px)
- **Margin**: varies

---

## 🧪 **Test Data**

### Login Credentials (UI Only - No Backend)
- Email: `test@example.com`
- Password: `Test123!`

### Mock Users (Discover Page)
1. **Sarah, 24** - Wine enthusiast 🍷
   - Location: San Francisco
   - Interests: Wine, Travel, Music

2. **Alex, 26** - Craft beer expert 🍺
   - Location: Oakland
   - Interests: Beer, Food, Hiking

3. **Emma, 23** - Cocktail mixer 🍹
   - Location: San Francisco
   - Interests: Cocktails, Music, Dancing

4. **James, 28** - Whiskey connoisseur 🥃
   - Location: Berkeley
   - Interests: Whiskey, Sports, Gaming

### Mock Venues (Map Page)
1. The Golden Gate (bar) - 12 check-ins
2. Mission Coffee (cafe) - 8 check-ins
3. Castro Night Club (nightclub) - 31 check-ins
4. Sunset Restaurant (restaurant) - 15 check-ins
5. Downtown Bar (bar) - 19 check-ins

### Mock Groups
- ✓ Wine Lovers (342 members) - *Joined*
- ✓ Craft Beer Heads (567 members) - *Joined*
- Cocktail Mixers (289 members)
- Weekend Warriors (892 members)
- Foodie & Drinker (456 members)

### Mock Conversations
- **Sarah**: "That sounds great! See you then 😊" (2 min ago)
- **Alex**: "Thanks for the beer recommendation!" (1 hour ago)
- **Emma**: "Let me know when you are free" (3 hours ago)

### Mock Offers
- Sarah → Wine (received, pending)
- Alex → Beer (sent, accepted)
- Emma → Cocktail (received, pending)
- James → Whiskey (sent, declined)

---

## 🔧 **Features to Test**

### Navigation
- [ ] Click sidebar items - pages change
- [ ] Active button highlights with gradient
- [ ] Logout button redirects to login

### Map Page
- [ ] Zoom in/out with buttons
- [ ] Click venue marker - shows popup
- [ ] Legend shows all venue types
- [ ] "124 people checked in nearby" visible

### Discover Page
- [ ] Pass button - next user
- [ ] Like button - adds to liked list, shows next user
- [ ] Progress bar updates
- [ ] End of list shows "No more users"
- [ ] Start Over button resets

### Friends Page
- [ ] Switch between tabs
- [ ] Friend list shows avatars and names
- [ ] Requests tab shows pending requests
- [ ] Accept button - moves to friends
- [ ] Reject button - removes request

### Groups Page
- [ ] Join button - adds to "Your Groups"
- [ ] Leave button - removes from groups
- [ ] Create Group button visible

### Offers Page
- [ ] Switch between Received/Sent tabs
- [ ] Status badges show correct colors
- [ ] Accept button - changes status to green
- [ ] Decline button - changes status to red

### Messages Page
- [ ] Click conversation - loads chat
- [ ] Type message - appears in input
- [ ] Enter key - sends message
- [ ] Message appears in chat with timestamp
- [ ] Unread indicator on conversations

### Profile Page
- [ ] Click Edit Profile - enables edit mode
- [ ] Edit fields - can type new values
- [ ] Save Changes - saves and exits edit mode
- [ ] Cancel - discards changes
- [ ] Stats display

### Settings Page
- [ ] Toggle switches - smooth animation
- [ ] Font size dropdown - changes selection
- [ ] All sections present and organized

---

## ⚠️ **Known Limitations**

1. **No Backend Integration Yet**: All data is mock data
2. **No Authentication**: Login shows success but doesn't validate
3. **No Persistence**: Refreshing page resets state
4. **No WebSockets**: Real-time features not connected
5. **No API Calls**: All data is hardcoded

---

## 🚀 **Next Steps**

### To Enable Real Authentication:
```typescript
// Update web/utils/api-client.ts
// Implement actual API calls to backend
// Backend must have these endpoints:
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/phone/send-otp
POST /api/auth/phone/verify-otp
```

### To Connect to Real Data:
```typescript
// Update each page to fetch from API:
GET /api/users/discover
GET /api/friends
GET /api/groups
GET /api/messages
GET /api/offers
GET /api/venues
```

---

## 📱 **Responsive Design**

- **Desktop**: Full sidebar + content (tested on 1920x1080)
- **Tablet**: May need adjustments
- **Mobile**: Not yet optimized (sidebar would cover content)

---

## 🆘 **Troubleshooting**

### Pages show 404
```bash
# Clear Next.js cache and restart
rm -r .next
npm run dev
```

### Sidebar doesn't appear
- Check that you're on `/app/*` route (protected)
- Check browser console for errors

### Maps don't load
- Check internet connection (needs Leaflet CDN)
- Check browser console for CORS errors

### Styles look broken
- Ensure Tailwind CSS is building
- Check that `globals.css` is imported

---

## 📚 **File Locations**

- **Navigation**: `app/components/navigation.tsx`
- **Layout**: `app/(main)/layout.tsx`
- **Pages**: `app/(main)/[page]/page.tsx`
- **Login**: `app/(auth)/login/page.tsx`
- **Auth Store**: `store/authStore.ts`
- **Styles**: `app/globals.css`

---

## ✨ **Highlights**

- ✅ Beautiful gradient UI (Indigo → Purple → Pink)
- ✅ Smooth animations and transitions
- ✅ Responsive design patterns
- ✅ Comprehensive mock data
- ✅ Professional layout and spacing
- ✅ Interactive elements (buttons, toggles, tabs)
- ✅ All 8 social features implemented

---

**Status**: 🟢 **UI Complete - Ready for Backend Integration**

*Last Updated: October 30, 2025*
