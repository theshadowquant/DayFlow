import React, { useState, useEffect } from 'react';
import { 
  Bell, ChevronDown, Clock, ShieldCheck, UserCheck, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../services/storage';

interface HeaderProps {
  currentTab: string;
  onOpenNotifications: () => void;
  onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenNotifications,
}) => {
  const { currentEmployee, role, availableEmployees, inspectingEmployee, setInspectingEmployeeId } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showHRInspectMenu, setShowHRInspectMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const notifs = getNotifications();
    const myId = currentEmployee?.employeeId || '';
    const unread = notifs.filter(n => !n.read && (n.recipientId === 'ALL' || n.recipientId === myId)).length;
    setUnreadCount(unread);
  }, [currentEmployee]);

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard': return role === 'ADMIN' || role === 'HR' ? 'HR Operational Command Center' : 'Employee Workspace';
      case 'attendance': return 'Personal Attendance Record';
      case 'leave': return 'Leave Management & Time-Off';
      case 'payroll': return 'Salary Structure & Compensation';
      case 'profile': return 'Employee Identity & Profile';
      case 'directory': return 'Company Employee Directory';
      case 'hr-attendance': return 'Company-Wide Attendance Desk';
      case 'hr-approvals': return 'Leave Requests Approval Queue';
      case 'hr-payroll': return 'Payroll & Compensation Operations';
      case 'hr-analytics': return 'HR Analytics & Workforce Reports';
      case 'hr-settings': return 'Administrative HR Controls';
      default: return 'Dayflow Platform';
    }
  };

  const isHrOrAdmin = role === 'ADMIN' || role === 'HR';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Title & Context */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
          <span>Dayflow</span>
          <span>/</span>
          <span className="capitalize text-slate-700 font-semibold">{role.toLowerCase()}</span>
          <span>/</span>
          <span className="text-indigo-600 font-semibold">{getTitle()}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none mt-0.5">
          {getTitle()}
        </h1>
      </div>

      {/* Action Controls & Clock */}
      <div className="flex items-center space-x-4">
        {/* Live Digital Clock */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{currentDate}</span>
          <span className="text-slate-300">|</span>
          <span className="font-mono font-semibold text-slate-900">{currentTime}</span>
        </div>

        {/* Phase 10: HR Employee Record Inspection Indicator (Authorized Record Inspection, Zero Impersonation) */}
        {isHrOrAdmin && (
          <div className="relative">
            {inspectingEmployee ? (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Inspecting Record: <strong>{inspectingEmployee.firstName} {inspectingEmployee.lastName} ({inspectingEmployee.employeeId})</strong></span>
                <button
                  onClick={() => setInspectingEmployeeId(null)}
                  className="p-1 rounded text-purple-500 hover:bg-purple-100 hover:text-purple-900 transition-colors"
                  title="Close record inspection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowHRInspectMenu(!showHRInspectMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors text-xs font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>HR Record Inspector</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}

            {showHRInspectMenu && !inspectingEmployee && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">Authorized Record Inspection Desk</p>
                  <p className="text-[11px] text-slate-500">Inspect employee records as authenticated HR Director</p>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {availableEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setInspectingEmployeeId(emp.employeeId);
                        setShowHRInspectMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <img
                          src={emp.avatarUrl}
                          alt={emp.firstName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-900">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{emp.designation}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-600">
                        {emp.employeeId}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications Trigger */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
};
