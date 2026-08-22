import React, { useState, useEffect } from 'react';
import { 
  getEmployees, addEmployee, subscribeToDataChanges 
} from '../../services/storage';
import type { Employee, Department, Role } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Drawer } from '../../components/common/Drawer';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, LayoutGrid, List, Mail, Phone, 
  Briefcase, UserPlus 
} from 'lucide-react';

export const EmployeeDirectory: React.FC = () => {
  const { currentEmployee, switchPersona } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Drawers
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // New Employee Form State
  const [newEmpId, setNewEmpId] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState<Department>('Engineering');
  const [newDesignation, setNewDesignation] = useState('');
  const [newRole, setNewRole] = useState<Role>('EMPLOYEE');
  const [newJoiningDate, setNewJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAddress, setNewAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchEmployees = () => {
    setEmployees(getEmployees());
  };

  useEffect(() => {
    fetchEmployees();
    const unsubscribe = subscribeToDataChanges(fetchEmployees);
    return () => unsubscribe();
  }, []);

  const filteredEmployees = employees.filter((emp: Employee) => {
    const query = search.toLowerCase();
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(query) ||
      emp.lastName.toLowerCase().includes(query) ||
      emp.employeeId.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.designation.toLowerCase().includes(query);

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newEmpId || !newFirstName || !newLastName || !newEmail || !newDesignation) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (employees.some(e => e.employeeId.toUpperCase() === newEmpId.trim().toUpperCase())) {
      setFormError('An employee with this Employee ID already exists.');
      return;
    }

    try {
      const actorId = currentEmployee?.employeeId || 'HR-ADMIN';
      const actorName = currentEmployee ? `${currentEmployee.firstName} ${currentEmployee.lastName}` : 'HR Admin';

      addEmployee(
        {
          employeeId: newEmpId.trim().toUpperCase(),
          firstName: newFirstName.trim(),
          lastName: newLastName.trim(),
          email: newEmail.trim().toLowerCase(),
          phone: newPhone || '+1 (555) 000-0000',
          role: newRole,
          designation: newDesignation.trim(),
          department: newDepartment,
          joiningDate: newJoiningDate,
          status: 'Active',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          managerId: null,
          address: newAddress || 'San Francisco, CA',
          emergencyContact: { name: 'Emergency Contact', relation: 'Family', phone: '+1 (555) 000-0000' },
        },
        actorId,
        actorName
      );

      setIsAddDrawerOpen(false);
      setNewEmpId('');
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPhone('');
      setNewDesignation('');
      setNewAddress('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to register employee.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Employee Directory</h3>
          <p className="text-xs text-slate-500">Manage workforce identity, department roles, and employee records</p>
        </div>

        <button
          onClick={() => {
            setNewEmpId(`EMP-${1000 + employees.length + 1}`);
            setIsAddDrawerOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, designation..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product Management">Product Management</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Sales & Marketing">Sales & Marketing</option>
            <option value="Finance & Operations">Finance & Operations</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Probation">Probation</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
              viewMode === 'table' ? 'bg-white text-purple-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
              viewMode === 'grid' ? 'bg-white text-purple-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      {/* Directory Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Role / Designation</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Joining Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No employee records match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp: Employee) => (
                    <tr
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className="hover:bg-purple-50/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.firstName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-[11px] text-slate-500">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-700">{emp.employeeId}</td>
                      <td className="py-3.5 px-6 font-medium text-slate-800">{emp.department}</td>
                      <td className="py-3.5 px-6 text-slate-700">{emp.designation}</td>
                      <td className="py-3.5 px-6">
                        <StatusBadge status={emp.status} />
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">{emp.joiningDate}</td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            switchPersona(emp.employeeId);
                          }}
                          className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] transition-colors"
                          title="Inspect as this employee"
                        >
                          View Persona
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp: Employee) => (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={emp.avatarUrl}
                    alt={emp.firstName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{emp.firstName} {emp.lastName}</h4>
                    <p className="text-xs font-semibold text-purple-700">{emp.designation}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.employeeId}</p>
                  </div>
                </div>
                <StatusBadge status={emp.status} size="sm" />
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <p className="flex items-center space-x-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.department}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.phone}</span>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px]">
                <span className="text-slate-400">Joined {emp.joiningDate}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    switchPersona(emp.employeeId);
                  }}
                  className="font-bold text-purple-600 hover:underline"
                >
                  Inspect Persona →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD EMPLOYEE DRAWER */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Register New Employee">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
            <input
              type="text"
              value={newEmpId}
              onChange={(e) => setNewEmpId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product Management">Product Management</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Finance & Operations">Finance & Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={newDesignation}
                onChange={(e) => setNewDesignation(e.target.value)}
                required
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">System Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">HR Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Joining Date</label>
              <input
                type="date"
                value={newJoiningDate}
                onChange={(e) => setNewJoiningDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
            <textarea
              rows={2}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Full address..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddDrawerOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20"
            >
              Register Employee
            </button>
          </div>
        </form>
      </Drawer>

      {/* EMPLOYEE INSPECTION DRAWER */}
      {selectedEmployee && (
        <Drawer
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          title={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
          subtitle={`Employee Record #${selectedEmployee.employeeId}`}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <img
                src={selectedEmployee.avatarUrl}
                alt={selectedEmployee.firstName}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedEmployee.firstName} {selectedEmployee.lastName}</h4>
                <p className="text-xs font-semibold text-purple-700">{selectedEmployee.designation}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedEmployee.department}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h5 className="font-bold text-slate-900 border-b border-slate-100 pb-1">Contact & Employment</h5>
              <p className="text-slate-600"><span className="font-semibold text-slate-800">Email:</span> {selectedEmployee.email}</p>
              <p className="text-slate-600"><span className="font-semibold text-slate-800">Phone:</span> {selectedEmployee.phone}</p>
              <p className="text-slate-600"><span className="font-semibold text-slate-800">Address:</span> {selectedEmployee.address}</p>
              <p className="text-slate-600"><span className="font-semibold text-slate-800">Joined:</span> {selectedEmployee.joiningDate}</p>
            </div>

            <div className="space-y-3 text-xs">
              <h5 className="font-bold text-slate-900 border-b border-slate-100 pb-1">Leave Balance Status</h5>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100">
                  <p className="font-bold text-sm">{selectedEmployee.leaveBalance.paid - selectedEmployee.leaveBalance.paidUsed}</p>
                  <p className="text-[10px]">Paid Available</p>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-100">
                  <p className="font-bold text-sm">{selectedEmployee.leaveBalance.sick - selectedEmployee.leaveBalance.sickUsed}</p>
                  <p className="text-[10px]">Sick Available</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                  <p className="font-bold text-sm">{selectedEmployee.leaveBalance.unpaid - selectedEmployee.leaveBalance.unpaidUsed}</p>
                  <p className="text-[10px]">Unpaid Available</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  switchPersona(selectedEmployee.employeeId);
                  setSelectedEmployee(null);
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20"
              >
                Switch to {selectedEmployee.firstName}'s View
              </button>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
