import { create } from 'zustand';
import { Timestamp } from 'firebase/firestore';

interface KeyGenerationState {
  // Generated keys
  keys: Array<{
    id: string;
    key: string;
    createdAt: Timestamp;
    expiresAt?: Timestamp | null;
    used: boolean;
    usedBy?: string;
    usedAt?: Timestamp;
  }>;

  // Generation state
  isGenerating: boolean;
  error: string | null;

  // Filter
  filterShowUsed: boolean;
  filterShowExpired: boolean;

  // Actions
  addKey: (key: any) => void;
  setKeys: (keys: any[]) => void;
  removeKey: (keyId: string) => void;

  // Generation actions
  startGeneration: () => void;
  completeGeneration: () => void;

  // Filter actions
  toggleFilterShowUsed: () => void;
  toggleFilterShowExpired: () => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAdminStore = create<KeyGenerationState>((set) => ({
  keys: [],

  isGenerating: false,
  error: null,

  filterShowUsed: false,
  filterShowExpired: false,

  addKey: (key) =>
    set((state) => ({
      keys: [key, ...state.keys],
    })),

  setKeys: (keys) => set({ keys }),

  removeKey: (keyId) =>
    set((state) => ({
      keys: state.keys.filter((k) => k.id !== keyId),
    })),

  startGeneration: () => set({ isGenerating: true, error: null }),

  completeGeneration: () => set({ isGenerating: false }),

  toggleFilterShowUsed: () =>
    set((state) => ({ filterShowUsed: !state.filterShowUsed })),

  toggleFilterShowExpired: () =>
    set((state) => ({ filterShowExpired: !state.filterShowExpired })),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));
