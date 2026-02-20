import React from 'react';
import { useReferenceData, getLabelFromItems, getMetaFromItems } from '../hooks';

interface OrderStatusBadgeProps {
  code: string;
  className?: string;
}

/**
 * Displays the current order step with sequence number.
 * Uses ORDER_STEPS collection: code → label + meta.seq
 */
export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ code, className = '' }) => {
  const { items: steps } = useReferenceData('ORDER_STEPS');
  const label = getLabelFromItems(steps, code);
  const seq = getMetaFromItems(steps, code, 'seq');

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full ${className}`}
    >
      {seq != null && (
        <span className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-[10px] font-bold">
          {seq}
        </span>
      )}
      {label}
    </span>
  );
};
