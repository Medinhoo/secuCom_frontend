import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { NotificationPreview } from '@/components/dashboard/NotificationPreview';
import { DimonasToSendSection } from '@/components/dashboard/DimonasToSendSection';
import { DimonasInProgressSection } from '@/components/dashboard/DimonasInProgressSection';
import { NotesSection } from '@/components/dashboard/NotesSection';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const SecretariatAdminDashboard: React.FC = () => {
  const { refetch: refetchStats } = useDashboardStats();

  return (
    <div className="min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with actions */}
        <DashboardHeader 
          onRefresh={refetchStats}
        />

        {/* Main content grid 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Top left - Notifications */}
          <div className="flex flex-col">
            <NotificationPreview />
          </div>

          {/* Top right - Todo List */}
          <div className="flex flex-col">
            <NotesSection />
          </div>

          {/* Bottom left - Dimonas IN_PROGRESS */}
          <div className="flex flex-col">
            <DimonasInProgressSection />
          </div>

          {/* Bottom right - Dimonas TO_SEND */}
          <div className="flex flex-col">
            <DimonasToSendSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretariatAdminDashboard;
