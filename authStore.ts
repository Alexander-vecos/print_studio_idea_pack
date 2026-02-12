import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAdapter } from '../firebase/authAdapter';

interface UserProfile {
  uid: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  loginWithKey: (key: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user }),
      clearError: () => set({ error: null }),
      loginWithKey: async (key: string) => {
        set({ isLoading: true, error: null });
        try {
          const userData = await authAdapter.loginWithKey(key);
          set({
            user: { uid: userData.uid, role: userData.role },
            isLoading: false
          });
        } catch (err: any) {
          console.error("Login failed:", err);
          set({
            error: err.message || "Authentication failed",
            isLoading: false
          });
        }
      },
      logout: async () => {
        await authAdapter.logout();
        set({ user: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);