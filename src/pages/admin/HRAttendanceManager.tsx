import React, { useState, useEffect } from 'react';
import { getEmployees, getAttendance, subscribeToDataChanges, getTodayDateString } from '../../services/storage';
import type { AttendanceRecord, Employee, AttendanceStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Calendar, Search, Edit2 } from 'lucide-react';

export const HRAttendanceManager: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Override Modal
  const [overrideEmp, setOverrideEmp] = useState<Employee | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<AttendanceStatus>('CHECKED_IN');
  const [overrideCheckIn, setOverrideCheckIn] = useState('09:00');
  const [overrideCheckOut, setOverrideCheckOut] = useState('18:00');
  const [overrideNotes, setOverrideNotes] = useState('');

  const refreshAttendanceData = () => {
    setEmployees(getEmployees());
    setAttendanceRecords(getAttendance());
  };

  useEffect(() => {
    refreshAttendanceData();
    const unsubscribe = subscribeToDataChanges(refreshAttendanceData);
    return () => unsubscribe();
  }, []);

  const dateRecords = attendanceRecords.filter(a => a.date === selectedDate);

  const displayList = employees.map(emp => {
    const att = dateRecords.find(a => a.employeeId === emp.employeeId);
    return {
      employee: emp,
      attendance: att || {
        id: `att-none-${emp.employeeId}`,
        employeeId: emp.employeeId,
        date: selectedDate,
        checkIn: null,
        checkOut: null,
        durationMinutes: 0,
        status: 'NOT_CHECKED_IN' as AttendanceStatus,
        notes: '',
      }
    };
  }).filter(item => {
    const q = search.toLowerCase();
    const matchesSearch = 
      item.employee.firstName.toLowerCase().includes(q) ||
      item.employee.lastName.toLowerCase().includes(q) ||
      item.employee.employeeId.toLowerCase().includes(q) ||
      item.employee.department.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || item.attendance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenOverride = (emp: Employee, att: AttendanceRecord) => {
    setOverrideEmp(emp);
    setOverrideStatus(att.status === 'NOT_CHECKED_IN' ? 'CHECKED_IN' : att.status);
    setOverrideCheckIn(att.checkIn || '09:00');
    setOverrideCheckOut(att.checkOut || '18:00');
    setOverrideNotes(att.notes || 'HR Administrative Override');
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideEmp) return;

    const allAtt = getAttendance();
    const index = allAtt.findIndex(a => a.employeeId === overrideEmp.employeeId && a.date === selectedDate);

    const [inH, inM] = overrideCheckIn.split(':').map(Number);
    const [outH, outM] = overrideCheckOut.split(':').map(Number);
    const durationMinutes = (overrideCheckOut && overrideCheckIn) 
      ? Math.max(0, (outH * 60 + outM) - (inH * 60 + inM)) 
      : 0;

    const recordToSave: AttendanceRecord = {
      id: index > -1 ? allAtt[index].id : `att-ovr-${Date.now()}`,
      employeeId: overrideEmp.employeeId,
      date: selectedDate,
      checkIn: (overrideStatus === 'CHECKED_IN' || overrideStatus === 'CHECKED_OUT' || overrideStatus === 'HALF_DAY') ? overrideCheckIn : null,
      checkOut: (overrideStatus === 'CHECKED_OUT' || overrideStatus === 'HALF_DAY') ? overrideCheckOut : null,
      durationMinutes,
      status: overrideStatus,
      notes: overrideNotes,
    };

    if (index > -1) {
      allAtt[index] = recordToSave;
    } else {
      allAtt.unshift(recordToSave);
    }

    localStorage.setItem('dayflow_attendance', JSON.stringify(allAtt));
    refreshAttendanceData();
    setOverrideEmp(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Company Attendance Desk</h3>
          <p className="text-xs text-slate-500">Monitor employee check-ins, late arrivals, and execute HR overrides</p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <Calendar className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-slate-700">Select Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee or department..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="NOT_CHECKED_IN">Not Checked In</option>
            <option value="LEAVE">On Leave</option>
            <option value="ABSENT">Absent</option>
            <option value="HALF_DAY">Half Day</option>
          </select>
        </div>
      </div>

      {/* Attendance Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Check In</th>
                <th className="py-3.5 px-6">Check Out</th>
                <th className="py-3.5 px-6">Hours</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Notes</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No attendance records for {selectedDate}.
                  </td>
                </tr>
              ) : (
                displayList.map(({ employee, attendance }) => {
                  const hours = Math.round((attendance.durationMinutes / 60) * 10) / 10;
                  return (
                    <tr key={employee.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={employee.avatarUrl}
                            alt={employee.firstName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{employee.firstName} {employee.lastName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{employee.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-800">{employee.department}</td>
                      <td className="py-3.5 px-6 font-mono font-medium text-slate-700">
                        {attendance.checkIn || '--:--'}
                        {attendance.isLate && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Late
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-mono font-medium text-slate-700">{attendance.checkOut || '--:--'}</td>
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        {attendance.durationMinutes > 0 ? `${hours} hrs` : '--'}
                      </td>
                      <td className="py-3.5 px-6">
                        <StatusBadge status={attendance.status} />
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 max-w-xs truncate">{attendance.notes || '-'}</td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleOpenOverride(employee, attendance)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 font-bold transition-colors"
                          title="Override Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OVERRIDE MODAL */}
      {overrideEmp && (
        <Modal
          isOpen={!!overrideEmp}
          onClose={() => setOverrideEmp(null)}
          title={`Override Attendance: ${overrideEmp.firstName} ${overrideEmp.lastName}`}
          subtitle={`Date: ${selectedDate}`}
        >
          <form onSubmit={handleSaveOverride} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Override</label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value as AttendanceStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600"
              >
                <option value="CHECKED_IN">Checked In</option>
                <option value="CHECKED_OUT">Checked Out</option>
                <option value="LEAVE">On Leave</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half Day</option>
              </select>
            </div>

            {(overrideStatus === 'CHECKED_IN' || overrideStatus === 'CHECKED_OUT' || overrideStatus === 'HALF_DAY') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check In Time</label>
                  <input
                    type="time"
                    value={overrideCheckIn}
                    onChange={(e) => setOverrideCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check Out Time</label>
                  <input
                    type="time"
                    value={overrideCheckOut}
                    onChange={(e) => setOverrideCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">HR Override Note</label>
              <textarea
                rows={2}
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setOverrideEmp(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20"
              >
                Save Attendance Override
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
