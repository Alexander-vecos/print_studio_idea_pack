# 🛠️ Troubleshooting Guide

Quick solutions for common issues in PrintStudio.

---

## 🔴 Critical Issues

### "app doesn't start" / Blank white screen

**Symptoms**: Page loads but shows nothing, no errors

**Solutions**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check console errors (F12 → Console)
3. Check if dev server is running
   ```bash
   npm run dev
   # Should show: Local: http://localhost:5173/
   ```
4. Restart dev server
   ```bash
   # Kill terminal with Ctrl+C
   npm run dev
   ```

**If still not working**:
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### "Cannot find module" errors

**Symptoms**: `Error: Cannot find module '@/stores/authStore'`

**Solutions**:

1. **Check import path is correct**
   ```typescript
   // ❌ Wrong
   import { authStore } from '../stores/authStore';
   
   // ✅ Correct (if using @ alias)
   import { authStore } from '@/stores/authStore';
   
   // ✅ Also correct (relative path)
   import { authStore } from '../../stores/authStore';
   ```

2. **Check file exists**
   ```bash
   ls src/stores/authStore.ts
   # If missing, need to create the file
   ```

3. **Check index.ts exports**
   ```typescript
   // src/stores/index.ts should have:
   export * from './authStore';
   export * from './uiStore';
   // etc
   ```

4. **Verify Vite alias in vite.config.ts**
   ```typescript
   // vite.config.ts
   resolve: {
     alias: {
       '@': fileURLToPath(new URL('./src', import.meta.url))
     }
   }
   ```

---

### Firebase authentication "permission-denied"

**Symptoms**: 
```
FirebaseError: Missing or insufficient permissions
```

**Solutions**:

1. **Check Firestore Rules allow read/write**
   ```bash
   # Open Firebase Console
   # Firestore Database → Rules
   # Should have rules allowing your actions
   ```

2. **Verify user is authenticated**
   ```typescript
   // Check auth store
   const user = authStore.getState().user;
   console.log('User:', user); // Should not be null
   ```

3. **Check test key exists in Firestore**
   ```bash
   # In Firebase Console:
   # Firestore Database → collection: 'keys'
   # Should have document with your test key
   ```

4. **Allow anonymous auth in Firebase Console**
   ```
   Authentication → Sign-in method → Anonymous (enable)
   ```

5. **Update Firestore Rules to be permissive (dev only)**
   ```rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; // ⚠️ DEV ONLY
       }
     }
   }
   ```

---

## 🟠 Common Issues

### App works locally but not on Firebase Hosting

**Symptoms**: Works with `npm run dev`, broken on Firebase URL

**Solutions**:

1. **Check build succeeds**
   ```bash
   npm run build
   # Look for: "build complete in Xms"
   ```

2. **Check dist folder has files**
   ```bash
   ls -la dist/
   # Should have: index.html, assets/, etc
   ```

3. **Check environment variables in Firebase**
   ```
   Firebase Console → Settings → Environment
   Should have VITE_FIREBASE_* variables set
   ```

4. **Rewrite SPA routes**
   ```bash
   # firebase.json should have:
   {
     "hosting": {
       "rewrites": [{
         "source": "**",
         "destination": "/index.html"
       }]
     }
   }
   ```

5. **Clear Firebase cache**
   ```bash
   firebase hosting:disable
   firebase deploy --only hosting
   ```

---

### Page shows but Order Reel is empty

**Symptoms**: Dashboard loads, but no orders visible

**Solutions**:

1. **Check mock data is present**
   ```typescript
   // In Dashboard.tsx, should have:
   const MOCK_ORDERS = [
     { id: '1', ... },
     // etc
   ];
   ```

2. **Check orders are being passed to component**
   ```typescript
   // Should show in JSX
   <OrderReel orders={orders} ... />
   ```

3. **Check OrderReel component renders**
   ```typescript
   // OrderReel.tsx should render order cards
   console.log('Orders in reel:', orders);
   ```

4. **Check for JavaScript errors**
   ```
   F12 → Console → Look for red errors
   ```

5. **For Firestore data**: Check collection exists
   ```bash
   # Firebase Console → Firestore
   # Should have 'orders' collection with documents
   ```

---

### File upload doesn't work

**Symptoms**: Click upload button, nothing happens or error appears

**Solutions**:

1. **Check file input is accessible**
   ```typescript
   // In FileUploadModal.tsx
   const fileInputRef = useRef<HTMLInputElement>(null);
   
   // Verify ref is connected
   <input ref={fileInputRef} type="file" />
   ```

2. **Check file size limit**
   ```typescript
   // MAX_FILE_SIZE = 5MB
   if (file.size > 5 * 1024 * 1024) {
     // File too large
   }
   ```

3. **Check MIME type is allowed**
   ```typescript
   // In constants.ts
   const ALLOWED_MIME_TYPES = [
     'application/pdf',
     'image/jpeg',
     // etc
   ];
   
   if (!ALLOWED_MIME_TYPES.includes(file.type)) {
     // File type not allowed
   }
   ```

4. **Check Firebase permissions**
   ```bash
   # Firebase Console → Firestore Rules
   # Should allow 'files' collection write
   ```

5. **Check console for errors**
   ```bash
   F12 → Console → Look for upload errors
   npm run dev → Terminal → Look for server errors
   ```

---

### Bottom nav buttons don't work

**Symptoms**: Clicking nav buttons doesn't change view

**Solutions**:

1. **Check onClick handler is connected**
   ```typescript
   // BottomNav.tsx
   <button onClick={() => onChange('calendar')}>
     // Button needs onChange prop passed
   </button>
   ```

2. **Check parent passes onChange prop**
   ```typescript
   // Dashboard.tsx
   <BottomNav 
     current={currentView} 
     onChange={setCurrentView}  // ← Must be here
   />
   ```

3. **Check currentView state updates**
   ```typescript
   const [currentView, setCurrentView] = useState('reel');
   // Should update when nav button clicked
   ```

4. **Check conditional rendering works**
   ```typescript
   {currentView === 'calendar' && <CalendarView />}
   {currentView === 'upload' && <UploadView />}
   // Views should render based on currentView
   ```

---

### App is slow / janky animations

**Symptoms**: Animations stutter, scrolling feels laggy

**Solutions**:

1. **Check for console warnings**
   ```
   F12 → Console → Look for performance warnings
   ```

2. **Enable GPU acceleration**
   ```typescript
   // Add transform to trigger GPU
   className="transform transition-transform"
   ```

3. **Reduce animation duration**
   ```typescript
   // In OrderReel.tsx
   transition: '0.3s cubic-bezier(...)' // Shorter is faster
   ```

4. **Check bundle size**
   ```bash
   npm run build
   # Look at dist/ size (should be <500KB gzipped)
   ```

5. **Profile with DevTools**
   ```
   F12 → Performance
   Click Record
   Interact with app
   Click Stop
   Look for red frames (should be green/blue)
   ```

---

## 🟡 Minor Issues

### Styling looks wrong (colors off)

**Symptoms**: Colors don't match design (not emerald green, etc)

**Solutions**:

1. **Clear browser cache**
   ```
   F12 → Application → Cache Storage → Clear All
   Hard refresh: Ctrl+Shift+R
   ```

2. **Check Tailwind classes are correct**
   ```typescript
   // ✅ Correct
   className="text-emerald-400 bg-black"
   
   // ❌ Wrong
   className="text-green-400 bg-white"
   ```

3. **Check dark mode is enabled**
   ```javascript
   // tailwind.config.js
   darkMode: 'class' // or check this is set
   ```

4. **Rebuild CSS**
   ```bash
   npm run dev
   # Tailwind should watch and rebuild
   ```

---

### Mobile view doesn't work

**Symptoms**: App looks stretched on phone, components not responsive

**Solutions**:

1. **Test with DevTools mobile mode**
   ```
   F12 → Click device toggle (Ctrl+Shift+M)
   Choose device from dropdown
   ```

2. **Check viewport meta tag**
   ```html
   <!-- index.html -->
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```

3. **Check responsive classes**
   ```typescript
   // ✅ Correct
   className="block md:hidden"   // Shows on mobile, hidden on desktop
   className="hidden md:block"   // Hidden on mobile, shows on desktop
   
   // ❌ Wrong
   className="md:hidden"  // Only responsive part, no default
   ```

4. **Test actual devices**
   ```bash
   # Get local IP
   ipconfig getifaddr en0  # macOS
   ifconfig | grep "inet "  # Linux
   
   # On phone, visit: http://YOUR_IP:5173
   ```

---

### TypeScript errors

**Symptoms**: Red squiggly lines in VS Code

**Solutions**:

1. **Check types are defined**
   ```typescript
   // ✅ Correct
   interface Order {
     id: string;
     name: string;
   }
   
   // ❌ Wrong - no type
   const order = { id: '1', name: 'test' };
   ```

2. **Use proper types in functions**
   ```typescript
   // ✅ Correct
   function handleClick(e: React.MouseEvent) {
     console.log(e.currentTarget);
   }
   
   // ❌ Wrong
   function handleClick(e) { // no type
   }
   ```

3. **Check VS Code uses correct TypeScript**
   ```
   VS Code → Command Palette (Ctrl+Shift+P)
   > TypeScript: Select TypeScript Version
   → Use Workspace Version
   ```

4. **Rebuild types**
   ```bash
   npm run build
   # Should show any type errors
   ```

---

### Environment variables not working

**Symptoms**: `process.env.VITE_*` is undefined

**Solutions**:

1. **Check .env.local exists**
   ```bash
   ls .env.local
   # If missing, create it
   cp .env.example .env.local
   ```

2. **Variable names must start with VITE_**
   ```bash
   # ✅ Works
   VITE_FIREBASE_API_KEY=abc...
   
   # ❌ Doesn't work (missing VITE_)
   FIREBASE_API_KEY=abc...
   ```

3. **Restart dev server after changing .env**
   ```bash
   # Ctrl+C to stop
   npm run dev  # Start again - picks up new env vars
   ```

4. **Check variables are actually set**
   ```typescript
   console.log(import.meta.env.VITE_FIREBASE_API_KEY);
   // Should show value, not undefined
   ```

---

## 🟢 Solved! What to Remember

| Problem | Root Cause | Remember |
|---------|-----------|----------|
| Module not found | Wrong import path | Use `@/` alias for imports from src |
| Permission denied | Firestore rules | Check Rules tab in Firebase Console |
| Empty order reel | No mock data or network error | Check MOCK_ORDERS in Dashboard.tsx |
| File upload fails | Size/type validation | Check MAX_FILE_SIZE and ALLOWED_MIME_TYPES |
| Env vars undefined | .env.local missing/wrong | Must restart dev server after editing .env |
| Mobile view broken | No responsive classes | Use Tailwind breakpoints (md:, lg:) |
| Build fails | TypeScript errors | Run `npm run build` to see errors |

---

## 🔍 Debugging Workflow

**When something breaks:**

1. **Check browser console**
   ```
   F12 → Console tab
   Look for red errors
   ```

2. **Check dev server terminal**
   ```
   npm run dev terminal
   Look for red errors there too
   ```

3. **Check network tab**
   ```
   F12 → Network
   Check for failed requests (red)
   Look for 404s (file not found)
   ```

4. **Check DevTools Components**
   ```
   F12 → Components
   Click on component
   Inspect props and state
   ```

5. **Simplify**
   ```typescript
   // Remove complex code, add back piece by piece
   // This helps isolate which part is broken
   ```

---

## 📞 Can't Find Solution?

**Before asking for help:**

1. ✅ Check this document first (use Ctrl+F)
2. ✅ Check [QUICKSTART.md](./QUICKSTART.md)
3. ✅ Check [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
4. ✅ Read error message carefully
5. ✅ Check browser console (F12)

**When reporting issue:**

Include:
- [ ] Full error message (copy-paste from console)
- [ ] Steps to reproduce
- [ ] What you expected to happen
- [ ] What actually happened
- [ ] Your environment (OS, browser, Node version)

**Example**:
```
ERROR: Cannot find module '@/stores/authStore'
STEPS: 
1. Created new file src/testing.tsx
2. Added import { authStore } from '@/stores/authStore'
3. Save file
EXPECTED: No errors
ACTUAL: "Cannot find module" error in DevTools
ENVIRONMENT: macOS 14.2, Chrome 120, Node 18.17
```

---

## 🚀 Prevention Tips

1. **Commit working version often**
   ```bash
   git add .
   git commit -m "Feature X working"
   # If something breaks, can revert
   ```

2. **Test before committing**
   ```bash
   npm run build
   npm run lint
   # Check no errors before git commit
   ```

3. **Keep .env.local backed up**
   ```bash
   # Store in secure location (not Git)
   # Recreate if you lose it
   ```

4. **Document your changes**
   ```bash
   git commit -m "Add order filtering
   - Added filter UI in Dashboard
   - Connected to Firestore query
   - Tested with 10+ orders"
   ```

---

**Last Updated**: January 2024  
**Status**: ✅ Covers 90% of issues!

If you find a new issue, please document it in an issue tracker so others can find the solution too! 🙌

