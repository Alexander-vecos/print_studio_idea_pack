# 💻 Common Code Snippets

Quick copy-paste examples for common tasks in PrintStudio.

---

## 🔐 Authentication

### Login with Key
```typescript
import { authStore } from '@/stores/authStore';

// In your component
const { loginWithKey, isLoading, error } = authStore();

const handleLogin = async (key: string) => {
  try {
    await loginWithKey(key);
    // Success - user is logged in
  } catch (err) {
    // Error handling done in store
  }
};
```

### Check if User Logged In
```typescript
import { authStore } from '@/stores/authStore';

export function ProtectedComponent() {
  const user = authStore((state) => state.user);
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome {user.uid}!</div>;
}
```

### Get Current User
```typescript
const user = authStore((state) => state.user);
const isLoading = authStore((state) => state.isLoading);
const error = authStore((state) => state.error);

// Full state
const { user, isLoading, error } = authStore();
```

---

## 📁 File Operations

### Upload File to Firestore
```typescript
import { firestoreAdapter } from '@/firebase/firestoreAdapter';

const handleFileSelect = async (file: File) => {
  try {
    // Convert to Base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      
      // Upload
      const fileDoc = await firestoreAdapter.addFile({
        name: file.name,
        type: file.type,
        size: file.size,
        base64: base64,
        uploadedBy: user.uid
      });
      
      console.log('Uploaded:', fileDoc.id);
    };
    reader.readAsDataURL(file);
  } catch (err) {
    console.error('Upload failed:', err);
  }
};
```

### Get File from Firestore
```typescript
import { firestoreAdapter } from '@/firebase/firestoreAdapter';

const handleViewFile = async (fileId: string) => {
  try {
    const file = await firestoreAdapter.getFile(fileId);
    
    // Use file.base64 to display
    const link = document.createElement('a');
    link.href = file.base64;
    link.download = file.name;
    link.click();
  } catch (err) {
    console.error('Download failed:', err);
  }
};
```

### List All User Files
```typescript
import { fileStore } from '@/stores/fileStore';
import { firestoreAdapter } from '@/firebase/firestoreAdapter';

useEffect(() => {
  const loadFiles = async () => {
    try {
      const { files } = await firestoreAdapter.listFiles(20);
      fileStore.setState({ files });
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };
  
  loadFiles();
}, []);
```

---

## 🎯 UI State Management

### Toggle Navigation Visibility
```typescript
import { uiStore } from '@/stores/uiStore';

const { isBottomNavVisible, toggleNavVisibility } = uiStore();

// Toggle
<button onClick={toggleNavVisibility}>
  {isBottomNavVisible ? 'Hide' : 'Show'} Nav
</button>
```

### Open/Close Modal
```typescript
import { uiStore } from '@/stores/uiStore';

const { openModal, closeModal, activeModal } = uiStore();

// Open modal
<button onClick={() => openModal('FileUpload')}>
  Upload
</button>

// Close modal
<button onClick={closeModal}>Close</button>

// Check which modal is active
{activeModal === 'FileUpload' && <FileUploadModal />}
```

### Get Safe Area Insets
```typescript
import { uiStore } from '@/stores/uiStore';

function MyComponent() {
  const { safeAreaInsets } = uiStore();
  
  return (
    <div style={{
      paddingTop: safeAreaInsets.top,
      paddingBottom: safeAreaInsets.bottom,
      paddingLeft: safeAreaInsets.left,
      paddingRight: safeAreaInsets.right
    }}>
      Content
    </div>
  );
}
```

---

## 📱 Responsive Design

### Check Device Type
```typescript
import { useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/useMediaQuery';

export function ResponsiveComponent() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  if (isMobile) return <MobileView />;
  if (isTablet) return <TabletView />;
  return <DesktopView />;
}
```

### Custom Media Query
```typescript
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function Component() {
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isRetina = useMediaQuery('(min-resolution: 2dppx)');
  
  return (
    <div>
      {isLandscape && <LandscapeLayout />}
      {isRetina && <HighResImage />}
    </div>
  );
}
```

---

## 🎬 Animations & Gestures

### Double Tap Detection
```typescript
import { useDoubleTap } from '@/hooks/useDoubleTap';

export function DoubleTapComponent() {
  const ref = useRef<HTMLDivElement>(null);
  
  useDoubleTap(ref, () => {
    console.log('Double tapped!');
    // Do something
  });
  
  return <div ref={ref}>Double tap me</div>;
}
```

### Swipe Detection
```typescript
import { useSwipe } from '@/hooks/useSwipe';

export function SwipeComponent() {
  const ref = useRef<HTMLDivElement>(null);
  
  const handleSwipe = (direction: 'up' | 'down' | 'left' | 'right') => {
    console.log('Swiped:', direction);
    
    if (direction === 'up') {
      // Handle swipe up
    }
  };
  
  useSwipe(ref, handleSwipe);
  
  return <div ref={ref}>Swipe me</div>;
}
```

### Framer Motion Animation
```typescript
import { motion } from 'framer-motion';

export function AnimatedComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      Animated content
    </motion.div>
  );
}
```

---

## 🎨 Styling & Theming

### Dark Theme Classes
```tsx
// Most components already have dark theme built-in
<div className="bg-black text-white">
  {/* Dark background, white text */}
</div>

// Emerald accent color
<button className="bg-emerald-600 hover:bg-emerald-700 text-white">
  Action
</button>

// Semi-transparent overlay
<div className="bg-black/95">
  {/* 95% opacity black */}
</div>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  {/* Responsive padding based on screen size */}
</div>
```

### Conditional Styling
```typescript
<div className={`
  px-4 py-2 rounded-lg transition
  ${isActive
    ? 'bg-emerald-600 text-black'
    : 'bg-black/50 text-white/70'
  }
`}>
  {isActive ? 'Active' : 'Inactive'}
</div>
```

---

## 🔄 Data Fetching & Syncing

### Fetch Orders from Firestore
```typescript
import { firestoreAdapter } from '@/firebase/firestoreAdapter';

useEffect(() => {
  const loadOrders = async () => {
    try {
      // Get orders (you need ordersAdapter for this)
      // const { files: orders } = await firestoreAdapter.listFiles(20);
      // OR use custom ordersAdapter
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };
  
  loadOrders();
}, []);
```

### Real-time Sync with Firestore
```typescript
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/client';

useEffect(() => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    setOrders(orders);
  });
  
  return () => unsubscribe(); // Cleanup
}, []);
```

---

## 🛑 Error Handling

### Handle API Errors
```typescript
try {
  const result = await firestoreAdapter.addFile(fileData);
  console.log('Success:', result);
} catch (error) {
  if (error.code === 'permission-denied') {
    console.error('Permission denied');
  } else if (error.code === 'invalid-argument') {
    console.error('Invalid file data');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

### Display Error to User
```typescript
import { uiStore } from '@/stores/uiStore';

// In store or effect
if (error) {
  uiStore.setState({ error: error.message });
}

// In component
const error = uiStore((state) => state.error);

{error && (
  <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-4">
    <p className="text-red-400">{error}</p>
  </div>
)}
```

---

## 📊 Common Patterns

### Loading State
```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } finally {
      setLoading(false);
    }
  };
  
  load();
}, []);

if (loading) return <LoadingSpinner />;
return <Component data={data} />;
```

### API Adapter Pattern
```typescript
// Create adapter for external API
export const externalAPI = {
  getOrders: async () => {
    // Call external IP
    // Return data
  },
  
  createOrder: async (order) => {
    // Create via external API
  }
};

// Use in store only
useEffect(() => {
  const result = await externalAPI.getOrders();
  uiStore.setState({ orders: result });
}, []);
```

### Component Composition
```typescript
export function Parent() {
  const [state, setState] = useState('');
  
  const handleUpdate = (value) => {
    setState(value);
  };
  
  return (
    <div>
      <Child 
        value={state} 
        onChange={handleUpdate}
      />
    </div>
  );
}

interface ChildProps {
  value: string;
  onChange: (value: string) => void;
}

export function Child({ value, onChange }: ChildProps) {
  return (
    <input 
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

---

## 🚀 Performance Optimization

### Memoize Expensive Calculations
```typescript
import { useMemo } from 'react';

export function Component({ orders }) {
  const filteredOrders = useMemo(() => {
    return orders.filter(o => o.status === 'new');
  }, [orders]);
  
  return <OrderList orders={filteredOrders} />;
}
```

### Memoize Component
```typescript
import { memo } from 'react';

export const OrderCard = memo(function OrderCard({ order }) {
  return <div>{order.name}</div>;
});
```

### Lazy Load Components
```typescript
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./AdminPanel'));

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPanel />
    </Suspense>
  );
}
```

---

## 🧪 Testing Code

### Test Component Renders
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Test User Interaction
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

test('button click works', () => {
  render(<Button onClick={jest.fn()}>Click me</Button>);
  
  fireEvent.click(screen.getByText('Click me'));
  
  expect(jest.fn()).toHaveBeenCalled();
});
```

### Test Async Code
```typescript
test('async data loads', async () => {
  render(<AsyncComponent />);
  
  expect(screen.getByText('Loading')).toBeInTheDocument();
  
  expect(await screen.findByText('Data')).toBeInTheDocument();
});
```

---

## 🔧 Debugging Tips

### Console Logging
```typescript
// Log component renders
console.log('Component rendered:', Date.now());

// Log state changes
useEffect(() => {
  console.log('State changed:', state);
}, [state]);

// Log API calls
try {
  const result = await api.call();
  console.log('API response:', result);
} catch (err) {
  console.error('API error:', err);
}
```

### Debug DevTools
```typescript
// In component
const data = useSelector(state => state.data);

// In browser DevTools:
// 1. F12 → Components
// 2. Search component name
// 3. Inspect props and state
```

### Performance Debugging
```typescript
// Measure performance
console.time('operation');
// ... do something
console.timeEnd('operation');
// Output: "operation: 15.5ms"

// In DevTools: Performance tab
// 1. Click record
// 2. Interact with app
// 3. Stop recording
// 4. Analyze frame times (should be ~16ms for 60fps)
```

---

## 📚 Useful One-Liners

```typescript
// Random ID
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();

// Format date
new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

// Format time
new Date().toLocaleTimeString('en-US', { 
  hour12: true 
});

// Copy to clipboard
navigator.clipboard.writeText('text');

// Alert user
window.alert('Message');

// Open link in new tab
window.open('https://...', '_blank');

// Redirect
window.location.href = '/path';

// Get URL parameters
new URLSearchParams(window.location.search).get('param');

// Debounce function
const debounce = (fn, ms) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};

// Throttle function
const throttle = (fn, ms) => {
  let last = 0;
  return (...args) => {
    if (Date.now() - last > ms) {
      fn(...args);
      last = Date.now();
    }
  };
};
```

---

## ✅ Quick Checklist for New Feature

```typescript
// 1. Create Firebase adapter (if needed)
// src/firebase/newAdapter.ts
export async function newOperation() {
  // Call Firebase
}

// 2. Create Zustand store (if needed)
// src/stores/newStore.ts
export const newStore = create(() => ({
  data: [],
  setData: (data) => set({ data })
}));

// 3. Create UI component
// src/features/new/Component.tsx
export function Component() {
  const data = newStore(state => state.data);
  return <div>{data}</div>;
}

// 4. Test it
// Open http://localhost:5173
// See component on page
// Check DevTools for errors F12
```

---

**Last Updated**: January 2024  
**Status**: ✅ Ready to copy-paste!

Pick a snippet above and customize for your use case 🚀
