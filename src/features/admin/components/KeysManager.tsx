import { useState } from 'react';
import { useAdminStore, AccessKey } from '@/stores/adminStore';
import { generateAccessKey } from '@/utils/keyGenerator';

export default function KeysManager() {
  const { keys, addKey, updateKey, deleteKey } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    role: 'user' as const,
    description: '',
    expiresIn: 'never' as 'never' | '7days' | '30days' | '90days',
  });

  const generateNewKey = () => {
    const newKey: AccessKey = {
      id: Date.now().toString(),
      key: generateAccessKey(),
      role: formData.role,
      createdAt: new Date(),
      expiresAt: getExpiryDate(formData.expiresIn),
      used: false,
      description: formData.description,
    };
    addKey(newKey);
    setShowForm(false);
    setFormData({ role: 'user', description: '', expiresIn: 'never' });
  };

  const getExpiryDate = (option: string): Date | null => {
    if (option === 'never') return null;
    const days = option === '7days' ? 7 : option === '30days' ? 30 : 90;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  return (
    <div className="p-6">
      {/* Create Key Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ➕ Создать новый ключ
      </button>

      {/* Create Key Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-100 rounded border border-gray-300">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Роль</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
                <option value="guest">Гость</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Срок действия</label>
              <select
                value={formData.expiresIn}
                onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="never">Без ограничений</option>
                <option value="7days">7 дней</option>
                <option value="30days">30 дней</option>
                <option value="90days">90 дней</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Описание (опционально)</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Например: ключ для дизайнера Иван"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={generateNewKey}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              ✅ Создать
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              ❌ Отмена
            </button>
          </div>
        </div>
      )}

      {/* Keys Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 text-left font-semibold">Ключ</th>
              <th className="p-3 text-left font-semibold">Роль</th>
              <th className="p-3 text-left font-semibold">Статус</th>
              <th className="p-3 text-left font-semibold">Создан</th>
              <th className="p-3 text-left font-semibold">Срок</th>
              <th className="p-3 text-left font-semibold">Описание</th>
              <th className="p-3 text-center font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-blue-600">{key.key}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                    {key.role === 'admin' ? '👨‍💼 Admin' : key.role === 'guest' ? '👤 Guest' : '👥 User'}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      key.used
                        ? 'bg-gray-200 text-gray-800'
                        : key.expiresAt && new Date(key.expiresAt) < new Date()
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {key.used ? '✓ Использован' : key.expiresAt && new Date(key.expiresAt) < new Date() ? '⏰ Истёк' : '✓ Активен'}
                  </span>
                </td>
                <td className="p-3 text-xs">{new Date(key.createdAt).toLocaleDateString('ru-RU')}</td>
                <td className="p-3 text-xs">{key.expiresAt ? new Date(key.expiresAt).toLocaleDateString('ru-RU') : '∞'}</td>
                <td className="p-3 text-xs text-gray-600">{key.description || '-'}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => deleteKey(key.id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {keys.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          📭 Ключей ещё не создано. Нажмите кнопку выше, чтобы создать первый ключ.
        </div>
      )}
    </div>
  );
}
