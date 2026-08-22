import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCheck, Info, AlertTriangle, Calendar, DollarSign, UserCheck, X
} from 'lucide-react';
import type { Notification } from '../../types';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, subscribeToDataChanges } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { currentEmployee } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifs = () => {
    const all = getNotifications();
    const myId = currentEmployee?.employeeId || '';
    const filtered = all.filter(n => n.recipientId === 'ALL' || n.recipientId === myId);
    setNotifications(filtered);
  };

  useEffect(() => {
    fetchNotifs();
    const unsubscribe = subscribeToDataChanges(fetchNotifs);
    return () => unsubscribe();
  }, [currentEmployee]);

  if (!isOpen) return null;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'LEAVE_APPROVED':
      case 'LEAVE_SUBMITTED':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'LEAVE_REJECTED':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'PAYROLL_UPDATE':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'ATTENDANCE_ALERT':
        return <UserCheck className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleMarkAll = () => {
    if (currentEmployee) {
      markAllNotificationsAsRead(currentEmployee.employeeId);
    }
  };

  const handleItemClick = (notif: Notification) => {
    markNotificationAsRead(notif.id);
    if (notif.targetTab) {
      onNavigateTab(notif.targetTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={onClose} />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Notifications</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAll}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center space-x-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
              <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No notifications found.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !notif.read ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-semibold ${!notif.read ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
