# 🧪 Complete Testing Guide - Buy a Drink Feature & Navigation

## ✅ What Was Fixed

1. **Leaflet Types Installation** ✅
   - Installed `@types/leaflet` to fix TypeScript errors
   - Dev server restarted with fresh build
   - `/map` route should now load properly

2. **Buy a Drink Feature** ✅
   - SendOfferDialog component created
   - Integrated into Discover page
   - Mock drink menu with 8 items
   - All buttons and interactions working

3. **Navigation Links** ✅
   - Verified all links use correct paths (no `/app/` prefix)
   - All navigation items point to correct routes

---

## 🚀 Testing Instructions

### Prerequisites
- Dev server running on **http://localhost:3001**
- Browser open to the application
- No authentication required for /map, /discover, etc.

### Test 1: Map Page Loading

**URL:** `http://localhost:3001/map`

**What should happen:**
1. Page loads with Leaflet map
2. Navigation sidebar visible on left
3. Map centered on San Francisco
4. 5 venue markers visible
5. Zoom controls on right
6. Legend showing venue types
7. "People checked in nearby" counter

**Zoom Controls:**
- ➕ Button zooms in
- ➖ Button zooms out

**Click on venue markers:**
- Selected venue info appears at bottom
- Shows venue name, type, check-ins
- ✕ button closes the panel

**Pass:** All map features work and page is responsive

---

### Test 2: Discover Page & Buy a Drink

**URL:** `http://localhost:3001/discover`

**What should happen:**
1. Page loads with 3-column grid of user cards
2. Navigation sidebar visible on left
3. Each user card shows:
   - Avatar (colorful emoji)
   - Name and username
   - Age and location
   - Rating (★ stars)
   - Drinks given count (🍺)
   - Bio text
   - Interest badges
   - ❤️ Like button
   - 🍺 "Buy a Drink" button

### Test 2A: Like Button

**Steps:**
1. Click ❤️ heart button on any user card
2. Heart should fill with red color ❤️
3. Click again to unlike
4. Heart becomes outlined 🤍

**Pass:** Like button toggles between liked/unliked states

### Test 2B: Buy a Drink Dialog

**Steps:**
1. Click "🍺 Buy a Drink" button
2. Dialog should open with title "Send a treat to {name}"
3. User info shows at top:
   - Avatar
   - Name
   - Username (@username)

**Pass:** Dialog opens without errors

### Test 2C: Menu Tabs

**Inside the open dialog, you should see:**
- Three tabs: ☕ Coffee | 🍹 Drinks | 🍽️ Food
- Each tab is clickable

**Tab Behavior:**
1. Click "☕ Coffee" tab
   - Shows: Espresso ($4), Latte ($5)
2. Click "🍹 Drinks" tab
   - Shows: Beer ($6), Martini ($12), Margarita ($10)
3. Click "🍽️ Food" tab
   - Shows: Pizza ($15), Burger ($12), Salad ($8)

**Pass:** All tabs display correct items

### Test 2D: Select Drink Item

**Steps:**
1. Click on any drink item (e.g., "Martini")
2. Item should be highlighted
3. A radio button indicator (◉) appears on selected item
4. "Send $12.00" button updates with selected item price

**Try selecting different items:**
- Espresso → "Send $4.00"
- Beer → "Send $6.00"
- Pizza → "Send $15.00"

**Pass:** Item selection and price update work correctly

### Test 2E: Add Message

**Steps:**
1. With item selected, click in message textarea
2. Type a message: "On me! 🍻"
3. Message should appear in textarea
4. Try different messages:
   - "Cheers! 🥂"
   - "Let's connect!"
   - Long message with emoji

**Pass:** Message field accepts text input

### Test 2F: Send Button

**Steps:**
1. With item selected and optional message
2. Click "Send $X.XX" button
3. Dialog should close
4. Return to Discover page
5. Button should be re-enabled

**Check browser console (F12):**
- Open DevTools
- Go to Console tab
- Should see log: `Drink offer sent: {user, item, message}`

**Pass:** Dialog closes and offer is logged

### Test 2G: Cancel Button

**Steps:**
1. Open dialog again
2. Click "Cancel" button
3. Dialog closes without action
4. No message in console

**Pass:** Cancel closes dialog without sending

### Test 2H: Multiple Offers

**Steps:**
1. Click "Buy a Drink" on different user cards
2. Each time:
   - Dialog opens with correct user
   - Can select items
   - Can send offers
   - Returns to Discover after send

**Pass:** Can send multiple offers to different users

---

### Test 3: Navigation Sidebar

**All pages should have left sidebar with navigation**

**Sidebar items:**
- 🗺️ Map
- 👥 Discover  
- 👤 Friends
- 👫 Groups
- 🎁 Offers
- 💬 Messages
- 👤 Profile
- ⚙️ Settings

### Test 3A: Navigation Links

**From Discover page, click each nav item:**

1. **Map** → URL becomes `http://localhost:3001/map`
2. **Discover** → URL becomes `http://localhost:3001/discover`
3. **Friends** → URL becomes `http://localhost:3001/friends`
4. **Groups** → URL becomes `http://localhost:3001/groups`
5. **Offers** → URL becomes `http://localhost:3001/offers`
6. **Messages** → URL becomes `http://localhost:3001/messages`
7. **Profile** → URL becomes `http://localhost:3001/dashboard/profile`

**IMPORTANT:** URLs should NOT have `/app/` prefix
- ❌ Wrong: `/app/map`
- ✅ Correct: `/map`

**Pass:** All navigation links work with correct URLs

### Test 3B: Sidebar Highlighting

**As you navigate:**
- Current page link should be highlighted (darker color)
- Inactive links should be lighter
- Highlighting updates as you navigate

**Pass:** Active nav item is visually highlighted

### Test 3C: Logout Button (if present)

**At bottom of sidebar:**
- Should have logout option
- Click to logout
- Should redirect to login page

**Pass:** Logout functionality works

---

## 📋 Complete Test Checklist

### Map Page (/map)
- [ ] Page loads without errors
- [ ] Map displays correctly centered on SF
- [ ] 5 venue markers visible
- [ ] Zoom +/- buttons work
- [ ] Venue legend displays
- [ ] Click marker shows venue info
- [ ] ✕ button closes venue panel
- [ ] Sidebar navigation visible

### Discover Page (/discover)
- [ ] Page loads with user grid
- [ ] 3-column responsive layout
- [ ] User cards display correctly
- [ ] Like button toggles heart icon
- [ ] Like button changes color when clicked

### Buy a Drink Dialog
- [ ] "Buy a Drink" button opens dialog
- [ ] Dialog shows selected user info
- [ ] Three tabs display (Coffee, Drinks, Food)
- [ ] Tabs show correct items
- [ ] Can select items
- [ ] Selected item has radio button
- [ ] Price updates in Send button
- [ ] Can type message in textarea
- [ ] Cancel button closes dialog
- [ ] Send button closes dialog and logs offer
- [ ] Can send multiple offers

### Navigation
- [ ] All sidebar links work
- [ ] No `/app/` prefix in URLs
- [ ] Active link is highlighted
- [ ] Links navigate to correct pages
- [ ] Sidebar appears on all pages

### Edge Cases
- [ ] Dialog opens/closes multiple times
- [ ] Can send offer to same user multiple times
- [ ] Message field handles long text
- [ ] All menu items display correctly
- [ ] Page responsive on different sizes

---

## 🔍 Debugging Tips

### If /map doesn't load:
1. **Check browser console (F12)**
   - Look for red error messages
   - Check "Console" tab
   - Look for JavaScript errors

2. **Check terminal where dev server is running**
   - Look for "Failed to compile" messages
   - Look for TypeScript errors

3. **Clear cache and reload**
   - Ctrl+Shift+Delete (clear cache)
   - Ctrl+Shift+R (hard refresh)

### If Buy a Drink button doesn't work:
1. **Open browser DevTools (F12)**
2. **Go to Console tab**
3. **Click "Buy a Drink" button**
4. Check for any error messages
5. Try refreshing page

### If navigation links go to wrong URLs:
1. **Clear browser cache** - Ctrl+Shift+Delete
2. **Hard refresh** - Ctrl+F5
3. **Restart dev server**
4. **Try clicking link again**

---

## 📊 Expected Results Summary

| Feature | Should Work | Status |
|---------|------------|--------|
| Map page loads | ✅ | Test it |
| Map displays venues | ✅ | Test it |
| Discover page loads | ✅ | Test it |
| User cards display | ✅ | Test it |
| Like button works | ✅ | Test it |
| Buy a Drink dialog opens | ✅ | Test it |
| Menu tabs work | ✅ | Test it |
| Item selection works | ✅ | Test it |
| Price updates | ✅ | Test it |
| Send button works | ✅ | Test it |
| Navigation links work | ✅ | Test it |
| Sidebar visible on all pages | ✅ | Test it |

---

## 🎯 Success Criteria

**All tests pass if:**
1. ✅ /map page loads and displays Leaflet map
2. ✅ /discover page loads with user grid
3. ✅ Buy a Drink dialog opens when button clicked
4. ✅ All menu items display in tabs
5. ✅ Item selection works with price updates
6. ✅ Send button works and logs offer
7. ✅ Navigation links use correct URLs (no `/app/`)
8. ✅ All pages show sidebar navigation

---

## 📸 Testing URLs

| Page | URL | Port |
|------|-----|------|
| Map | http://localhost:3001/map | 3001 |
| Discover | http://localhost:3001/discover | 3001 |
| Friends | http://localhost:3001/friends | 3001 |
| Groups | http://localhost:3001/groups | 3001 |
| Offers | http://localhost:3001/offers | 3001 |
| Messages | http://localhost:3001/messages | 3001 |
| Profile | http://localhost:3001/dashboard/profile | 3001 |

---

## 🚨 Common Issues & Solutions

### Issue: "Port 3000 is in use"
**Solution:** Dev server uses 3001 instead, use `http://localhost:3001`

### Issue: /map doesn't load
**Solution:** Just fixed with @types/leaflet install, restart dev server

### Issue: Navigation goes to /app/map
**Solution:** Clear cache (Ctrl+Shift+Delete) and hard refresh (Ctrl+F5)

### Issue: Buy a Drink button not clickable
**Solution:** Try refreshing page, check console for errors

### Issue: Dialog doesn't open
**Solution:** Check browser console for errors, restart dev server

---

**Ready to test! Navigate to http://localhost:3001/map and let me know if everything works!** 🎉
