import React, { useState, useEffect } from 'react';
import { 
  getEmployees, getAttendance, getLeaveRequests, getPayrolls, 
  approveLeaveRequest, rejectLeaveRequest, subscribeToDataChanges, getTodayDateString 
} from '../../services/storage';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Clock, CalendarCheck, DollarSign, CheckCircle2, 
  XCircle, UserPlus, FileSpreadsheet, ArrowRight, ShieldCheck, Sparkles 
} from 'lucide-react';
import type { LeaveRequest } from '../../types';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { currentEmployee } = useAuth();
  const [employeesCount, setEmployeesCount] = useState(0);
  const [presentTodayCount, setPresentTodayCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [totalPayroll, setTotalPayroll] = useState(0);

  const refreshHRData = () => {
    const employees = getEmployees();
    setEmployeesCount(employees.length);

    const today = getTodayDateString();
    const attendance = getAttendance();
    const todayAtt = attendance.filter(a => a.date === today);

    const present = todayAtt.filter(a => a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT').length;
    setPresentTodayCount(present);

    const leaves = getLeaveRequests();
    setPendingRequests(leaves.filter(l => l.status === 'Pending'));

    const payrolls = getPayrolls();
    const sum = payrolls.reduce((acc, p) => acc + (p.salaryStructure?.netSalary || 0), 0);
    setTotalPayroll(sum);
  };

  useEffect(() => {
    refreshHRData();
    const unsubscribe = subscribeToDataChanges(refreshHRData);
    return () => unsubscribe();
  }, []);

  const handleQuickApprove = (reqId: string) => {
    if (!currentEmployee) return;
    approveLeaveRequest(reqId, currentEmployee.employeeId, 'Approved via HR Dashboard Desk');
  };

  const handleQuickReject = (reqId: string) => {
    if (!currentEmployee) return;
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      rejectLeaveRequest(reqId, currentEmployee.employeeId, reason);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Operational Command Center</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Dayflow Human Capital Overview
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Real-time workforce attendance, pending approval queues, and payroll status.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-purple-900/40 px-4 py-2.5 rounded-xl border border-purple-500/30">
          <ShieldCheck className="w-5 h-5 text-purple-300" />
          <div>
            <p className="text-[10px] text-purple-300 font-medium">HR SYSTEM ENGINE</p>
            <p className="text-xs font-bold text-white">State-Consistent Operations</p>
          </div>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Workforce"
          value={`${employeesCount} Staff`}
          subtitle="Across 6 Departments"
          icon={Users}
          color="indigo"
          onClick={() => onNavigate('directory')}
        />
        <StatCard
          title="Present Today"
          value={`${presentTodayCount} Employees`}
          subtitle={`Attendance Rate: ${employeesCount > 0 ? Math.round((presentTodayCount / employeesCount) * 100) : 0}%`}
          icon={Clock}
          color="emerald"
          onClick={() => onNavigate('hr-attendance')}
        />
        <StatCard
          title="Pending Approvals"
          value={`${pendingRequests.length} Requests`}
          subtitle="Requires HR Action"
          icon={CalendarCheck}
          color="amber"
          onClick={() => onNavigate('hr-approvals')}
        />
        <StatCard
          title="Monthly Payroll Spend"
          value={`$${totalPayroll.toLocaleString()}`}
          subtitle="Direct deposit ready"
          icon={DollarSign}
          color="sky"
          onClick={() => onNavigate('hr-payroll')}
        />
      </div>

      {/* ATTENTION REQUIRED QUEUE & QUICK HR ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Attention Required: Leave Approvals</h3>
              <p className="text-xs text-slate-500">Review and approve pending employee leave requests</p>
            </div>
            <button
              onClick={() => onNavigate('hr-approvals')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>View Desk Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingRequests.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-800">All leave requests processed!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No pending approvals awaiting HR review.</p>
              </div>
            ) : (
              pendingRequests.map((req: LeaveRequest) => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs">{req.employeeName}</span>
                      <span className="text-[11px] text-slate-500">({req.department})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {req.leaveType} Leave
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      <span className="font-semibold">{req.startDate} to {req.endDate}</span> ({req.durationDays} day{req.durationDays > 1 ? 's' : ''})
                    </p>
                    <p className="text-[11px] text-slate-500 italic mt-0.5 font-medium">"{req.remarks}"</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleQuickApprove(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleQuickReject(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick HR Operations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs lg:col-span-1 space-y-4">
          <h3 className="text-base font-bold text-slate-900">HR Executive Shortcuts</h3>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('directory')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Register New Staff</p>
                  <p className="text-[10px] text-slate-500">Add employee to directory</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('hr-attendance')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Daily Attendance Desk</p>
                  <p className="text-[10px] text-slate-500">Company attendance matrix</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('hr-payroll')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Payroll Management</p>
                  <p className="text-[10px] text-slate-500">Edit salary structures</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('hr-analytics')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Analytics & CSV Reports</p>
                  <p className="text-[10px] text-slate-500">Export employee & attendance records</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
