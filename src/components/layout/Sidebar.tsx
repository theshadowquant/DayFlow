import React from 'react';
import { 
  LayoutDashboard, Users, CalendarCheck, Clock, FileText, 
  Settings, LogOut, Briefcase, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const { currentEmployee, role, logout } = useAuth();

  const employeeNav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave & Time-off', icon: CalendarCheck },
    { id: 'payroll', label: 'Salary & Payroll', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: Users },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'directory', label: 'Employee Directory', icon: Users },
    { id: 'hr-attendance', label: 'Attendance Desk', icon: Clock },
    { id: 'hr-approvals', label: 'Leave Approvals', icon: CalendarCheck, badge: 'Active' },
    { id: 'hr-payroll', label: 'Payroll Management', icon: FileText },
    { id: 'hr-analytics', label: 'Analytics & Reports', icon: Briefcase },
    { id: 'hr-settings', label: 'HR Controls', icon: Settings },
  ];

  const navItems = role === 'ADMIN' ? adminNav : employeeNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
            D
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white tracking-tight text-lg">Dayflow</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Every workday, aligned.</p>
          </div>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">
            {role === 'ADMIN' ? 'HR Administrator' : 'Employee Access'}
          </span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          {role === 'ADMIN' ? 'HR Operations' : 'Self Service'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>
          );
        })}
      </div>

      {/* User Profile Footer */}
      {currentEmployee && (
        <div className="p-3 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img
                src={currentEmployee.avatarUrl}
                alt={currentEmployee.firstName}
                className="w-8 h-8 rounded-full object-cover border border-slate-600 shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {currentEmployee.firstName} {currentEmployee.lastName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{currentEmployee.designation}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
