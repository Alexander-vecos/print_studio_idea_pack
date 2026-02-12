import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { KeyAuthModal } from './features/auth/components/KeyAuthModal';
import { PhoneAuthModal } from './features/auth/components/PhoneAuthModal';
import { FileUploadModal } from './features/files/components/FileUploadModal';
import { FileViewerModal } from './features/files/components/FileViewerModal';
import { initializeReferenceData } from './firebase/referenceAdapter';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const { initialize, user } = useAuthStore();

  // Initialize auth on app mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // If user is not authenticated - open key auth modal by default
  useEffect(() => {
    if (!user) {
      // lazy import store to avoid circular deps
      import('./stores/uiStore').then((m) => m.useUIStore.getState().openModal('keyAuth'));
    }
  }, [user]);

  // Initialize reference data once on app mount
  useEffect(() => {
    const setupReferenceData = async () => {
      try {
        await initializeReferenceData();
      } catch (error) {
        console.error('Failed to initialize reference data:', error);
        // Not critical - continue anyway
      }
    };

    setupReferenceData();
  }, []);

  return (
    <div className="w-full h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Auth Modals and File Modals - Always available */}
      <KeyAuthModal />
      <PhoneAuthModal />
      <div id="recaptcha-container" style={{position:'absolute', left:-9999, top: -9999}} />
      <FileUploadModal />
      <FileViewerModal />

      {/* Main Content */}
      {!user ? (
          // Wait for auth modal
          <div className="w-full h-screen flex items-center justify-center">
            <p className="text-gray-400">Waiting for authentication...</p>
          </div>
        ) : (
          // Protected dashboard
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </div>
  );
}

export default App;
