import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getGuestKey } from '@/utils/keyGenerator';

export default function KeyAuthModal() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.loginWithKey);

  const handleSubmit = async () => {
    if (!key.trim()) {
      setError('Пожалуйста, введите ключ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(key.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login(getGuestKey());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">🔐 PrintStudio</h1>
        <p className="text-gray-600 text-center mb-6">Введите ключ доступа</p>

        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Например: KEY-XXXX-XXXX-XXXX"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? '⏳ Вход...' : '✅ Войти'}
        </button>

        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-3 mt-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:bg-gray-400 transition"
        >
          👤 Войти как гость
        </button>
      </div>
    </div>
  );
}