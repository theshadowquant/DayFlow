import React, { useState, useEffect } from 'react';
import { getActivityLogs, resetToSeedData, subscribeToDataChanges, isFirebaseConfigured } from '../../services/storage';
import type { ActivityLog } from '../../types';
import { RefreshCw, Activity, CheckCircle2, Clock, Cloud } from 'lucide-react';

export const HRSettings: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [resetSuccess, setResetSuccess] = useState(false);

  const fetchLogs = () => {
    setLogs(getActivityLogs());
  };

  useEffect(() => {
    fetchLogs();
    const unsubscribe = subscribeToDataChanges(fetchLogs);
    return () => unsubscribe();
  }, []);

  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all Dayflow data back to default demo seed data?')) {
      await resetToSeedData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Administrative HR Controls & Audit Logs</h3>
          <p className="text-xs text-slate-500">Configure organization policies and inspect system activity streams</p>
        </div>

        {/* Firebase Status Badge */}
        <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
          isFirebaseConfigured 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          <Cloud className="w-4 h-4" />
          <span>{isFirebaseConfigured ? 'Firebase Firestore Connected' : 'Local Persistence (No Firebase Env)'}</span>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System state reset to clean demo seed data and synced successfully.</span>
        </div>
      )}

      {/* Policy Setup Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Attendance & Shift Policies</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Standard Workday Start</p>
                <p className="text-[10px] text-slate-500">Normal check-in expected time</p>
              </div>
              <span className="font-mono font-bold text-purple-900 text-sm">09:00 AM</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Late Arrival Threshold</p>
                <p className="text-[10px] text-slate-500">Check-ins past this time flagged as Late</p>
              </div>
              <span className="font-mono font-bold text-amber-800 text-sm">09:30 AM</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-purple-600" />
            <span>Demo Data Maintenance</span>
          </h4>

          <p className="text-xs text-slate-600 leading-relaxed">
            Resetting seed data reinstates all original employees (Alex Morgan, Sarah Jenkins, etc.), sample leave requests, attendance logs, and salary structures.
          </p>

          <button
            onClick={handleResetData}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Seed Data</span>
          </button>
        </div>
      </div>

      {/* Audit Activity Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">System Audit Trail</h3>
            <p className="text-xs text-slate-500">Immutable log of leave approvals, profile changes, and attendance events</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">{logs.length} Total Events</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No activity events recorded.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start space-x-3 text-xs">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">{log.actorName} <span className="text-slate-400 font-normal">({log.actorId})</span></p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 font-semibold mt-0.5">{log.action} • <span className="text-purple-700">{log.entity}</span></p>
                  <p className="text-slate-500 mt-0.5">{log.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
