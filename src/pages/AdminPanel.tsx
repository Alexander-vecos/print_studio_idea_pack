import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAdminStore } from '@/stores/adminStore';
import KeysManager from '@/features/admin/components/KeysManager';
import ReferencesManager from '@/features/admin/components/ReferencesManager';
import PermissionsManager from '@/features/admin/components/PermissionsManager';

export default function AdminPanel() {
  const user = useAuthStore((state) => state.user);
  const activeTab = useAdminStore((state) => state.activeTab);
  const setActiveTab = useAdminStore((state) => state.setActiveTab);

  // Проверка прав администратора
  if (user?.role !== 'admin' && user?.role !== 'director') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">❌ Доступ запрещён</h1>
        <p className="text-gray-600 mt-2">У вас недостаточно прав для доступа к админ-панели</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Админ-панель</h1>
          <p className="text-gray-600 mt-2">Управление ключами, справочниками и правами доступа</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {(['keys', 'references', 'permissions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'keys' && '🔑 Ключи'}
              {tab === 'references' && '📚 Справочники'}
              {tab === 'permissions' && '🔐 Права доступа'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'keys' && <KeysManager />}
          {activeTab === 'references' && <ReferencesManager />}
          {activeTab === 'permissions' && <PermissionsManager />}
        </div>
      </div>
    </div>
  );
}
