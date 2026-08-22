import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getLeaveRequests, approveLeaveRequest, rejectLeaveRequest, 
  getEmployeeById, subscribeToDataChanges 
} from '../../services/storage';
import type { LeaveRequest, LeaveStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { CheckCircle2, XCircle, AlertCircle, MessageSquare } from 'lucide-react';

export const HRLeaveApprovalQueue: React.FC = () => {
  const { currentEmployee } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('Pending');

  // Action Modals
  const [approveTarget, setApproveTarget] = useState<LeaveRequest | null>(null);
  const [approveComment, setApproveComment] = useState('Approved by HR Manager');

  const [rejectTarget, setRejectTarget] = useState<LeaveRequest | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const fetchRequests = () => {
    setRequests(getLeaveRequests());
  };

  useEffect(() => {
    fetchRequests();
    const unsubscribe = subscribeToDataChanges(fetchRequests);
    return () => unsubscribe();
  }, []);

  const filteredRequests = requests.filter(r => 
    statusFilter === 'ALL' || r.status === statusFilter
  );

  const handleApproveConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveTarget || !currentEmployee) return;

    try {
      approveLeaveRequest(approveTarget.id, currentEmployee.employeeId, approveComment);
      setApproveTarget(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setRejectError(null);

    if (!rejectComment.trim()) {
      setRejectError('Please state a reason for declining this request.');
      return;
    }

    if (!rejectTarget || !currentEmployee) return;

    try {
      rejectLeaveRequest(rejectTarget.id, currentEmployee.employeeId, rejectComment);
      setRejectTarget(null);
      setRejectComment('');
    } catch (err: any) {
      setRejectError(err.message || 'Failed to reject request.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Leave Approval Desk</h3>
          <p className="text-xs text-slate-500">Review employee leave applications and manage schedule blockouts</p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {(['Pending', 'Approved', 'Rejected', 'ALL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Requests' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-80" />
            <p className="font-bold text-slate-800 text-base">No leave requests found</p>
            <p className="text-xs text-slate-400 mt-1">There are no {statusFilter.toLowerCase()} leave requests in queue.</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const applicant = getEmployeeById(req.employeeId);
            const remainingPaid = applicant ? applicant.leaveBalance.paid - applicant.leaveBalance.paidUsed : 0;
            const remainingSick = applicant ? applicant.leaveBalance.sick - applicant.leaveBalance.sickUsed : 0;

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-purple-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <img
                      src={applicant?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={req.employeeName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-sm">{req.employeeName}</h4>
                        <span className="text-xs text-slate-400">({req.employeeId})</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{req.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <StatusBadge status={req.status} />
                    <span className="text-[11px] text-slate-400">Submitted {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Request Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">LEAVE CATEGORY</p>
                    <p className="font-bold text-indigo-900 mt-0.5">{req.leaveType} Leave</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">SCHEDULE DATES</p>
                    <p className="font-bold text-slate-900 mt-0.5">{req.startDate} to {req.endDate}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{req.durationDays} Work Day(s)</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">APPLICANT LEAVE QUOTA</p>
                    <p className="text-slate-700 mt-0.5">
                      <span className="font-bold text-emerald-700">{remainingPaid}d Paid</span> • <span className="font-bold text-amber-700">{remainingSick}d Sick</span> remaining
                    </p>
                  </div>
                </div>

                {/* Remarks & Reviewer Note */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2 text-slate-700">
                    <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <p><strong className="font-semibold text-slate-900">Applicant Remark:</strong> "{req.remarks}"</p>
                  </div>

                  {req.reviewerComment && (
                    <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-950 font-medium">
                      <strong>HR Decision Comment ({req.reviewerName}):</strong> {req.reviewerComment}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {req.status === 'Pending' && (
                  <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setRejectTarget(req);
                        setRejectComment('');
                        setRejectError(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold transition-colors flex items-center space-x-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline Request</span>
                    </button>
                    <button
                      onClick={() => {
                        setApproveTarget(req);
                        setApproveComment('Approved by HR Manager');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Request</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* APPROVE MODAL */}
      {approveTarget && (
        <Modal
          isOpen={!!approveTarget}
          onClose={() => setApproveTarget(null)}
          title={`Approve Leave: ${approveTarget.employeeName}`}
          subtitle={`${approveTarget.leaveType} Leave (${approveTarget.startDate} to ${approveTarget.endDate})`}
        >
          <form onSubmit={handleApproveConfirm} className="space-y-4">
            <p className="text-xs text-slate-600">
              Approving this request will deduct <strong className="text-slate-900">{approveTarget.durationDays} day(s)</strong> from {approveTarget.employeeName}'s leave quota and automatically generate <strong className="text-indigo-900 font-mono font-semibold">LEAVE</strong> attendance entries on all selected dates.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Approval Note (Optional)</label>
              <textarea
                rows={2}
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Confirm Approval
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* REJECT MODAL */}
      {rejectTarget && (
        <Modal
          isOpen={!!rejectTarget}
          onClose={() => setRejectTarget(null)}
          title={`Decline Leave: ${rejectTarget.employeeName}`}
        >
          <form onSubmit={handleRejectConfirm} className="space-y-4">
            {rejectError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rejectError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Rejection (Required)</label>
              <textarea
                rows={3}
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                required
                placeholder="State why this leave request is being declined..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Decline
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
