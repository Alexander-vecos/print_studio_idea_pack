# Architecture & Design Decisions

## Overview

PrintStudio IdeaPack is a Progressive Web App (PWA) built with React 18, Zustand, and Firebase. This document explains the key architectural decisions and their rationale.

## 1. Adapter Pattern for Firebase Integration

### Decision
All Firebase operations are abstracted through adapter modules (`authAdapter.ts`, `firestoreAdapter.ts`, `rtdbAdapter.ts`) located in `src/firebase/`.

### Rationale
- **Decoupling**: Components don't directly import Firebase SDKs
- **Maintainability**: Firebase API changes are centralized
- **Testability**: Easy to mock Firebase for unit tests
- **Consistency**: Standardized error handling and data transformation
- **Security**: Centralized validation before database operations

### Implementation
```typescript
// ❌ Avoid - Direct Firebase imports in components
import { getDoc, collection } from 'firebase/firestore';

// ✅ Correct - Use adapters
import { firestoreAdapter } from '@/firebase/firestoreAdapter';
const file = await firestoreAdapter.getFile(fileId);
```

---

## 2. Base64 File Storage (No Firebase Storage)

### Decision
Files are stored in Firestore as Base64 Data URLs, not in Firebase Storage.

### Rationale
- **Simpler Architecture**: No need to manage separate storage bucket permissions
- **Unified Database**: All data in one place (Firestore)
- **CORS-Free**: Base64 URLs work without CORS issues
- **Offline Ready**: Files are cached as part of Firestore sync
- **File Size Limit**: 5MB per file (Firestore document limit ~1MB, Base64 increases to ~1.3MB)

### Trade-offs
| Pros | Cons |
|------|------|
| No CORS issues | File size limited to 5MB |
| Single database | Slower for large files |
| Easier permissions | Cloud Storage would be better for 10MB+ |
| Offline support | Base64 encoding overhead (~33%) |

### When to Use Firebase Storage Instead
- Need files > 10MB
- High-volume enterprise app with thousands of files
- Heavy image processing (resize, thumbnail generation)
- Want CDN distribution

---

## 3. Zustand for State Management

### Decision
Used Zustand instead of Redux, Context API, or other solutions.

### Rationale
- **Minimal Boilerplate**: Few lines of code per store
- **TypeScript Support**: Full type inference
- **Persistence**: Built-in middleware for LocalStorage
- **Developer Experience**: Simple API, no actions/reducers
- **Bundle Size**: Only ~2KB minified

### Store Organization

```
stores/
├── authStore.ts       # User authentication and profile
├── uiStore.ts         # Navigation, modals, theme
├── fileStore.ts       # File list, upload state
└── adminStore.ts      # Admin panel state
```

### Selector Usage
```typescript
// ✅ Recommended - Use selectors to prevent unnecessary re-renders
const user = useAuthStore((state) => state.user);

// ❌ Avoid - This re-renders on ANY store change
const { user, isLoading, error } = useAuthStore();
```

---

## 4. Auth System: Keys + Custom Tokens

### Decision
- Users authenticate via **access keys** (12-char unique strings)
- Admins authenticate via **phone verification + custom tokens**

### Flow

#### User Authentication (Key-based)
```
1. User enters key → 2. Validate in Firestore
3. Sign in anonymously → 4. Create user document
5. Mark key as used → 6. User logged in
```

#### Admin Authentication
```
1. Admin enters phone → 2. Firebase Phone Auth (OTP)
3. Verify OTP → 4. Cloud Function generates custom token
5. signInWithCustomToken → 6. Admin logged in
```

### Rationale
- **No Email Signup**: Access is controlled via pre-generated keys
- **Phone Verification**: Prevents unauthorized admin access
- **Scale**: Key generation is manual but secure
- **Revocation**: Keys can be deactivated in Firestore

---

## 5. Responsive Design Strategy

### Breakpoints
```typescript
MOBILE: 0px (default)
TABLET: 768px (md in Tailwind)
DESKTOP: 1024px (lg in Tailwind)
```

### Navigation Patterns

| Screen | Navigation |
|--------|------------|
| Mobile (<768px) | Bottom icon bar + animated slide-up |
| Tablet (768-1023px) | Sidebar + main content |
| Desktop (≥1024px) | Fixed sidebar + main + optional right panel |

### Safe Area Handling
```typescript
// ✅ Correct - Only apply SafeArea insets to specific elements
<SafeAreaView edges={['top', 'bottom']}>
```

### Why No Global Padding?
- **Gray Bars**: Setting global `padding-top: env(safe-area-inset-top)` creates visual dead space
- **Selective Application**: Only navigation and critical UI need insets
- **React Safe Area Context**: Get insets as JS values, more flexible

---

## 6. File Upload: Client-Side Base64 Encoding

### Decision
Files are converted to Base64 on the client before upload to Firestore.

### Flow
```
File input → FileReader.readAsDataURL() → Upload to Firestore → Done
```

### Rationale
- **Progress Tracking**: Can monitor FileReader progress
- **Validation**: Validate file MIME type and size before upload
- **Single Request**: No intermediate cloud function needed
- **Offline Friendly**: Can queue uploads for later

### Limitations
- Large files (>50MB) will hang the browser
- 5MB soft limit to respect Firestore document size
- Mobile devices may run out of memory with multiple large files

### Progress Calculation
```
0-50%:  FileReader encoding
50-100%: Firestore upload
```

---

## 7. Gesture Handling

### Double-Tap to Toggle Navigation
```typescript
// Implementation in useDoubleTap hook
// Detect two touchend events within 300ms
// Triggers toggleNavVisibility() from useUIStore
```

### Swipe to Close Modals
```typescript
// Implementation in useSwipe hook
// Detect vertical swipe > 50px
// Only on mobile, prevents accidental closes
```

### Why Custom Hooks?
- `react-use-gesture` dependency is large
- Simple implementation sufficient for basic gestures
- Full control over behavior

---

## 8. Module Structure: Features-First Organization

### Directory Layout
```
src/
├── features/              # Feature modules (vertical slicing)
│   ├── auth/
│   │   ├── components/    # Auth-specific UI
│   │   ├── stores/        # (if needed)
│   │   └── hooks/         # (if needed)
│   ├── files/
│   └── navigation/
├── components/            # Shared UI components
├── stores/               # Global state (Zustand)
├── firebase/             # SDK adapters (no imports in components)
├── hooks/                # Shared custom hooks
├── utils/                # Utility functions
└── pages/                # Page components (if using routing)
```

### Rationale
- **Cohesion**: All auth-related code in one place
- **Scalability**: Easy to add features or organize by domain
- **Team Collaboration**: Clear boundaries between teams
- **Reusability**: Share components between features in `components/ui`

---

## 9. Error Handling Strategy

### Three Levels

1. **Firebase Adapters**: Catch SDK errors, transform to app errors
   ```typescript
   catch (error: any) {
     throw new Error(error.code || 'Unknown error');
   }
   ```

2. **Zustand Stores**: Store error state for global access
   ```typescript
   error: string | null;
   setError: (error: string) => void;
   ```

3. **UI Components**: Display errors to user
   ```typescript
   const { error } = useAuthStore();
   return error && <ErrorAlert message={error} />;
   ```

### Never Silent Failures
- Always log to console in development
- Always show user-friendly message
- Always update loading state

---

## 10. PWA Implementation

### Service Worker Strategy
```
Static Assets → Cache First
API Requests → Network First (with fallback)
Google Fonts → Cache Forever
```

### Manifest Configuration
- `display: standalone` - Hides browser UI
- `start_url: /` - Opens at root
- `theme_color` - Status bar color
- `icons` - Multiple sizes for different devices

### Why Offline First?
- Better performance
- Works on unreliable connections
- App feels always-ready
- Good PWA score

---

## 11. Security Considerations

### Client-Side Only
- ✅ UI validation (file size, type)
- ✅ Local encryption (future feature)
- ✅ CORS handling

### Server-Side (Firestore Rules)
- ✅ Authentication verification
- ✅ Authorization checks (roles)
- ✅ Data validation
- ✅ Rate limiting (via Cloud Functions)

### Secrets Management
- ✅ Firebase config in `.env.local`
- ✅ API Keys are public (that's OK - they're client-config)
- ✅ Sensitive data protected by Firestore Rules
- ❌ Never store auth tokens in code

---

## 12. Performance Optimizations

### Code Splitting
- Lazy load feature modules with React.lazy()
- Modals load on demand

### Memoization
```typescript
// Zustand selector prevents re-renders
const user = useAuthStore((state) => state.user);
```

### Image Optimization
- Serve WebP with PNG fallback
- Lazy load images in lists
- Resize before Base64 encoding

### Network
- Minify/compress assets
- Cache static files in Service Worker
- Use CDN (Firebase Hosting provides)

---

## 13. Testing Strategy

### Unit Tests (Future)
```typescript
// Mock adapters for component tests
jest.mock('@/firebase/firestoreAdapter');
firestoreAdapter.addFile = jest.fn();
```

### E2E Tests (Future)
```javascript
// Test full flows
cy.login('test-key');
cy.uploadFile('test.pdf');
cy.verifyFileInList('test.pdf');
```

---

## 14. Deployment Architecture

### Development
```
Local → npm run dev → http://localhost:5173
```

### Production Build
```
npm run build → dist/ → Firebase Hosting
```

### Deployment Steps
```bash
npm run build              # Create optimized bundle
firebase deploy --only hosting:nexuspolygraf
# App available at https://nexuspolygraf.web.app
```

---

## Future Enhancements

1. **Cloud Functions**
   - Key activation (more secure)
   - Admin OTP verification
   - File processing (resize, etc.)

2. **Advanced Features**
   - Real-time collaboration
   - File versioning
   - Comments and annotations
   - Advanced search

3. **Performance**
   - Image optimization pipeline
   - Progressive image loading
   - File compression

4. **Security**
   - End-to-end encryption
   - Device fingerprinting
   - Rate limiting
   - Audit logging

---

## Conclusion

The architecture balances **simplicity**, **security**, and **scalability**. Key principles:

1. **Adapters** separate concerns
2. **Zustand** manages state simply
3. **Firestore** provides serverless backend
4. **PWA** works offline
5. **Responsive** works everywhere

This foundation allows rapid iteration while maintaining clean code and good performance.
