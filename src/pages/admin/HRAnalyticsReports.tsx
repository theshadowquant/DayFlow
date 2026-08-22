import React, { useState, useEffect } from 'react';
import { getEmployees, getAttendance, getLeaveRequests, getPayrolls, subscribeToDataChanges } from '../../services/storage';
import type { Employee, AttendanceRecord, LeaveRequest, EmployeePayroll } from '../../types';
import { Download, PieChart, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

export const HRAnalyticsReports: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payrolls, setPayrolls] = useState<EmployeePayroll[]>([]);

  const fetchAll = () => {
    setEmployees(getEmployees());
    setAttendance(getAttendance());
    setLeaveRequests(getLeaveRequests());
    setPayrolls(getPayrolls());
  };

  useEffect(() => {
    fetchAll();
    const unsubscribe = subscribeToDataChanges(fetchAll);
    return () => unsubscribe();
  }, []);

  // Department distribution analytics
  const deptCounts: Record<string, number> = {};
  employees.forEach(e => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });

  // Leave types distribution analytics
  const leaveTypeCounts: Record<string, number> = { Paid: 0, Sick: 0, Unpaid: 0 };
  leaveRequests.forEach(l => {
    leaveTypeCounts[l.leaveType] = (leaveTypeCounts[l.leaveType] || 0) + 1;
  });

  // Attendance rate calculation
  const totalAtt = attendance.length;
  const presentAtt = attendance.filter(a => a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT').length;
  const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

  // Export CSV generator
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Joining Date', 'Status', 'Net Salary'];
    const rows = employees.map(e => {
      const pr = payrolls.find(p => p.employeeId === e.employeeId);
      const net = pr?.salaryStructure?.netSalary || 0;
      return [
        e.employeeId,
        `"${e.firstName} ${e.lastName}"`,
        e.email,
        `"${e.department}"`,
        `"${e.designation}"`,
        e.joiningDate,
        e.status,
        net
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dayflow_workforce_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Workforce Analytics & Reporting</h3>
          <p className="text-xs text-slate-500">Actionable HR insights, attendance metrics, and exportable datasets</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Workforce CSV Report</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Attendance Rate</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{attendanceRate}%</p>
          <p className="text-xs text-slate-500 font-medium">Based on logged employee check-ins vs workdays</p>
        </div>

        {/* Total Leave Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Leave Applications</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Calendar className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{leaveRequests.length} Applications</p>
          <p className="text-xs text-slate-500 font-medium">
            {leaveRequests.filter(l => l.status === 'Approved').length} Approved • {leaveRequests.filter(l => l.status === 'Pending').length} Pending
          </p>
        </div>

        {/* Total Payroll Budget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Salary Outflow</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            ${payrolls.reduce((acc, p) => acc + (p.salaryStructure?.netSalary || 0), 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 font-medium">Direct net compensation allocated</p>
        </div>
      </div>

      {/* Visual Distributions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Staff Distribution by Department</span>
          </h4>

          <div className="space-y-3">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / employees.length) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{dept}</span>
                    <span className="font-bold text-slate-900">{count} staff ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-indigo-600" />
            <span>Leave Requests by Category</span>
          </h4>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Paid Leave Applications</span>
              <span className="font-mono font-bold text-indigo-900 text-sm">{leaveTypeCounts.Paid}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Sick Leave Applications</span>
              <span className="font-mono font-bold text-amber-900 text-sm">{leaveTypeCounts.Sick}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Unpaid Leave Applications</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{leaveTypeCounts.Unpaid}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
