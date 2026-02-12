import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AccessKey {
  id: string;
  key: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  expiresAt: Date | null;
  used: boolean;
  usedBy?: string;
  usedAt?: Date;
  description?: string;
}

export interface ReferenceItem {
  id: string;
  code: string;
  label: string;
  meta?: Record<string, any>;
  order?: number;
}

export interface Permission {
  role: string;
  action: string;
  allowed: boolean;
  description?: string;
}

interface AdminStoreState {
  // Keys management
  keys: AccessKey[];
  setKeys: (keys: AccessKey[]) => void;
  addKey: (key: AccessKey) => void;
  updateKey: (id: string, key: Partial<AccessKey>) => void;
  deleteKey: (id: string) => void;

  // Reference data management
  references: Record<string, ReferenceItem[]>;
  setReferences: (name: string, items: ReferenceItem[]) => void;
  addReferenceItem: (collectionName: string, item: ReferenceItem) => void;
  updateReferenceItem: (collectionName: string, id: string, item: Partial<ReferenceItem>) => void;
  deleteReferenceItem: (collectionName: string, id: string) => void;
  reorderReferenceItems: (collectionName: string, items: ReferenceItem[]) => void;

  // Permissions management
  permissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;
  updatePermission: (role: string, action: string, allowed: boolean) => void;

  // UI state
  activeTab: 'keys' | 'references' | 'permissions';
  setActiveTab: (tab: 'keys' | 'references' | 'permissions') => void;
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set) => ({
      keys: [],
      setKeys: (keys) => set({ keys }),
      addKey: (key) => set((state) => ({ keys: [...state.keys, key] })),
      updateKey: (id, updates) =>
        set((state) => ({
          keys: state.keys.map((k) => (k.id === id ? { ...k, ...updates } : k)),
        })),
      deleteKey: (id) =>
        set((state) => ({
          keys: state.keys.filter((k) => k.id !== id),
        })),

      references: {},
      setReferences: (name, items) =>
        set((state) => ({
          references: { ...state.references, [name]: items },
        })),
      addReferenceItem: (collectionName, item) =>
        set((state) => ({
          references: {
            ...state.references,
            [collectionName]: [...(state.references[collectionName] || []), item],
          },
        })),
      updateReferenceItem: (collectionName, id, updates) =>
        set((state) => ({
          references: {
            ...state.references,
            [collectionName]: (state.references[collectionName] || []).map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          },
        })),
      deleteReferenceItem: (collectionName, id) =>
        set((state) => ({
          references: {
            ...state.references,
            [collectionName]: (state.references[collectionName] || []).filter(
              (item) => item.id !== id
            ),
          },
        })),
      reorderReferenceItems: (collectionName, items) =>
        set((state) => ({
          references: {
            ...state.references,
            [collectionName]: items,
          },
        })),

      permissions: [],
      setPermissions: (permissions) => set({ permissions }),
      updatePermission: (role, action, allowed) =>
        set((state) => ({
          permissions: state.permissions.map((p) =>
            p.role === role && p.action === action ? { ...p, allowed } : p
          ),
        })),

      activeTab: 'keys',
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'admin-store',
    }
  )
);
