import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAttendance, subscribeToDataChanges } from '../../services/storage';
import type { AttendanceRecord } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const EmployeeAttendance: React.FC = () => {
  const { currentEmployee } = useAuth();
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

  const fetchAttendance = () => {
    if (!currentEmployee) return;
    const all = getAttendance();
    setAttendanceList(all.filter(a => a.employeeId === currentEmployee.employeeId));
  };

  useEffect(() => {
    fetchAttendance();
    const unsubscribe = subscribeToDataChanges(fetchAttendance);
    return () => unsubscribe();
  }, [currentEmployee]);

  if (!currentEmployee) return null;

  const totalMinutes = attendanceList.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const totalPresent = attendanceList.filter(a => a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT').length;
  const lateCount = attendanceList.filter(a => a.isLate).length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Days Logged</p>
            <p className="text-xl font-bold text-slate-900">{totalPresent} Days</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Hours Worked</p>
            <p className="text-xl font-bold text-slate-900">{totalHours} Hours</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Late Check-ins</p>
            <p className="text-xl font-bold text-slate-900">{lateCount} Occurrences</p>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Personal Attendance History</h3>
            <p className="text-xs text-slate-500">Daily breakdown of check-ins, check-outs, and shift status</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Check In</th>
                <th className="py-3 px-6">Check Out</th>
                <th className="py-3 px-6">Working Duration</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                attendanceList.map((rec) => {
                  const hours = Math.round((rec.durationMinutes / 60) * 10) / 10;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">{rec.date}</td>
                      <td className="py-3.5 px-6 font-mono font-medium text-slate-700">
                        {rec.checkIn || '--:--'}
                        {rec.isLate && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Late
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-mono font-medium text-slate-700">{rec.checkOut || '--:--'}</td>
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        {rec.durationMinutes > 0 ? `${hours} hrs` : '--'}
                      </td>
                      <td className="py-3.5 px-6">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">{rec.notes || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
