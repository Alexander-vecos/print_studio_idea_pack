# 🚀 Advanced Features Guide

Advanced features and enhancements you can add to PrintStudio PWA.

---

## 📋 Feature Roadmap

```
CURRENT (MVP):
✅ Order Reel carousel
✅ Key-based authentication
✅ File upload (Base64)
✅ Basic navigation
✅ Dark theme + Emerald color

NEXT (v1.1 - 2-4 weeks):
⏳ Real orders from Firestore
⏳ Calendar view with timeline
⏳ Team/workspace management
⏳ File preview in reel cards

FUTURE (v2.0 - 1-2 months):
💡 Admin dashboard
💡 Advanced search & filters
💡 Phone OTP verification
💡 Order tracking timeline
💡 Analytics & reporting
```

---

## 🎯 Feature 1: Real-time Order Sync

### What
Orders update instantly across all connected users

### Why
- Team members see status changes immediately
- No need to refresh page
- Collaborative order management

### How to Implement

**1. Update `reelStore.ts` with Firestore listener**

```typescript
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';

export const reelStore = create((set) => ({
  orders: [] as Order[],
  isLoading: true,
  error: null,
  
  // Subscribe to real-time updates
  subscribeToOrders: () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        ...doc.data() as Order,
        id: doc.id
      }));
      
      set({ orders, isLoading: false });
    }, (error) => {
      set({ error: error.message, isLoading: false });
    });
    
    return unsubscribe;
  }
}));
```

**2. Use in Dashboard**

```typescript
useEffect(() => {
  const unsubscribe = reelStore.getState().subscribeToOrders();
  return () => unsubscribe();
}, []);
```

**3. Test**
- Open app in 2 tabs
- Update order in Firebase Console
- Watch both tabs update automatically

---

## 🎯 Feature 2: Calendar View

### What
Visual calendar showing order deadlines and timeline

### Why
- Easy deadline tracking
- Team can see busy days
- Better project planning

### How to Implement

**1. Install calendar library**

```bash
npm install react-calendar date-fns
```

**2. Create `CalendarView.tsx` component**

```typescript
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Order } from '../firebase/ordersAdapter';

export function CalendarView({ orders }: { orders: Order[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get orders for selected date
  const ordersOnDate = orders.filter(order => {
    const deadline = new Date(order.deadline);
    return deadline.toDateString() === selectedDate.toDateString();
  });
  
  return (
    <div className="p-4 bg-black/95 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Calendar</h1>
      
      {/* Calendar widget */}
      <div className="mb-6 bg-black/50 rounded-lg p-4">
        <Calendar 
          onChange={setSelectedDate}
          value={selectedDate}
          className="w-full dark-calendar"
        />
      </div>
      
      {/* Orders for selected date */}
      <div className="space-y-4">
        <h2 className="text-lg text-emerald-400 font-semibold">
          {ordersOnDate.length} Order(s) on {selectedDate.toLocaleDateString()}
        </h2>
        
        {ordersOnDate.length === 0 ? (
          <p className="text-white/50">No orders on this date</p>
        ) : (
          ordersOnDate.map(order => (
            <div key={order.id} className="bg-emerald-900/20 border border-emerald-600/30 rounded-lg p-4">
              <h3 className="text-white font-semibold">{order.product}</h3>
              <p className="text-white/70">{order.client}</p>
              <p className="text-sm text-emerald-400">Status: {order.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

**3. Style dark calendar**

```css
/* In App.css */
.react-calendar {
  --main-color: #10B981;
  --border-color: #1F3A3A;
  background-color: #050a07;
  color: #ffffff;
  border: 1px solid #1F3A3A;
  border-radius: 0.5rem;
}

.react-calendar__month-view__days__day--weekend {
  color: #FBBF24;
}

.react-calendar__tile--active {
  background-color: #10B981;
  color: #000;
}

.react-calendar__tile:hover {
  background-color: #10B98133;
}
```

---

## 🎯 Feature 3: Advanced Search & Filters

### What
Search orders by client, product, status

### Why
- Quickly find specific orders
- Filter by status (new/in_progress/done)
- Better order management

### How to Implement

**1. Create search hook**

```typescript
// hooks/useOrderSearch.ts
import { useMemo, useState } from 'react';
import { Order } from '../firebase/ordersAdapter';

export function useOrderSearch(orders: Order[]) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    client: '',
  });
  
  const results = useMemo(() => {
    return orders.filter(order => {
      const matchesQuery = 
        order.client.toLowerCase().includes(query.toLowerCase()) ||
        order.product.toLowerCase().includes(query.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(query.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || order.status === filters.status;
      const matchesClient = !filters.client || order.client === filters.client;
      
      return matchesQuery && matchesStatus && matchesClient;
    });
  }, [orders, query, filters]);
  
  return { results, query, setQuery, filters, setFilters };
}
```

**2. Use in Dashboard**

```typescript
const { results, query, setQuery, filters, setFilters } = useOrderSearch(orders);

return (
  <div className="space-y-4 p-4">
    {/* Search bar */}
    <input
      type="text"
      placeholder="Search orders..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full px-4 py-2 bg-black/50 border border-emerald-600/30 rounded-lg text-white placeholder-white/30"
    />
    
    {/* Filter buttons */}
    <div className="flex gap-2 overflow-x-auto pb-2">
      {['all', 'new', 'in_progress', 'quality_check'].map(status => (
        <button
          key={status}
          onClick={() => setFilters({ ...filters, status })}
          className={`px-4 py-2 rounded-lg transition ${
            filters.status === status
              ? 'bg-emerald-600 text-black'
              : 'bg-black/50 text-white/70 border border-emerald-600/30'
          }`}
        >
          {status.replace('_', ' ')}
        </button>
      ))}
    </div>
    
    {/* Results */}
    <div className="space-y-2">
      <p className="text-white/70">{results.length} orders found</p>
      {results.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  </div>
);
```

---

## 🎯 Feature 4: Order Status Timeline

### What
Visual timeline showing order progress from new → done

### Why
- Clear progress visualization
- Team visibility on order stage
- Professional status tracking

### How to Implement

```typescript
// components/OrderTimeline.tsx
export function OrderTimeline({ order }: { order: Order }) {
  const stages = [
    { id: 'new', label: 'New', icon: '📝' },
    { id: 'in_progress', label: 'In Progress', icon: '⚙️' },
    { id: 'quality_check', label: 'QA', icon: '✓' },
    { id: 'done', label: 'Done', icon: '✅' },
  ];
  
  const currentIndex = stages.findIndex(s => s.id === order.status);
  
  return (
    <div className="flex items-center gap-2 py-4">
      {stages.map((stage, idx) => (
        <div key={stage.id} className="flex items-center">
          {/* Stage circle */}
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-lg
            ${idx <= currentIndex
              ? 'bg-emerald-600 text-black'
              : 'bg-white/10 text-white/50'
            }
          `}>
            {stage.icon}
          </div>
          
          {/* Connector line */}
          {idx < stages.length - 1 && (
            <div className={`h-1 w-8 mx-2 ${
              idx < currentIndex ? 'bg-emerald-600' : 'bg-white/10'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Feature 5: Team Workspace Management

### What
Assign orders to team members, manage permissions

### Why
- Team collaboration
- Clear role assignments
- Order accountability

### How to Implement

**1. Firestore schema**

```javascript
// teams/{teamId}
{
  name: "Print Studio Main",
  members: {
    user1: { role: "manager", name: "John Doe" },
    user2: { role: "operator", name: "Jane Smith" }
  },
  owner: "user1"
}

// Assign order to team member
// orders/{orderId}
{
  // ... existing fields
  assignedTo: "user2",
  team: "teamId"
}
```

**2. Create TeamView component**

```typescript
export function TeamView() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Team</h1>
      
      <div className="space-y-4">
        {team.map(member => (
          <div key={member.id} className="bg-emerald-900/20 border border-emerald-600/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-semibold">{member.name}</h3>
                <p className="text-white/70 text-sm">{member.role}</p>
              </div>
              <div className="text-emerald-400 font-semibold">
                {member.ordersCount} orders
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Feature 6: File Preview in Reel Cards

### What
Show thumbnails/previews of uploaded files on order cards

### Why
- Quick visual context
- Better UX for print designs
- See proof files immediately

### How to Implement

```typescript
// In OrderCard component
interface OrderCardProps {
  order: Order;
  onUpload: (files: FileList) => void;
}

export function OrderCard({ order, onUpload }: OrderCardProps) {
  const [preview, setPreview] = useState<string | null>(null);
  
  useEffect(() => {
    // Load first file as preview
    if (order.filesCount > 0) {
      loadOrderFiles(order.id).then(files => {
        if (files[0]) {
          setPreview(files[0].base64);
        }
      });
    }
  }, [order.filesCount]);
  
  return (
    <div className="relative h-full bg-cover bg-center"
      style={{
        backgroundImage: preview 
          ? `url(${preview})`
          : `url(${order.previewImage})`
      }}
    >
      {/* Preview files indicator */}
      {preview && (
        <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 rounded">
          <span className="text-emerald-400 text-sm">📄 Preview</span>
        </div>
      )}
      
      {/* Rest of card ... */}
    </div>
  );
}
```

---

## 🎯 Feature 7: Export Orders to CSV/PDF

### What
Download order list as CSV or PDF report

### Why
- Offline access
- Email sharing
- Record keeping

### How to Implement

**1. Install libraries**

```bash
npm install papaparse jspdf
```

**2. Create export utilities**

```typescript
// utils/exporters.ts
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Order } from '../firebase/ordersAdapter';

export function exportOrdersToCSV(orders: Order[]) {
  const csv = Papa.unparse(orders);
  
  const link = document.createElement('a');
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export function exportOrdersToPDF(orders: Order[]) {
  const doc = new jsPDF();
  
  const tableData = orders.map(o => [
    o.orderNumber,
    o.client,
    o.product,
    o.status,
    new Date(o.deadline).toLocaleDateString()
  ]);
  
  doc.autoTable({
    head: [['Order #', 'Client', 'Product', 'Status', 'Deadline']],
    body: tableData,
    theme: 'dark'
  });
  
  doc.save(`orders-${new Date().toISOString().split('T')[0]}.pdf`);
}
```

**3. Add buttons to UI**

```typescript
<div className="flex gap-2">
  <button onClick={() => exportOrdersToCSV(orders)} className="btn-primary">
    📊 Export CSV
  </button>
  <button onClick={() => exportOrdersToPDF(orders)} className="btn-primary">
    📄 Export PDF
  </button>
</div>
```

---

## 🎯 Feature 8: Analytics Dashboard

### What
Metrics showing orders completed, average time, team performance

### Why
- Track business metrics
- Identify bottlenecks
- Measure productivity

### How to Implement

```typescript
// utils/analytics.ts
export interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  averageTimeToComplete: number; // hours
  topClients: { name: string; count: number }[];
  topProducts: { name: string; count: number }[];
}

export function calculateAnalytics(orders: Order[]): OrderAnalytics {
  const completed = orders.filter(o => o.status === 'done');
  
  return {
    totalOrders: orders.length,
    completedOrders: completed.length,
    inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
    averageTimeToComplete: completed.length > 0
      ? completed.reduce((sum, o) => sum + timeBetween(o.createdAt, o.updatedAt), 0) / completed.length
      : 0,
    topClients: getTopClients(orders),
    topProducts: getTopProducts(orders),
  };
}
```

---

## 🎯 Feature 9: Notifications

### What
Push notifications for order status changes or team messages

### Why
- Real-time alerts
- Team communication
- Urgent issue visibility

### How to Implement

**Using Firebase Cloud Messaging (FCM)**

```bash
npm install firebase
```

**In your app:**

```typescript
import { getMessaging, onMessage } from 'firebase/messaging';

const messaging = getMessaging();

onMessage(messaging, (payload) => {
  console.log('Message received:', payload);
  
  // Show notification toast
  showNotification({
    title: payload.notification?.title,
    body: payload.notification?.body,
    type: 'success'
  });
});
```

---

## 🎯 Feature 10: Dark/Light Theme Toggle

### What
Allow users to switch between dark and light themes

### Why
- Eye comfort
- Accessibility
- User preference

### How to Implement

```typescript
// stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const themeStore = create(
  persist(
    (set) => ({
      theme: 'dark' as 'dark' | 'light',
      toggle: () => set(state => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
      })),
    }),
    { name: 'theme-storage' }
  )
);

// In App.tsx
export default function App() {
  const theme = themeStore(state => state.theme);
  const toggle = themeStore(state => state.toggle);
  
  return (
    <div className={theme === 'dark' ? 'dark bg-black' : 'light bg-white'}>
      {/* App content */}
      <button onClick={toggle}>🌙/☀️ Toggle Theme</button>
    </div>
  );
}
```

---

## 🚀 Implementation Priority

**High Priority (Do First)**
1. Real-time order sync (Feature #1)
2. Advanced search & filters (Feature #3)
3. Calendar view (Feature #2)

**Medium Priority (Do Next)**
4. Order status timeline (Feature #4)
5. File preview in cards (Feature #6)
6. Export to CSV/PDF (Feature #7)

**Lower Priority (Nice to Have)**
7. Team workspace (Feature #5)
8. Analytics dashboard (Feature #8)
9. Notifications (Feature #9)
10. Theme toggle (Feature #10)

---

## 📚 Resources for Each Feature

**For search & filtering**
- React docs: Hooks → useCallback, useMemo
- Firebase: Query filters docs

**For export**
- Papa Parse docs: https://www.papaparse.com
- jsPDF docs: https://github.com/parallax/jsPDF

**For notifications**
- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging

**For Firestore sync**
- Real-time listeners: https://firebase.google.com/docs/firestore/query-data/listen

---

## ✅ Checklist for Adding a Feature

- [ ] Create issue/spec
- [ ] Design data model (Firestore collections)
- [ ] Create adapter function (if needed Firebase)
- [ ] Create component
- [ ] Test with mock data
- [ ] Connect to real Firebase data
- [ ] Test on mobile
- [ ] Performance check (Lighthouse)
- [ ] Deploy and monitor

---

**Status**: Ready to implement advanced features! 🚀

Choose one feature from the Priority list above and start building!
