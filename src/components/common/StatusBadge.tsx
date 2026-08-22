import React from 'react';
import type { AttendanceStatus, LeaveStatus, EmploymentStatus } from '../../types';

interface StatusBadgeProps {
  status: AttendanceStatus | LeaveStatus | EmploymentStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      // Attendance Statuses
      case 'CHECKED_IN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CHECKED_OUT':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'NOT_CHECKED_IN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ABSENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HALF_DAY':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'LEAVE':
      case 'On Leave':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      // Leave Statuses
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      // Employment Statuses
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Probation':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Terminated':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'CHECKED_IN': return 'Checked In';
      case 'CHECKED_OUT': return 'Checked Out';
      case 'NOT_CHECKED_IN': return 'Not Checked In';
      case 'ABSENT': return 'Absent';
      case 'HALF_DAY': return 'Half Day';
      case 'LEAVE': return 'On Leave';
      default: return status;
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${getStyles()} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {getLabel()}
    </span>
  );
};
