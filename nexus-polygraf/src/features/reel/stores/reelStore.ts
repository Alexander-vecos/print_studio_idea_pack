import { create } from 'zustand';
import { Timestamp } from 'firebase/firestore';

export interface OrderItem {
  id: string;
  orderNumber: string;
  client: string;
  product: string;
  status: 'new' | 'in_progress' | 'quality_check';
  deadline: string;
  previewImage?: string;
  details: {
    type: string;
    colors: string;
  };
  staff: {
    manager: string;
  };
  filesCount: number;
}

interface ReelState {
  // Orders
  orders: OrderItem[];
  isLoading: boolean;
  error: string | null;

  // Navigation
  currentIndex: number;
  isAnimating: boolean;

  // Actions
  setOrders: (orders: OrderItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentIndex: (index: number) => void;
  setAnimating: (animating: boolean) => void;
  moveNext: () => void;
  movePrev: () => void;

  // Upload
  uploadFiles: (orderId: string, filesCount: number) => void;
}

export const useReelStore = create<ReelState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  currentIndex: 0,
  isAnimating: false,

  setOrders: (orders) => set({ orders }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  setAnimating: (animating) => set({ isAnimating: animating }),

  moveNext: () => {
    const state = get();
    if (!state.isAnimating && state.orders.length > 0) {
      set({ isAnimating: true });
      set({ currentIndex: state.currentIndex + 1 });
    }
  },

  movePrev: () => {
    const state = get();
    if (!state.isAnimating && state.orders.length > 0) {
      set({ isAnimating: true });
      set({ currentIndex: state.currentIndex - 1 });
    }
  },

  uploadFiles: (orderId, filesCount) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? { ...order, filesCount: order.filesCount + filesCount }
          : order
      ),
    }));
  },
}));
