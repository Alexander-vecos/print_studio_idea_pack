# 🚀 Quick Start Guide  

Get PrintStudio Order Reel running with **Reference Data System**.

---

## ✅ Current Status

- ✅ **Build succeeds**: `npm run build` → exit code 0
- ✅ **Dev server running**: http://localhost:5174
- ✅ **Reference data ready**: 5 complete dictionaries
- ✅ **Firebase adapters**: referenceAdapter.ts + useReferenceData hook

---

## 🎯 What's New: Reference Data System

Your app now has a **completely flexible reference data system** that:

- 📦 Stores all dictionaries in Firestore (not hardcoded in React)
- 🔄 Uses **code-label pattern** (code in DB/code, label in UI)
- 🚀 Automatically initializes on app startup
- 💾 Includes 5 complete dictionaries:
  - **USER_FIELDS** - user profile fields (7 items)
  - **ROLES** - access roles (14 items)
  - **SECTORS** - production departments (15 items)
  - **PRIORITIES** - order priorities with colors (6 items)
  - **ORDER_STEPS** - complete pipeline (15 stages)

---

## 🚀 Step 1: Run Dev Server

```bash
npm run dev
```

This will:
1. Start Vite dev server on http://localhost:5174
2. Auto-initialize reference data to Firestore on first login
3. Hot-reload on code changes

---

## 🔐 Step 2: Authenticate

Open http://localhost:5174 and:

- You can sign in with a test key (from Firestore `keys` collection)
- Or use **Phone Auth** (recommended): click "Or sign in with phone" in the modal, enter number, verify SMS code

After successful login the app will call `initializeReferenceData()` and save the dictionaries to Firestore.

**Check it worked:**
1. Firebase Console → Firestore Database
2. Look for collection: `reference`
3. You should see 5 subcollections: USER_FIELDS, ROLES, SECTORS, PRIORITIES, ORDER_STEPS


## 🔧 Extra: Seeding demo keys & running functions locally

- Seed demo keys (create guest/test/admin keys):

```bash
# from repo root
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
node scripts/seed-demo.js
```

- Start emulators (functions + firestore) to test callable functions locally:

```bash
firebase emulators:start --only functions,firestore
```


---

## 📚 Step 3: Use Reference Data in Components

### Simple dropdown with roles

```typescript
import { useReferenceData } from '@/hooks';

export function RoleSelector() {
  const { items: roles, loading } = useReferenceData('ROLES');

  return (
    <select>
      <option>Select role...</option>
      {roles.map(role => (
        <option key={role.code} value={role.code}>
          {role.label}
        </option>
      ))}
    </select>
  );
}
```

### Priority badge with color

```typescript
import { useReferenceData, getMetaFromItems } from '@/hooks';

function PriorityBadge({ code }: { code: string }) {
  const { items: priorities } = useReferenceData('PRIORITIES');
  const color = getMetaFromItems(priorities, code, 'color');

  return <span className={color}>Priority: {code}</span>;
}
```

### Get label from code

```typescript
import { useReferenceData, getLabelFromItems } from '@/hooks';

function OrderStatus({ statusCode }: { statusCode: string }) {
  const { items: steps } = useReferenceData('ORDER_STEPS');
  const label = getLabelFromItems(steps, statusCode);

  return <span>{label}</span>;
  // Shows: "Внесён в систему" instead of "order_entry"
}
```

---

## 🧪 Testing Checklist

- [ ] Dev server runs without errors
- [ ] Authenticate and app loads
- [ ] Reference data appears in Firestore (collection `reference`)
- [ ] Dropdown with roles renders correctly
- [ ] Priority badge shows correct color
- [ ] Changing label in Firebase Console → page refresh shows new label

---

## 📖 Full Documentation

For complete reference data guide see: [REFERENCE_DATA_GUIDE.md](./REFERENCE_DATA_GUIDE.md)

## 🔑 Step 3 (Old): Create Test Key

In Firebase Console, go to **Firestore Database**:

1. Create collection: `keys`
2. Create new document with auto ID
3. Add these fields:

```
key              (string)  : "TEST-KEY-12345"
createdAt        (timestamp): today
expiresAt        (timestamp): (empty/null)
used             (boolean) : false
role             (string)  : "user"
```

**Save!** ✓

---

## 👨‍💻 Step 4: Start Dev Server

```bash
npm run dev
```

**Expected output:**
```
VITE v7.3.1  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## 🎯 Step 5: Test the App

Open `http://localhost:5173/` in your browser.

### ✅ Login Test
1. **Black screen pops up** (KeyAuthModal)
2. **Enter key**: `TEST-KEY-12345`
3. **Click**: "Login"
4. **Watch**: Loading spinner rotates
5. **Result**: ✅ You're logged in!

### ✅ Order Reel Test
1. **White screen with order card** (big product image)
2. **Scroll using mouse wheel** or **swipe on mobile**
3. **Order changes** with smooth animation
4. **Bottom nav shows 5 buttons** (Reel, Calendar, Upload, Team, More)

### ✅ Navigation Test
1. **Click Calendar icon** → Shows placeholder calendar view
2. **Click Upload icon** → Shows file upload placeholder
3. **Click Team icon** → Shows team members placeholder
4. **Click More icon** → Shows settings placeholder
5. **Back to Reel** → Shows order cards again

### ✅ File Upload Test
1. **On order reel**, click **paperclip icon** (right side)
2. **File picker opens** → Select a document
3. **File uploads** (shows progress bar)
4. **✅ Files counter increases**

### ✅ Colors Verification
- ✅ Background is pure **BLACK** (#000000)
- ✅ Active buttons are **EMERALD GREEN** (#10B981)
- ✅ Inactive text is **WHITE with 40% opacity**
- ✅ Bottom nav has subtle border highlight

---

## 🎨 Visual Checklist

```
Desktop View (1024px+):
┌─────────────────────────┐
│      PRINT STUDIO       │
│  [Dashboard showing     │
│   order cards layout]   │ ← Desktop fallback (original)
│                         │
└─────────────────────────┘

Mobile View (<1024px):
┌───────────────────────┐
│                       │
│  [Order Card 1]       │ ← Beautiful preview
│  Product image        │
│  Status badge ✓       │
│                       │  Action buttons
│  📎 🔔 💬             │  (Files, Phone, Chat)
│                       │
├───────────────────────┤
│ 🔲 📅 ➕ 👥 ⋯        │ ← Emerald green on active
│ Reel Calc Add Team ... │
└───────────────────────┘
```

---

## 🐛 Troubleshooting

### Screen is blank / "Cannot find module"
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "TypeError: Cannot read property 'user' of null"
- Check `.env.local` has correct Firebase credentials
- Check Firestore Database is created and enabled

### Import error on BottomNav2
- If you see errors about `BottomNav2.tsx`, you can ignore or delete it
- `BottomNav.tsx` is the working version

### File upload button does nothing
- Check browser console (F12) for errors
- Make sure file input ref is working
- Check ALLOWED_MIME_TYPES in `src/utils/constants.ts`

### Scroll/swipe not working
- On desktop: Use mouse wheel or trackpad
- On mobile browser: Use two-finger swipe (physical swipe)
- Check animation not stuck in loop

---

## 📊 Performance Check

Open DevTools (F12) → **Performance** tab:

1. Click **Record** (red circle)
2. Scroll reel 3-5 times
3. Click **Stop**
4. Check:
   - ✅ No red frames (should be green/blue)
   - ✅ Frame time < 16ms (60fps)
   - ✅ Minimal JavaScript time

**Expected**: Smooth 60fps animations on modern devices

---

## 🔄 Hot Reload

Changes to files automatically reload:

```
Edit src/features/navigation/OrderReel.tsx
↓
Save (Ctrl+S)
↓
Browser auto-refreshes
↓
Changes visible immediately
```

No need to restart `npm run dev`!

---

## 📦 Project Structure

```
nexus-polygraf/
├── src/
│   ├── pages/
│   │   └── Dashboard.tsx              ← Main app
│   ├── features/
│   │   ├── auth/
│   │   ├── files/
│   │   └── navigation/
│   │       ├── BottomNav.tsx          ← 5-button nav
│   │       ├── OrderReel.tsx          ← Infinite scroll
│   │       └── ViewContent.tsx        ← Placeholders
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   ├── fileStore.ts
│   │   └── reelStore.ts
│   └── firebase/
│       ├── client.ts
│       ├── authAdapter.ts
│       └── firestoreAdapter.ts
├── .env.local                         ← Your Firebase config
├── .env.example                       ← Template
└── package.json
```

---

## 🎓 What You Can Do Now

- ✅ Login with key-based authentication
- ✅ Scroll through order reel
- ✅ Switch between 5 navigation tabs
- ✅ Upload files to orders
- ✅ See beautiful emerald-themed UI on mobile
- ✅ Test responsive design (resize browser)

---

## 🔜 Next Steps

### After Basic Testing (20 mins):
1. Deploy to Firebase Hosting: `npm run build && firebase deploy`
2. Share URL with team for mobile testing
3. Get feedback on Order Reel interface

### Advanced (1-2 hours):
1. Add real order data from database
2. Implement Calendar view
3. Add more action buttons (Preview, Chat, etc)
4. Set up analytics tracking

### Production (when ready):
1. Enable Firebase Security Rules
2. Set up custom domain
3. Configure CI/CD for auto-deploy
4. Add error tracking (Sentry)

---

## 💡 Pro Tips

**Tip 1**: Use Mobile View in DevTools (F12 → device toggle)
- Better testing than resizing browser window

**Tip 2**: Enable "Disable JavaScript" in DevTools to test graceful degradation

**Tip 3**: Check Lighthouse scores
- DevTools → Lighthouse → Analyze page load
- Should see 90+ scores for PWA

**Tip 4**: Test offline mode
- Chrome DevTools → Network tab → Toggle offline
- App should still show cached content

---

## ✅ Success Criteria

You'll know everything is working when:

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts on localhost:5173
- [ ] KeyAuthModal appears with login input
- [ ] Can login with TEST-KEY-12345
- [ ] Order Reel appears with beautiful animations
- [ ] Can scroll between orders smoothly
- [ ] Bottom nav has 5 clickable buttons
- [ ] All buttons are emerald green when active
- [ ] Background is pure black
- [ ] File upload button opens file picker
- [ ] No console errors (check F12)
- [ ] Performance is smooth (60fps)

**All 12 checked?** → 🎉 **You're ready to build!**

---

## 📞 Support

**Common Issues Solved:**
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Check [REEL_INTEGRATION.md](./REEL_INTEGRATION.md) for component details
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions

---

**Status**: ✅ Ready to rock! Start with `npm install` above.
