import React from 'react';
import { useReferenceData, getLabelFromItems, getMetaFromItems } from '../hooks';

interface PriorityBadgeProps {
  code: string;
  className?: string;
}

/**
 * Displays a priority badge with color from reference data.
 * Uses PRIORITIES collection: code → label + meta.color
 */
export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ code, className = '' }) => {
  const { items: priorities } = useReferenceData('PRIORITIES');
  const colorClass = getMetaFromItems(priorities, code, 'color') || 'text-gray-400';
  const label = getLabelFromItems(priorities, code);

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${colorClass} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};
