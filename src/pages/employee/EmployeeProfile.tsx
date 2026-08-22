import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateEmployeeProfile } from '../../services/storage';
import { User, Phone, MapPin, Mail, Briefcase, FileText, Check, Edit3, Save } from 'lucide-react';

export const EmployeeProfile: React.FC = () => {
  const { currentEmployee } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(currentEmployee?.phone || '');
  const [address, setAddress] = useState(currentEmployee?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(currentEmployee?.avatarUrl || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!currentEmployee) return null;

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSave = () => {
    try {
      updateEmployeeProfile(
        currentEmployee.employeeId,
        { phone, address, avatarUrl },
        currentEmployee.employeeId,
        `${currentEmployee.firstName} ${currentEmployee.lastName}`
      );
      setIsEditing(false);
      setSuccessMessage('Profile information updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <img
            src={avatarUrl || currentEmployee.avatarUrl}
            alt={currentEmployee.firstName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-600 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">
                {currentEmployee.firstName} {currentEmployee.lastName}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {currentEmployee.status}
              </span>
            </div>
            <p className="text-xs font-semibold text-indigo-600 mt-0.5">{currentEmployee.designation}</p>
            <p className="text-xs text-slate-500 mt-1">
              {currentEmployee.department} • Employee ID: <span className="font-mono font-bold text-slate-700">{currentEmployee.employeeId}</span>
            </p>
          </div>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-2 transition-colors shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Allowed Details</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-2 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Profile Avatar Selection in Edit Mode */}
      {isEditing && (
        <div className="bg-indigo-50/70 border border-indigo-100 p-5 rounded-2xl space-y-3">
          <p className="text-xs font-bold text-indigo-900">Choose Profile Picture Avatar</p>
          <div className="flex items-center space-x-3">
            {sampleAvatars.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="Avatar option"
                onClick={() => setAvatarUrl(url)}
                className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                  avatarUrl === url ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal & Contact Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Personal & Contact Information</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Work Email (Read-only)</label>
              <div className="flex items-center space-x-2 mt-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{currentEmployee.email}</span>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              ) : (
                <div className="flex items-center space-x-2 mt-1 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-900 font-medium">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{currentEmployee.phone}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Residential Address</label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              ) : (
                <div className="flex items-start space-x-2 mt-1 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-900 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span>{currentEmployee.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employment & Manager Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Employment Record (HR Admin Managed)</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Department</p>
              <p className="font-bold text-slate-900 mt-0.5">{currentEmployee.department}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Designation</p>
              <p className="font-bold text-slate-900 mt-0.5">{currentEmployee.designation}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Joining Date</p>
              <p className="font-bold text-slate-900 mt-0.5">{currentEmployee.joiningDate}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Reporting Manager</p>
              <p className="font-bold text-slate-900 mt-0.5">{currentEmployee.managerName || 'Executive Lead'}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Emergency Contact</h4>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs flex justify-between">
              <div>
                <p className="font-bold text-slate-900">{currentEmployee.emergencyContact.name}</p>
                <p className="text-slate-500 text-[11px]">{currentEmployee.emergencyContact.relation}</p>
              </div>
              <span className="font-mono text-slate-700 font-medium">{currentEmployee.emergencyContact.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Repository */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Employee Documents & Contracts</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {currentEmployee.documents.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No official documents uploaded yet.</p>
          ) : (
            currentEmployee.documents.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
                    {doc.type}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                    <p className="text-[10px] text-slate-400">Uploaded {doc.dateUploaded} • {doc.size}</p>
                  </div>
                </div>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert(`Downloading document: ${doc.name}`); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Download File
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
