import React from 'react';
import { FiCompass, FiCalendar, FiPlus, FiUsers, FiMoreHorizontal } from 'react-icons/fi';

interface ViewPlaceholderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ViewPlaceholder: React.FC<ViewPlaceholderProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center justify-center h-full text-white/50 p-6 text-center">
    <div className="mb-4 text-6xl text-emerald-500/50 animate-pulse">{icon}</div>
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    <p className="text-sm max-w-xs">{description}</p>
  </div>
);

export const CalendarView: React.FC = () => (
  <ViewPlaceholder
    icon={<FiCalendar />}
    title="Calendar View"
    description="Calendar scheduling and timeline view will be available here"
  />
);

import { AddOrderForm } from '../orders/AddOrderForm';

export const UploadView: React.FC = () => (
  <div className="h-full overflow-auto p-4">
    <AddOrderForm />
  </div>
);

export const TeamView: React.FC = () => (
  <ViewPlaceholder
    icon={<FiUsers />}
    title="Team Workspace"
    description="Collaborate with team members and manage projects"
  />
);

export const MoreView: React.FC = () => (
  <ViewPlaceholder
    icon={<FiMoreHorizontal />}
    title="Options"
    description="Settings, preferences, and additional options"
  />
);
