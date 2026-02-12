# 🔌 API Integration Guide

Connect PrintStudio to real Firebase Firestore data.

---

## 📊 Current State

**Dashboard currently uses**: Mock data (MOCK_ORDERS array)

```typescript
// src/pages/Dashboard.tsx (Line 20-40)
const MOCK_ORDERS = [
  { id: '1', orderNumber: 'ORD-001', ... },
  { id: '2', orderNumber: 'ORD-002', ... },
  // ...
];
```

**Goal**: Load real orders from Firestore

---

## 🔄 Step 1: Update Firestore Data Structure

### Collections to Create

**1. `orders/` collection**

```
orders/
├── order-001/
│   ├── id: "order-001"
│   ├── orderNumber: "ORD-2024-001"
│   ├── client: "ACME Corp"
│   ├── product: "T-Shirt"
│   ├── status: "new" | "in_progress" | "quality_check"
│   ├── deadline: 1704067200000 (timestamp)
│   ├── previewImage: "https://..." (optional)
│   ├── details: {
│   │   type: "Screen Print",
│   │   colors: "4+4"
│   │ }
│   ├── staff: {
│   │   manager: "John Doe"
│   │ }
│   ├── filesCount: 3
│   ├── createdAt: 1703990400000 (timestamp)
│   └── updatedAt: 1703990400000 (timestamp)
│
├── order-002/
│   └── ... similar structure
```

### Create Sample Orders

**In Firebase Console:**

1. Firestore Database → Collections
2. Create collection: `orders`
3. Add documents:

```json
{
  "id": "order-001",
  "orderNumber": "ORD-2024-001",
  "client": "ACME Corporation",
  "product": "Classic T-Shirt",
  "status": "new",
  "deadline": 1704067200000,
  "previewImage": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
  "details": {
    "type": "Screen Print",
    "colors": "4+4"
  },
  "staff": {
    "manager": "Alexandra Johnson"
  },
  "filesCount": 2,
  "createdAt": 1703990400000,
  "updatedAt": 1703990400000
}
```

**Repeat for 3-4 more orders** with different clients and products.

---

## 📝 Step 2: Create Firestore Data Adapter

Create new file: `src/firebase/ordersAdapter.ts`

```typescript
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './client';

export interface Order {
  id: string;
  orderNumber: string;
  client: string;
  product: string;
  status: 'new' | 'in_progress' | 'quality_check';
  deadline: number; // milliseconds
  previewImage?: string;
  details: {
    type: string;
    colors: string;
  };
  staff: {
    manager: string;
  };
  filesCount: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Get all orders, sorted by creation date (newest first)
 */
export async function getOrders(pageSize = 20): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({
      ...doc.data() as Order,
      id: doc.id
    }));
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Get single order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      ...docSnap.data() as Order,
      id: docSnap.id
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Create new order
 */
export async function createOrder(
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  try {
    const now = Date.now();
    
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return {
      ...orderData,
      id: docRef.id,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Update order
 */
export async function updateOrder(
  orderId: string,
  updates: Partial<Order>
): Promise<void> {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

/**
 * Delete order
 */
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const docRef = doc(db, 'orders', orderId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'new' | 'in_progress' | 'quality_check'
): Promise<void> {
  return updateOrder(orderId, { status, updatedAt: Date.now() });
}

/**
 * Increment files count for order
 */
export async function incrementFilesCount(orderId: string): Promise<void> {
  const order = await getOrder(orderId);
  if (order) {
    await updateOrder(orderId, {
      filesCount: order.filesCount + 1,
      updatedAt: Date.now()
    });
  }
}

/**
 * Get orders by client name (search)
 */
export async function searchOrdersByClient(clientName: string): Promise<Order[]> {
  try {
    // Note: Firestore doesn't have built-in text search
    // This loads all orders and filters client-side
    // For production, use Algolia or Firestore full-text search extension
    
    const orders = await getOrders(100);
    return orders.filter(o => 
      o.client.toLowerCase().includes(clientName.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching orders:', error);
    throw error;
  }
}
```

---

## 🎯 Step 3: Update Dashboard to Use Real Data

Edit `src/pages/Dashboard.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, Order } from '../firebase/ordersAdapter';
import { OrderReel } from '../features/navigation';
import { BottomNav } from '../features/navigation';
import { authStore } from '../stores/authStore';

export default function Dashboard() {
  const user = authStore(state => state.user);
  const [currentView, setCurrentView] = useState('reel');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load orders from Firestore on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedOrders = await getOrders(20);
        setOrders(fetchedOrders);
        
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, []);

  // Handle file upload
  const handleUpload = async (orderId: string, files: FileList) => {
    try {
      // 1. Upload files to Firestore (via firestoreAdapter)
      for (const file of files) {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          const base64 = e.target?.result as string;
          
          // Upload via existing firestoreAdapter
          // await firestoreAdapter.addFile({...})
          
          // 2. Update order filesCount
          const order = orders.find(o => o.id === orderId);
          if (order) {
            setOrders(prev => prev.map(o =>
              o.id === orderId 
                ? { ...o, filesCount: o.filesCount + 1 }
                : o
            ));
          }
        };
        
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files');
    }
  };

  // Handle order status change
  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status as 'new' | 'in_progress' | 'quality_check');
      
      // Update UI
      setOrders(prev => prev.map(o =>
        o.id === orderId 
          ? { ...o, status: status as any }
          : o
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order');
    }
  };

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin text-emerald-400 mb-2">⏳</div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black/95">
      {/* Render based on current view */}
      {currentView === 'reel' && (
        <OrderReel 
          orders={orders} 
          onUpload={handleUpload}
        />
      )}
      {currentView === 'calendar' && <CalendarView />}
      {currentView === 'upload' && <UploadView />}
      {currentView === 'team' && <TeamView />}
      {currentView === 'more' && <MoreView />}

      {/* Fixed bottom navigation */}
      <BottomNav 
        current={currentView} 
        onChange={setCurrentView}
      />
    </div>
  );
}
```

---

## 🔄 Step 4: Real-time Sync (Optional - Advanced)

For live updates when orders change:

```typescript
import { onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';

// In Dashboard useEffect, replace with:
useEffect(() => {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  // Listen for real-time updates
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      ...doc.data() as Order,
      id: doc.id
    }));
    setOrders(orders);
    setLoading(false);
  });
  
  // Cleanup listener
  return () => unsubscribe();
}, []);
```

**Benefits**:
- ✅ Orders update in real-time across all devices
- ✅ No need to refresh page
- ✅ Perfect for collaborative order management

**Cost**:
- Each listen = Firebase reads

---

## 📋 Step 5: Export/Update API

Update `src/firebase/index.ts`:

```typescript
// Re-export all adapters
export * from './client';
export * from './authAdapter';
export * from './firestoreAdapter';
export * from './ordersAdapter'; // NEW

export type { Order } from './ordersAdapter'; // NEW
```

---

## 🧪 Testing Real Data

### In Development

```bash
# 1. Start dev server
npm run dev

# 2. Login with your test key

# 3. You should see real orders from Firestore
# If empty, check:
#   - Orders collection exists in Firestore
#   - You created sample documents
#   - Firestore Rules allow read access

# 4. Try uploading file to order
# 5. Check filesCount increases
```

### Firestore Console Verification

1. Open Firebase Console
2. Go to Firestore Database
3. You should see:
   ```
   ✓ orders/
     ├─ order-001 (with your data)
     ├─ order-002 ...
   ```

4. Try creating order from app:
   ```
   ✓ New document appears in real-time
   ```

---

## 📊 Sample Query Patterns

### Get orders by status

```typescript
async function getOrdersByStatus(status: string): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('status', '==', status),
    orderBy('deadline', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

// Usage
const newOrders = await getOrdersByStatus('new');
const inProgressOrders = await getOrdersByStatus('in_progress');
```

### Get orders by manager

```typescript
async function getOrdersByManager(manager: string): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('staff.manager', '==', manager),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}
```

### Get overdue orders

```typescript
async function getOverdueOrders(): Promise<Order[]> {
  const now = Date.now();
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('deadline', '<', now),
    where('status', '!=', 'done')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}
```

---

## ⚡ Performance Tips

### Pagination

Load orders in batches rather than all at once:

```typescript
let lastDoc = null;
const PAGE_SIZE = 10;

async function getNextPage(): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  let q;
  
  if (!lastDoc) {
    q = query(
      ordersRef,
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );
  } else {
    q = query(
      ordersRef,
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );
  }
  
  const snapshot = await getDocs(q);
  if (snapshot.docs.length > 0) {
    lastDoc = snapshot.docs[snapshot.docs.length - 1];
  }
  
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}
```

### Caching

```typescript
// Cache orders in Zustand store to avoid refetches
const ordersStore = create((set) => ({
  orders: [] as Order[],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set(state => ({
    orders: [order, ...state.orders]
  }))
}));
```

---

## 🚨 Common Issues

### "No records returned from Firestore"

```
✓ Check collection name is 'orders'
✓ Check documents exist in Firebase Console
✓ Check Firestore Rules allow `read`
✓ Check user is authenticated
```

### "TypeError: Cannot read property 'id'"

```
✓ Check order object structure matches interface
✓ Verify Firestore document has all required fields
✓ Check null/undefined handling
```

### "Timestamp mismatch errors"

```typescript
// When reading from Firestore, timestamps are Timestamp objects
// Convert them:
const orders = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    deadline: data.deadline.toMillis?.() || data.deadline, // Convert
    createdAt: data.createdAt.toMillis?.() || data.createdAt
  };
});
```

---

## ✅ Checklist

- [ ] Created `src/firebase/ordersAdapter.ts`
- [ ] Created `orders/` collection in Firestore
- [ ] Added 3-5 sample orders to Firestore
- [ ] Updated `Dashboard.tsx` to load real orders
- [ ] Tested: can see orders on app load
- [ ] Tested: can upload files and see filesCount increase
- [ ] Tested: pagination if needed
- [ ] Set up real-time sync (optional)
- [ ] Deployed to Firebase

---

**Status**: ✅ Your app is now connected to real Firestore data!

Next: Test with live data and [deploy to production](./DEPLOYMENT.md)
