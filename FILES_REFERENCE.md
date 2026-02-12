# 📂 Complete Files Reference

Comprehensive list of all files in PrintStudio application with descriptions.

---

## 📋 Documentation Files

### Root Level Documentation

| File | Purpose | Size | Target Audience |
|------|---------|------|-----------------|
| [README.md](./README.md) | Project overview & features | 📄 Medium | Everyone |
| [QUICKSTART.md](./QUICKSTART.md) | Get running in 5 minutes | 📄 Long | Developers |
| [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) | Step-by-step setup guide | 📄 Long | New developers |
| [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) | Guide to all docs | 📄 Long | Everyone |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 14 design decisions explained | 📄 Very Long | Architects/Seniors |
| [REEL_INTEGRATION.md](./REEL_INTEGRATION.md) | Order Reel UI components | 📄 Long | Frontend devs |
| [API_INTEGRATION.md](./API_INTEGRATION.md) | Firestore data connection | 📄 Long | Backend devs |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment | 📄 Long | DevOps/Lead |
| [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md) | Future features guide | 📄 Very Long | Senior devs |
| **FILES_REFERENCE.md** | This file - all files listed | 📄 Long | Reference |

---

## 🔧 Configuration Files

### Root Level

| File | Purpose | Language |
|------|---------|----------|
| `.env.example` | Environment variables template | Plain text |
| `.env.local` | **Your** environment variables (⚠️ secret) | Plain text |
| `.gitignore` | Git ignore rules | Plain text |
| `firebase.json` | Firebase CLI configuration | JSON |
| `firestore.rules` | Firestore security rules | Firestore Rules |
| `package.json` | Dependencies & scripts | JSON |

### In `nexus-polygraf/`

| File | Purpose | Language |
|------|---------|----------|
| `vite.config.ts` | Build config + PWA plugin | TypeScript |
| `tsconfig.json` | TypeScript compiler options | JSON |
| `tsconfig.app.json` | App-specific TS config | JSON |
| `tsconfig.node.json` | Node-specific TS config | JSON |
| `package.json` | App dependencies | JSON |
| `index.html` | HTML entry point | HTML |
| `public/manifest.json` | PWA manifest | JSON |

---

## 💻 Source Code Files

### Entry Point
```
nexus-polygraf/src/
├── main.tsx                  # App bootstrap
├── App.tsx                   # Root component wrapper
└── index.css                 # Global styles (Tailwind)
```

### Pages
```
pages/
└── Dashboard.tsx             # Main dashboard (UPDATED)
    ├── Order Reel display
    ├── Navigation switching
    └── Mock/real data loading
```

### Features (Feature-based organization)

#### Authentication
```
features/auth/
├── components/
│   └── KeyAuthModal.tsx      # Login modal with key input
│       ├── Text input field
│       ├── Loading state
│       └── Error display
└── index.ts                  # Exports
```

#### File Management
```
features/files/
├── components/
│   ├── FileUploadModal.tsx   # Multi-file upload
│   │   ├── Drag-drop zone
│   │   ├── Progress bars
│   │   └── Error handling
│   └── FileViewerModal.tsx   # File preview
│       ├── Image display
│       ├── Code highlighting
│       └── PDF viewer
└── index.ts                  # Exports
```

#### Navigation (NEW - Order Reel)
```
features/navigation/
├── BottomNav.tsx             # 5-button bottom navigation
│   ├── Reel, Calendar, Add, Team, More
│   ├── Emerald active state
│   └── Fixed positioning
├── BottomNav2.tsx            # Alternative with Framer Motion
├── OrderReel.tsx             # Infinite scroll carousel
│   ├── OrderCard subcomponent
│   ├── Wheel events
│   ├── Touch/swipe events
│   └── Smooth animations
├── ViewContent.tsx           # Placeholder views
│   ├── CalendarView
│   ├── UploadView
│   ├── TeamView
│   └── MoreView
└── index.ts                  # Exports
```

#### Reel State
```
features/reel/
└── stores/
    └── reelStore.ts          # Zustand order state
        ├── Orders array
        ├── Current index
        └── moveNext/movePrev
```

### Stores (Zustand State Management)
```
stores/
├── authStore.ts              # Authentication state
│   ├── user profile
│   ├── login/logout
│   └── Error handling
├── uiStore.ts                # UI state
│   ├── Navigation visibility
│   ├── Modal state
│   └── Safe Area insets
├── fileStore.ts              # File management state
│   ├── Files array
│   ├── Upload progress
│   └── Selection state
└── adminStore.ts             # Admin operations
    ├── Generated keys
    └── Filters
```

### Firebase Adapters
```
firebase/
├── client.ts                 # Firebase initialization
│   ├── Imports SDK
│   └── Exports auth/db/rtdb
├── authAdapter.ts            # Authentication operations
│   ├── loginWithKey()
│   ├── logout()
│   └── onAuthChange()
└── firestoreAdapter.ts       # Database operations
    ├── addFile() with chunking
    ├── getFile() with reassembly
    ├── listFiles()
    ├── updateFile()
    ├── deleteFile()
    ├── generateKey()
    └── getUserProfile()
```

### Custom Hooks
```
hooks/
├── useMediaQuery.ts          # Responsive design queries
│   ├── useMediaQuery()
│   ├── useIsMobile()
│   ├── useIsTablet()
│   └── useIsDesktop()
├── useDoubleTap.ts           # Double-tap gesture detection
│   └── useDoubleTap()
└── useSwipe.ts               # Swipe gesture detection
    └── useSwipe()
```

### Utilities
```
utils/
├── base64Decoder.ts          # Base64 handling
│   ├── decodeBase64()
│   ├── getMimeTypeFromDataUrl()
│   ├── isTextContent()
│   ├── isImageContent()
│   └── isPdfContent()
├── formatters.ts             # Formatting helpers
│   ├── formatFileSize()
│   ├── formatDate()
│   └── getFileExtension()
└── constants.ts              # App constants
    ├── ALLOWED_MIME_TYPES
    ├── MAX_FILE_SIZE
    ├── BREAKPOINTS
    └── ANIMATION_DURATION
```

### Components (Reusable UI)
```
components/
└── ProtectedRoute.tsx        # Route protection wrapper
    ├── Auth check
    ├── Role-based access
    └── Loading state
```

---

## 🎨 Asset Files

### Public Assets
```
public/
├── favicon.ico               # Browser tab icon
├── icon-192x192.png          # PWA home screen icon
├── icon-512x512.png          # PWA splash screen
└── manifest.json             # PWA metadata
```

### Styling
```
App.css                        # Component styles
index.css                      # Global styles (Tailwind imports)
```

---

## 📊 File Statistics

### Total Count
- **Total Files**: 35+
- **TypeScript/React**: 18
- **Documentation**: 10
- **Configuration**: 7+

### Code Organization
```
By Type:
├─ Components (React): 12 files
│  ├─ Auth: 1
│  ├─ Files: 2
│  ├─ Navigation: 3
│  ├─ Pages: 1
│  └─ Utilities: 5
├─ Stores (Zustand): 4 files
├─ Firebase Adapters: 3 files
├─ Custom Hooks: 3 files
├─ Utilities: 3 files
└─ Config: 7+ files

By Size:
├─ Large (200+ lines): OrderReel.tsx
├─ Medium (100-200 lines): Most stores & adapters
└─ Small (50-100 lines): Utilities & hooks
```

---

## 🔄 File Dependencies

### Component Dependency Tree

```
App.tsx
└─ Dashboard.tsx
   ├─ BottomNav.tsx
   │  └─ react-icons/fi
   ├─ OrderReel.tsx
   │  ├─ OrderCard (subcomponent)
   │  ├─ FileUploadModal
   │  └─ useSwipe hook
   ├─ ViewContent.tsx
   │  ├─ CalendarView
   │  ├─ UploadView
   │  ├─ TeamView
   │  └─ MoreView
   ├─ authStore (login state)
   ├─ uiStore (nav visibility)
   └─ fileStore (upload state)
```

### Store Dependencies

```
authStore
├─ Firebase authAdapter
├─ Firestore firestoreAdapter
└─ Zustand persist middleware

uiStore
├─ react-safe-area-context
└─ useMediaQuery hook

fileStore
├─ Firebase firestoreAdapter
└─ base64Decoder utility

reelStore
├─ Firestore ordersAdapter
└─ Zustand create
```

### Firebase Dependency Chain

```
Firebase SDK (client.ts)
├─ authAdapter.ts
│  └─ Used by authStore.ts
├─ firestoreAdapter.ts
│  ├─ Used by fileStore.ts
│  ├─ Used by reelStore.ts (if added)
│  └─ Used by API_INTEGRATION
└─ ordersAdapter.ts
   └─ Used by Dashboard.tsx
```

---

## 📝 File Purposes Quick Reference

### MUST READ Files
- `QUICKSTART.md` - Get started
- `ARCHITECTURE.md` - Understand design
- `src/App.tsx` - See app structure
- `src/pages/Dashboard.tsx` - Main page logic
- `src/firebase/authAdapter.ts` - Auth flow
- `src/stores/authStore.ts` - State pattern

### IMPORTANT Files
- `src/features/navigation/OrderReel.tsx` - Main UI
- `src/features/auth/components/KeyAuthModal.tsx` - Login
- `vite.config.ts` - Build config
- `firestore.rules` - Security

### REFERENCE Files
- `src/utils/constants.ts` - App constants
- `src/hooks/useMediaQuery.ts` - Responsive
- `src/firebase/firestoreAdapter.ts` - Data ops
- `.env.example` - Env template

### OPTIONAL Files
- `BottomNav2.tsx` - Alternative nav style
- `src/features/reel/stores/reelStore.ts` - Alternative state
- Advanced\` features in separate docs

---

## 🔐 Files to NEVER Commit

```
❌ DO NOT COMMIT:
.env.local                    # Contains Firebase secrets
node_modules/                 # Dependencies (.gitignored)
dist/                         # Build output (.gitignored)
.DS_Store                     # macOS system files (.gitignored)
*.log                         # Log files (.gitignored)
```

## ✅ Files to ALWAYS Commit

```
✅ MUST COMMIT:
.env.example                  # Template for .env
.gitignore                    # Ignore rules
All .tsx, .ts files          # Source code
All documentation files      # Docs
firebase.json                # Firebase config
firestore.rules              # Security rules
package.json                 # Dependencies list
tsconfig.json                # TypeScript config
```

---

## 🚀 Getting Started File Path

**New to the project?** Follow this file reading order:

```
1. README.md
   ↓
2. QUICKSTART.md
   ↓
3. SETUP_CHECKLIST.md (Follow steps)
   ↓
4. src/App.tsx (See app structure)
   ↓
5. src/pages/Dashboard.tsx (See main page)
   ↓
6. src/features/navigation/OrderReel.tsx (See reel)
   ↓
7. ARCHITECTURE.md (Understand why)
   ↓
8. Your choice based on role (below)
```

## 👨‍💼 By Role - Key Files to Know

### Frontend Developer
```
Priority 1:
├─ src/App.tsx
├─ src/pages/Dashboard.tsx
├─ src/features/navigation/*.tsx
└─ src/components/

Priority 2:
├─ src/stores/uiStore.ts
├─ src/hooks/useMediaQuery.ts
└─ src/utils/constants.ts

Reference:
└─ REEL_INTEGRATION.md
```

### Backend/Firebase Developer
```
Priority 1:
├─ src/firebase/client.ts
├─ src/firebase/authAdapter.ts
├─ src/firebase/firestoreAdapter.ts
└─ firestore.rules

Priority 2:
├─ src/stores/authStore.ts
├─ src/stores/fileStore.ts
└─ API_INTEGRATION.md

Reference:
└─ DEPLOYMENT.md
```

### DevOps/SRE
```
Priority 1:
├─ firebase.json
├─ vite.config.ts
├─ .env.example
└─ DEPLOYMENT.md

Priority 2:
├─ firestore.rules
├─ package.json
└─ QUICKSTART.md

Reference:
└─ ARCHITECTURE.md (Deployment section)
```

### Product/Manager
```
Priority 1:
├─ README.md
├─ ARCHITECTURE.md (features section)
└─ ADVANCED_FEATURES.md

Reference:
└─ DEPLOYMENT.md (timeline estimation)
```

---

## 📊 File Modification Frequency

### Frequently Modified
- `src/pages/Dashboard.tsx` - UI changes
- `src/features/navigation/*.tsx` - Feature changes
- `.env.local` - Configuration
- `firestore.rules` - Security

### Occasionally Modified
- `src/stores/*.ts` - State changes
- `src/firebase/*.ts` - Data ops
- `vite.config.ts` - Build changes
- `tailwind.config.js` - Theme changes

### Rarely Modified
- `tsconfig.json` - TypeScript config
- `package.json` - Dependencies
- `index.html` - HTML structure
- Core infrastructure files

---

## 🔍 Find Something?

**Looking for...**

| What | Where |
|------|-------|
| Component code | `src/features/**/components/` or `src/components/` |
| State management | `src/stores/*.ts` |
| API calls | `src/firebase/*Adapter.ts` |
| Styling | Component file's CSS or `index.css` |
| Constants | `src/utils/constants.ts` |
| Type definitions | End of each `.ts` file `interface` section |
| Hooks | `src/hooks/*.ts` |
| Firebase config | `.env.local` or `firebase.json` |
| Build config | `vite.config.ts` |
| Type checking | `tsconfig.json` |

---

## ✅ Verification Checklist

Use this to verify all files are in place after setup:

```bash
# Run this to check file structure:
cd nexus-polygraf

# Check critical files exist:
ls src/App.tsx 2>/dev/null && echo "✓ App.tsx" || echo "✗ App.tsx MISSING"
ls src/pages/Dashboard.tsx 2>/dev/null && echo "✓ Dashboard.tsx" || echo "✗ Dashboard.tsx MISSING"
ls src/features/navigation/*.tsx 2>/dev/null && echo "✓ Navigation files" || echo "✗ Navigation files MISSING"
ls src/stores/*.ts 2>/dev/null && echo "✓ Stores" || echo "✗ Stores MISSING"
ls src/firebase/*.ts 2>/dev/null && echo "✓ Firebase adapters" || echo "✗ Firebase adapters MISSING"

# Check it builds:
npm run build && echo "✓ Build successful" || echo "✗ Build FAILED"
```

---

## 📞 File Issues?

**File is missing?**
```bash
# Regenerate using Git:
git checkout src/path/to/file.tsx
```

**File is corrupted?**
```bash
# Restore from backup
git restore src/path/to/file.tsx
```

**TypeScript errors?**
```bash
# Run type checker
tsc --noEmit
```

**Module not found?**
```bash
# Reinstall dependencies
npm install
```

---

**Last Updated**: January 2024  
**Status**: ✅ All files documented  
**Next Step**: Choose your role above and start in priority order!

