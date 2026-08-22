import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotificationCenter } from './NotificationCenter';

interface AppShellProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onNavigate,
  children,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onNavigate={onNavigate} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentTab={currentTab}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNavigateTab={onNavigate}
      />
    </div>
  );
};
