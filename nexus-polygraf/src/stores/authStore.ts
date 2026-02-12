import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAdapter, UserProfile } from '../firebase/authAdapter';

interface AuthState {
  // Current user
  user: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  loginWithKey: (key: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<boolean>;
  verifyPhoneOtp: (code: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      setUser: (user) => set({ user }),

      clearError: () => set({ error: null }),

      loginWithKey: async (key: string) => {
        set({ isLoading: true, error: null });
        try {
          const userData = await authAdapter.loginWithKey(key);
          set({
            user: userData,
            isLoading: false,
          });
        } catch (err: any) {
          console.error('Login failed:', err);
          set({
            error: err.message || 'Authentication failed',
            isLoading: false,
          });
          throw err;
        }
      },

      loginAsGuest: async () => {
        set({ isLoading: true, error: null });
        try {
          const userData = await authAdapter.loginAsGuest();
          set({ user: userData, isLoading: false });
        } catch (err: any) {
          console.error('Guest login failed:', err);
          set({ error: err.message || 'Guest login failed', isLoading: false });
          throw err;
        }
      },

      sendPhoneOtp: async (phone: string) => {
        set({ isLoading: true, error: null });
        try {
          await authAdapter.sendPhoneOtp(phone);
          set({ isLoading: false });
          return true;
        } catch (err: any) {
          console.error('sendPhoneOtp failed:', err);
          set({ error: err.message || 'Failed to send OTP', isLoading: false });
          throw err;
        }
      },

      verifyPhoneOtp: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const userData = await authAdapter.verifyPhoneOtp(code);
          set({ user: userData, isLoading: false });
          return userData;
        } catch (err: any) {
          console.error('verifyPhoneOtp failed:', err);
          set({ error: err.message || 'Failed to verify OTP', isLoading: false });
          throw err;
        }
      },


      logout: async () => {
        set({ isLoading: true });
        try {
          await authAdapter.logout();
          set({ user: null, isLoading: false });
        } catch (err: any) {
          console.error('Logout failed:', err);
          set({
            error: err.message || 'Logout failed',
            isLoading: false,
          });
          throw err;
        }
      },

      initialize: () => {
        const unsubscribe = authAdapter.onAuthChange((firebaseUser) => {
          if (firebaseUser) {
            // User is logged in, but we need to get their Firestore profile
            const storedUser = get().user;
            if (!storedUser || storedUser.uid !== firebaseUser.uid) {
              // Load from Firestore if needed
              set({ isInitialized: true });
            }
          } else {
            // User is not logged in
            set({ user: null, isInitialized: true });
          }
        });

        set({ isInitialized: true });
        return unsubscribe;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
