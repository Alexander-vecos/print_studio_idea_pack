import { KeyAuthModal } from './features/auth/components/KeyAuthModal';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { FaSignOutAlt } from 'react-icons/fa';
import { FileUploadModal } from './features/files/components/FileUploadModal';
import { FileViewerModal } from './features/files/components/FileViewerModal';

function App() {
  const { user, logout } = useAuthStore();
  const { openModal } = useUIStore();
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <KeyAuthModal />
      <FileViewerModal />
      
      {user ? (
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold">Welcome!</h1>
          <p className="mt-4">Logged in as: {user.role}</p>
          <p className="text-sm text-gray-500 font-mono mt-2">{user.uid}</p>
          
          <button
            onClick={() => logout()}
            className="mt-8 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      ) : (
        <div className="p-8 text-center opacity-50">
          Waiting for authentication...
        </div>
      )}
    </div>

  );
}

export default App;