import React from 'react';
import { useReferenceData } from '../hooks';

interface RoleSelectorProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
}

/**
 * Dropdown selector for user roles.
 * Populated from ROLES reference collection.
 */
export const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, className = '' }) => {
  const { items: roles, loading } = useReferenceData('ROLES');

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className={`p-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-emerald-500 focus:outline-none ${className}`}
    >
      <option value="" className="bg-gray-900">
        {loading ? 'Загрузка...' : 'Выберите роль'}
      </option>
      {roles.map((role) => (
        <option key={role.code} value={role.code} className="bg-gray-900">
          {role.label}
        </option>
      ))}
    </select>
  );
};
