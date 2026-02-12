import React from 'react';
import { motion } from 'framer-motion';
import { FaGripHorizontal, FaCalendarAlt, FaPlus, FaUsers, FaEllipsisV } from 'react-icons/fa';

interface BottomNavProps {
  current: string;
  onChange: (view: string) => void;
}

/**
 * Bottom Navigation - Fixed UI for mobile app
 * 5 buttons: Reel, Calendar, Plus (optional), Team/Workspace, More
 */
export const BottomNav2: React.FC<BottomNavProps> = ({ current, onChange }) => {
  const items = [
    { id: 'reel', icon: FaGripHorizontal, label: 'Лента' },
    { id: 'calendar', icon: FaCalendarAlt, label: 'Календарь' },
    { id: 'plus', icon: FaPlus, label: 'Добавить', optional: true },
    { id: 'team', icon: FaUsers, label: 'Команда' },
    { id: 'more', icon: FaEllipsisV, label: 'Опции' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 pb-4 safe-area-bottom">
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="pointer-events-auto bg-black/80 backdrop-blur-2xl border border-emerald-500/20 rounded-full w-full max-w-md h-16 flex justify-between items-stretch overflow-hidden px-2 shadow-2xl shadow-emerald-900/50"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all relative ${
                isActive ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-200'
              }`}
              whileTap={{ scale: 0.95 }}
              title={item.label}
            >
              {/* Icon */}
              <Icon
                size={18}
                style={{
                  filter: isActive ? '0 0 8px rgba(16, 185, 129, 0.8)' : 'none',
                  textShadow: isActive ? '0 0 8px rgba(16, 185, 129, 0.8)' : 'none',
                }}
              />

              {/* Active indicator - glow line */}
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute bottom-1 w-1.5 h-0.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Label (tiny) */}
              <span className="text-[9px] font-medium opacity-60">{item.label}</span>
            </motion.button>
          );
        })}
      </motion.nav>
    </div>
  );
};
