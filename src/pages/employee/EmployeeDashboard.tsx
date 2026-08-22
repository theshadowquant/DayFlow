import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getTodayAttendanceForEmployee, checkInEmployee, checkOutEmployee, 
  getLeaveRequests, getActivityLogs, subscribeToDataChanges 
} from '../../services/storage';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Clock, Calendar, DollarSign, User, ArrowRight, Play, Square, 
  AlertCircle, Activity, Sparkles
} from 'lucide-react';
import type { AttendanceRecord, LeaveRequest, ActivityLog } from '../../types';

interface EmployeeDashboardProps {
  onNavigate: (tab: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate }) => {
  const { currentEmployee } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | undefined>(undefined);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshData = () => {
    if (!currentEmployee) return;
    const att = getTodayAttendanceForEmployee(currentEmployee.employeeId);
    setTodayAttendance(att);

    const allLeaves = getLeaveRequests();
    setLeaveRequests(allLeaves.filter(l => l.employeeId === currentEmployee.employeeId));

    const allLogs = getActivityLogs();
    setActivities(allLogs.filter(l => l.actorId === currentEmployee.employeeId).slice(0, 5));
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToDataChanges(refreshData);
    return () => unsubscribe();
  }, [currentEmployee]);

  if (!currentEmployee) return null;

  const handleCheckIn = () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      checkInEmployee(currentEmployee.employeeId, note || 'Punctual Check-in');
      setNote('');
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to check in.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      checkOutEmployee(currentEmployee.employeeId, note || 'Completed Workday');
      setNote('');
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to check out.');
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = todayAttendance?.status === 'CHECKED_IN';
  const isCheckedOut = todayAttendance?.status === 'CHECKED_OUT' || todayAttendance?.status === 'HALF_DAY';
  const isOnLeave = todayAttendance?.status === 'LEAVE';

  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Welcome back, {currentEmployee.firstName}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {currentEmployee.firstName} {currentEmployee.lastName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            {currentEmployee.designation} • {currentEmployee.department}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/80">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <p className="text-[10px] text-slate-400 font-medium">EMPLOYEE ID</p>
            <p className="text-xs font-mono font-bold text-slate-100">{currentEmployee.employeeId}</p>
          </div>
        </div>
      </div>

      {/* TODAY ATTENDANCE COCKPIT */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-900">Today's Attendance Cockpit</h3>
              <StatusBadge status={todayAttendance?.status || 'NOT_CHECKED_IN'} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Record your daily check-in and check-out to maintain compliance.
            </p>
          </div>

          <div className="flex items-center space-x-6 text-xs bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
            <div>
              <p className="text-slate-400 font-medium">CHECK IN</p>
              <p className="font-mono font-bold text-slate-900 text-sm">{todayAttendance?.checkIn || '--:--'}</p>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <p className="text-slate-400 font-medium">CHECK OUT</p>
              <p className="font-mono font-bold text-slate-900 text-sm">{todayAttendance?.checkOut || '--:--'}</p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional check-in/out remark (e.g. Remote work, Client meeting)..."
              disabled={isCheckedOut || isOnLeave}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-slate-50"
            />
          </div>

          <div className="flex items-center space-x-3 justify-end">
            {!isCheckedIn && !isCheckedOut && !isOnLeave && (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{loading ? 'Processing...' : 'Check In Now'}</span>
              </button>
            )}

            {isCheckedIn && (
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center justify-center space-x-2 transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>{loading ? 'Processing...' : 'Check Out Now'}</span>
              </button>
            )}

            {isCheckedOut && (
              <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold text-center border border-slate-200">
                Workday Shift Completed
              </div>
            )}

            {isOnLeave && (
              <div className="w-full py-2.5 px-4 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold text-center border border-blue-200">
                On Approved Leave Today
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Paid Leave Available"
          value={`${currentEmployee.leaveBalance.paid - currentEmployee.leaveBalance.paidUsed} Days`}
          subtitle={`Total Allocated: ${currentEmployee.leaveBalance.paid} Days`}
          icon={Calendar}
          color="emerald"
          onClick={() => onNavigate('leave')}
        />
        <StatCard
          title="Sick Leave Available"
          value={`${currentEmployee.leaveBalance.sick - currentEmployee.leaveBalance.sickUsed} Days`}
          subtitle={`Used this year: ${currentEmployee.leaveBalance.sickUsed} Days`}
          icon={Calendar}
          color="amber"
          onClick={() => onNavigate('leave')}
        />
        <StatCard
          title="Pending Leave Requests"
          value={pendingLeaves}
          subtitle={pendingLeaves > 0 ? 'Awaiting HR Review' : 'No active pending requests'}
          icon={Clock}
          color="indigo"
          onClick={() => onNavigate('leave')}
        />
        <StatCard
          title="Monthly Compensation"
          value="$13,000"
          subtitle="Direct deposit active"
          icon={DollarSign}
          color="sky"
          onClick={() => onNavigate('payroll')}
        />
      </div>

      {/* QUICK ACTIONS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs lg:col-span-1 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
          
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('leave')}
              className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Apply for Time-off</p>
                  <p className="text-[10px] text-slate-500">Request Paid, Sick or Unpaid Leave</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('attendance')}
              className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Attendance Log</p>
                  <p className="text-[10px] text-slate-500">View weekly and monthly hours</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('payroll')}
              className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Salary & Pay Slips</p>
                  <p className="text-[10px] text-slate-500">Download printable pay statements</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">My Profile & Identity</p>
                  <p className="text-[10px] text-slate-500">Update phone, address & documents</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Employee Activity</h3>
            <span className="text-xs font-medium text-slate-400">Audit Stream</span>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent activity recorded.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="py-3 flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 mt-0.5">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800">{act.action}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{act.details}</p>
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
