# 🧪 Club App - Phase 2-4 Testing Guide

## Overview
This guide provides comprehensive testing instructions for the newly implemented Phase 2-4 features with mock data.

---

## 📋 Test Scenarios

### **PHASE 2: Map & Venues** 🗺️

#### Test 1: Venue List Display
- **Navigation:** Tab → Venues 🗺️
- **Expected:** See 5 venues with:
  - ✅ Venue name and type badge
  - ✅ Star rating (⭐) with review count
  - ✅ Distance in km
  - ✅ Hours of operation
  - ✅ Live buyer/receiver counts
  - ✅ Blue "Check In 📍" button

**Venues:**
1. The Rooftop Lounge (⭐ 4.8, Lounge)
2. Electric Avenue (⭐ 4.5, Club)
3. The Irish Pub (⭐ 4.3, Pub)
4. Mixology Masters (⭐ 4.9, Bar)
5. Night Owl Club (⭐ 4.2, Club)

---

#### Test 2: Search Functionality
- **Action:** Type in search bar "rooftop"
- **Expected:** Only "The Rooftop Lounge" displays
- **Action:** Clear search
- **Expected:** All 5 venues return

---

#### Test 3: Filter by Type
- **Action:** Click filter chip "Club"
- **Expected:** Only 2 venues show (Electric Avenue, Night Owl Club)
- **Action:** Try "Bar", "Pub", "Lounge", "All"
- **Expected:** Correct venues filter for each type

---

#### Test 4: Sort Options
- **Action:** Click "📍 Distance"
- **Expected:** Venues sort by closest first (0.2 → 0.8 km)
- **Action:** Click "⭐ Rating"
- **Expected:** Highest rated first (4.9 → 4.2)
- **Action:** Click "👥 Popularity"
- **Expected:** Most people (50+ → 12)

---

#### Test 5: Venue Card Interaction
- **Action:** Tap on "The Rooftop Lounge" card
- **Expected:** Navigate to Venue Details screen

---

### **PHASE 2.5: Venue Details** 🏢

#### Test 6: Venue Details Display
- **Navigation:** From map, tap any venue
- **Expected to see:**
  - ✅ Header with "← Back" button
  - ✅ Large emoji hero section (🍺)
  - ✅ Venue name in large text
  - ✅ Type badge (e.g., "LOUNGE")
  - ✅ Star rating with review count

---

#### Test 7: Info Cards
- **Expected to see 3 cards:**
  1. 📍 Distance: "0.2 km"
  2. ⏰ Open Now: "5:00 PM"
  3. 🎯 Popular: "20"

---

#### Test 8: About Section
- **Expected:** Venue description displays correctly
- Example: "Upscale rooftop bar with city views and craft cocktails"

---

#### Test 9: Location & Hours
- **Expected:**
  - Address: "123 Main St, New York, NY 10001"
  - Hours: "5:00 PM - 2:00 AM"

---

#### Test 10: Live Activity
- **Expected 2 cards:**
  - "Looking to Buy: 12"
  - "Looking to Receive: 8"

---

#### Test 11: Group Selection
- **Expected:** 2 groups with emoji and names:
  1. 🎉 Weekend Warriors (5 members)
  2. 🍻 Night Owls (3 members)
- **Action:** Tap a group
- **Expected:** Blue border and checkmark appear

---

#### Test 12: Reviews Section
- **Expected:** 3 reviews with:
  - Author name
  - Star rating (⭐⭐⭐⭐⭐)
  - Comment text
  - "2 days ago" timestamp

---

#### Test 13: Action Buttons
- **Expected 2 buttons at bottom:**
  - "📍 Check In" (blue)
  - "🍻 Send Order" (purple)
- **Action:** Tap "Check In" without selecting group
- **Expected:** Alert "Please select a group to check in with"
- **Action:** Select group, tap "Check In"
- **Expected:** Alert "Success" + button changes to "✓ Checked In"

---

#### Test 14: Send Order Navigation
- **Action:** Tap "🍻 Send Order"
- **Expected:** Navigate to create order screen (or modal)

---

#### Test 15: Back Navigation
- **Action:** Tap "← Back"
- **Expected:** Return to Map screen with all venues

---

### **PHASE 3: Groups Management** 👫

#### Test 16: Groups List
- **Navigation:** Tab → Groups 👫
- **Expected:**
  - ✅ Title "👫 My Groups"
  - ✅ "+ New" button (top right)
  - ✅ Search bar
  - ✅ 2 existing groups with emoji cards

---

#### Test 17: Group Cards Display
- **Expected for each group:**
  - 🎉 Weekend Warriors | 5 members | 📍 At The Rooftop Lounge
  - 🍻 Night Owls | 3 members | 📍 At Electric Avenue
  - Right arrow "▶" indicator

---

#### Test 18: Expand Group
- **Action:** Tap on group card
- **Expected:**
  - ✅ Card highlights (blue border)
  - ✅ Arrow changes to "▼"
  - ✅ Expanded details show below

---

#### Test 19: Group Members View
- **Expected in expanded view:**
  - Section: "Members"
  - List of members with avatars
  - First member marked "(owner)"
  - Example: 👨 Alex (owner), 👩 Jordan, etc.

---

#### Test 20: Current Location
- **Expected:**
  - Section: "Current Location"
  - Venue card with 🍺 emoji
  - Venue name and type

---

#### Test 21: Group Actions
- **Expected 3 buttons:**
  - "👥 Add Member"
  - "📍 Change Venue"
  - "🗑️ Delete" (red text)

---

#### Test 22: Delete Group
- **Action:** Tap "🗑️ Delete"
- **Expected:** Confirmation alert "Delete Group - Are you sure?"
- **Action:** Tap "Delete"
- **Expected:** Group removed from list

---

#### Test 23: Create Group Modal
- **Action:** Tap "+ New" button
- **Expected:**
  - ✅ Modal slides up from bottom
  - ✅ Title: "Create New Group"
  - ✅ Close button "✕"
  - ✅ Input field: "e.g., Weekend Warriors"
  - ✅ Character counter "0/50"
  - ✅ Cancel and Create buttons

---

#### Test 24: Create Group
- **Action:** Enter "Squad Goals"
- **Expected:** Counter shows "11/50"
- **Action:** Tap "Create"
- **Expected:**
  - ✅ Alert: "Group created successfully!"
  - ✅ Modal closes
  - ✅ New group appears in list with 🎉 emoji

---

#### Test 25: Search Groups
- **Action:** Type "Warriors" in search
- **Expected:** Only "Weekend Warriors" displays
- **Action:** Clear search
- **Expected:** All groups return

---

### **PHASE 4: Orders & Transactions** 🍻

#### Test 26: Orders Dashboard
- **Navigation:** Tab → Orders 🍻
- **Expected:**
  - ✅ Title "🍻 My Orders"
  - ✅ 3 stat cards: Pending (1) | Accepted (1) | Redeemed (1)
  - ✅ Filter tabs: All | Pending | Accepted | Redeemed
  - ✅ Order list below

---

#### Test 27: Order Cards
- **Expected 3 orders:**

| Icon | From/To | Venue | Status | Amount | Time |
|------|---------|-------|--------|--------|------|
| 🎉 | From Alex | Rooftop | ⏳ Pending | $28.50 | 1h left |
| 🎁 | Sent to Jordan | Electric | ✓ Accepted | $12.00 | 1h left |
| ✅ | From Sam | Irish Pub | ✅ Redeemed | $8.50 | Expired |

---

#### Test 28: Filter Orders
- **Action:** Tap "Pending" tab
- **Expected:** Only 1 order shows
- **Action:** Tap "Accepted"
- **Expected:** Only 1 order shows
- **Action:** Tap "All"
- **Expected:** All 3 orders return

---

#### Test 29: Expand Order
- **Action:** Tap on order card
- **Expected:**
  - ✅ Card expands
  - ✅ Blue left border appears
  - ✅ Details section shows below

---

#### Test 30: Order Details View
- **Expected sections:**
  1. **Items:** 🍷 Mojito, 🍷 Margarita
  2. **Details:** From, To, Venue, Total ($28.50)
  3. **Timeline:** Created & Expires timestamps
  4. **Actions:** Accept/Decline buttons (green/red)

---

#### Test 31: Accept Order
- **Action:** On pending order, tap "✓ Accept"
- **Expected:**
  - ✅ Alert: "Order accepted!"
  - ✅ Status changes to "✓ Accepted"
  - ✅ Status badge color changes to blue

---

#### Test 32: Decline Order
- **Action:** Expand another pending order (if available)
- **Expected:** "✕ Decline" button shows
- **Action:** Tap Decline
- **Expected:** Confirmation alert "Are you sure?"

---

#### Test 33: Show QR Code
- **Action:** On accepted order, tap "📱 Show QR Code"
- **Expected:** Alert "Show this QR code to the bartender"
- **Action:** Tap OK
- **Expected:** Order status changes to "✅ Redeemed"

---

#### Test 34: Time Remaining
- **Expected on cards:**
  - "1h left" for recent orders
  - "Expired" for old orders
- **Logic:** Should update based on expiresAt timestamp

---

#### Test 35: Empty State
- **Action:** Filter to a status with no orders
- **Expected:** Empty state showing:
  - Large emoji 🍻
  - "No orders"
  - Description message

---

### **NAVIGATION & GENERAL** 🧭

#### Test 36: Tab Navigation
- **Expected tabs at bottom:**
  - 🗺️ Venues (active blue)
  - 👫 Groups (gray)
  - 🍻 Orders (gray)
- **Action:** Tap each tab
- **Expected:** Smooth navigation between screens

---

#### Test 37: Screen State Persistence
- **Action:** Go to Map → Search "club" → Go to Groups → Return to Map
- **Expected:** Search remains active (showing only club venues)

---

#### Test 38: Keyboard Handling
- **Action:** On search fields, tap and type
- **Expected:** Keyboard appears and filters work in real-time

---

#### Test 39: Scrolling
- **Action:** On any list (venues, groups, orders)
- **Expected:** Smooth scrolling with momentum

---

#### Test 40: Responsive Layout
- **Device orientation:** Portrait (main) and Landscape (if supported)
- **Expected:** UI adapts properly to width changes

---

## 📱 How to Test

### Option 1: Physical Device (Recommended)
```bash
cd mobile
npm run android
# Scan QR code with Expo Go app
```

### Option 2: Android Emulator
```bash
cd mobile
npm run android
# Auto-connects if emulator running
```

### Option 3: Web Browser (Preview)
```bash
cd mobile
npm run web
# Open http://localhost:19006
```

### Option 4: iOS (if available)
```bash
cd mobile
npm run ios
```

---

## 🎯 Test Checklist

Use this to track progress:

```
PHASE 2 - Map & Venues:
[ ] Test 1: Venue List Display
[ ] Test 2: Search Functionality
[ ] Test 3: Filter by Type
[ ] Test 4: Sort Options
[ ] Test 5: Venue Card Interaction

PHASE 2.5 - Venue Details:
[ ] Test 6: Details Display
[ ] Test 7: Info Cards
[ ] Test 8: About Section
[ ] Test 9: Location & Hours
[ ] Test 10: Live Activity
[ ] Test 11: Group Selection
[ ] Test 12: Reviews Section
[ ] Test 13: Action Buttons
[ ] Test 14: Send Order Navigation
[ ] Test 15: Back Navigation

PHASE 3 - Groups:
[ ] Test 16: Groups List
[ ] Test 17: Group Cards Display
[ ] Test 18: Expand Group
[ ] Test 19: Group Members View
[ ] Test 20: Current Location
[ ] Test 21: Group Actions
[ ] Test 22: Delete Group
[ ] Test 23: Create Group Modal
[ ] Test 24: Create Group
[ ] Test 25: Search Groups

PHASE 4 - Orders:
[ ] Test 26: Orders Dashboard
[ ] Test 27: Order Cards
[ ] Test 28: Filter Orders
[ ] Test 29: Expand Order
[ ] Test 30: Order Details View
[ ] Test 31: Accept Order
[ ] Test 32: Decline Order
[ ] Test 33: Show QR Code
[ ] Test 34: Time Remaining
[ ] Test 35: Empty State

NAVIGATION:
[ ] Test 36: Tab Navigation
[ ] Test 37: Screen State Persistence
[ ] Test 38: Keyboard Handling
[ ] Test 39: Scrolling
[ ] Test 40: Responsive Layout
```

---

## 🐛 Troubleshooting

### Venues not showing?
1. Check `mobile/src/lib/mockData.ts` exists
2. Verify imports in `map.tsx`
3. Clear Metro cache: `npm start -- --reset-cache`

### Groups not loading?
1. Verify `MOCK_GROUPS` in `mockData.ts`
2. Check `groups.tsx` has correct import
3. Test on fresh build

### Orders empty?
1. Ensure `MOCK_ORDERS` is populated
2. Check filter logic in `orders.tsx`
3. Verify date comparisons

### Crashes?
1. Check console logs for errors
2. Verify all TypeScript types are correct
3. Run `npm run type-check`

---

## 📊 Performance Notes

- **List rendering:** Uses FlatList for smooth performance
- **Search:** Real-time filtering with useMemo optimization
- **Navigation:** Tab-based prevents unnecessary re-renders
- **Memory:** Mock data is static, no API calls

---

## ✅ Next Phase Goals

After testing Phase 2-4:
1. Create order creation screen
2. Implement payment flow
3. Connect to backend APIs
4. Add real-time notifications
5. Deploy to production

---

## 📞 Support

For issues:
1. Check console logs: `console.log()` errors
2. Verify file paths and imports
3. Clear node_modules and reinstall: `npm install`
4. Check app.json configuration
5. Verify TypeScript compilation: `npm run type-check`

---

**Happy Testing! 🎉**

Generated: October 26, 2025
Version: Phase 2-4 Complete
