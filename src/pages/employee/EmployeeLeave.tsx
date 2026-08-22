import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLeaveRequests, submitLeaveRequest, subscribeToDataChanges } from '../../services/storage';
import type { LeaveRequest, LeaveType } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Calendar, Plus, AlertCircle } from 'lucide-react';

export const EmployeeLeave: React.FC = () => {
  const { currentEmployee } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('Paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = () => {
    if (!currentEmployee) return;
    const all = getLeaveRequests();
    setRequests(all.filter(l => l.employeeId === currentEmployee.employeeId));
  };

  useEffect(() => {
    fetchLeaves();
    const unsubscribe = subscribeToDataChanges(fetchLeaves);
    return () => unsubscribe();
  }, [currentEmployee]);

  if (!currentEmployee) return null;

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) return 0;
    const diff = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const durationDays = calculateDays();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError('Please select both start date and end date.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    if (!remarks.trim()) {
      setError('Please provide a brief reason/remark for your request.');
      return;
    }

    setSubmitting(true);
    try {
      submitLeaveRequest(
        currentEmployee.employeeId,
        leaveType,
        startDate,
        endDate,
        remarks
      );
      setIsModalOpen(false);
      setStartDate('');
      setEndDate('');
      setRemarks('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const balances = currentEmployee.leaveBalance;

  return (
    <div className="space-y-6">
      {/* Top Header & Apply Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Leave Management Hub</h3>
          <p className="text-xs text-slate-500">Track your available leave quotas and submit time-off requests</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Quotas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Leave</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{balances.paid - balances.paidUsed} Days</span>
            <span className="text-xs font-medium text-slate-500">of {balances.paid} Days</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${((balances.paid - balances.paidUsed) / balances.paid) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sick Leave</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{balances.sick - balances.sickUsed} Days</span>
            <span className="text-xs font-medium text-slate-500">of {balances.sick} Days</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${((balances.sick - balances.sickUsed) / balances.sick) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unpaid Leave</span>
            <span className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{balances.unpaid - balances.unpaidUsed} Days</span>
            <span className="text-xs font-medium text-slate-500">of {balances.unpaid} Days</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-slate-400 h-full rounded-full"
              style={{ width: `${((balances.unpaid - balances.unpaidUsed) / balances.unpaid) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Submitted Leave Requests</h3>
          <p className="text-xs text-slate-500">Track approval status and reviewer notes</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Leave Type</th>
                <th className="py-3 px-6">Date Range</th>
                <th className="py-3 px-6">Duration</th>
                <th className="py-3 px-6">Reason / Remarks</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Reviewer Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No leave requests submitted yet.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{req.leaveType} Leave</td>
                    <td className="py-3.5 px-6 font-medium text-slate-700">{req.startDate} to {req.endDate}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">{req.durationDays} day(s)</td>
                    <td className="py-3.5 px-6 text-slate-600 max-w-xs truncate">{req.remarks}</td>
                    <td className="py-3.5 px-6">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {req.reviewerComment ? (
                        <span><strong className="text-slate-700">{req.reviewerName}:</strong> {req.reviewerComment}</span>
                      ) : (
                        <span className="italic text-slate-400">Pending review</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Time-Off / Leave">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Leave Category</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Paid', 'Sick', 'Unpaid'] as LeaveType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLeaveType(type)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                    leaveType === type
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type} Leave
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {durationDays > 0 && (
            <div className="p-3 rounded-lg bg-indigo-50/80 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
              <span className="font-medium">Total Duration Computed:</span>
              <span className="font-bold">{durationDays} Work Day(s)</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Reason</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
              placeholder="State the reason for your time-off request..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
