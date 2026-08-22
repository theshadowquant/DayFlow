import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getEmployees, getPayrolls, updateSalaryStructure, 
  subscribeToDataChanges 
} from '../../services/storage';
import type { EmployeePayroll as PayrollType, Employee } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Edit3, Sparkles } from 'lucide-react';

export const HRPayrollManager: React.FC = () => {
  const { currentEmployee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollType[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Edit Structure Modal
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [baseSalary, setBaseSalary] = useState(10000);
  const [hra, setHra] = useState(3000);
  const [specialAllowance, setSpecialAllowance] = useState(1500);
  const [medicalAllowance, setMedicalAllowance] = useState(400);
  const [pfDeduction, setPfDeduction] = useState(1200);
  const [taxDeduction, setTaxDeduction] = useState(1700);

  const fetchPayrollData = () => {
    setEmployees(getEmployees());
    setPayrolls(getPayrolls());
  };

  useEffect(() => {
    fetchPayrollData();
    const unsubscribe = subscribeToDataChanges(fetchPayrollData);
    return () => unsubscribe();
  }, []);

  const totalMonthlyPayroll = payrolls.reduce((acc, p) => acc + (p.salaryStructure?.netSalary || 0), 0);

  const filteredEmployees = employees.filter(emp => 
    departmentFilter === 'ALL' || emp.department === departmentFilter
  );

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    const existing = payrolls.find(p => p.employeeId === emp.employeeId)?.salaryStructure;
    if (existing) {
      setBaseSalary(existing.baseSalary);
      setHra(existing.hra);
      setSpecialAllowance(existing.specialAllowance);
      setMedicalAllowance(existing.medicalAllowance);
      setPfDeduction(existing.pfDeduction);
      setTaxDeduction(existing.taxDeduction);
    } else {
      setBaseSalary(8000);
      setHra(2400);
      setSpecialAllowance(1000);
      setMedicalAllowance(400);
      setPfDeduction(960);
      setTaxDeduction(1040);
    }
  };

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp || !currentEmployee) return;

    updateSalaryStructure(
      editingEmp.employeeId,
      {
        baseSalary: Number(baseSalary),
        hra: Number(hra),
        specialAllowance: Number(specialAllowance),
        medicalAllowance: Number(medicalAllowance),
        pfDeduction: Number(pfDeduction),
        taxDeduction: Number(taxDeduction),
        currency: 'USD',
      },
      currentEmployee.employeeId,
      `${currentEmployee.firstName} ${currentEmployee.lastName}`
    );

    setEditingEmp(null);
  };

  const computedGross = Number(baseSalary) + Number(hra) + Number(specialAllowance) + Number(medicalAllowance);
  const computedDeductions = Number(pfDeduction) + Number(taxDeduction);
  const computedNet = Math.max(0, computedGross - computedDeductions);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between border border-slate-800">
        <div>
          <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">MONTHLY PAYROLL COMMITMENT</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">
            ${totalMonthlyPayroll.toLocaleString()} <span className="text-sm font-normal text-slate-300">/ month</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Total active staff compensated: {employees.length} Employees
          </p>
        </div>

        <button
          onClick={() => alert('Batch direct-deposit payroll execution initiated successfully!')}
          className="mt-4 md:mt-0 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold shadow-md shadow-sky-500/20 transition-all flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Execute Direct Deposit Batch</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product Management">Product Management</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Sales & Marketing">Sales & Marketing</option>
            <option value="Finance & Operations">Finance & Operations</option>
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Basic Pay</th>
                <th className="py-3.5 px-6">Allowances</th>
                <th className="py-3.5 px-6">Deductions</th>
                <th className="py-3.5 px-6">Net Take-Home</th>
                <th className="py-3.5 px-6 text-right">Structure Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.map((emp) => {
                const pr = payrolls.find(p => p.employeeId === emp.employeeId);
                const st = pr?.salaryStructure || { baseSalary: 8000, hra: 2400, specialAllowance: 1000, medicalAllowance: 400, pfDeduction: 960, taxDeduction: 1040, netSalary: 9800 };
                const allowances = st.hra + st.specialAllowance + st.medicalAllowance;
                const deductions = st.pfDeduction + st.taxDeduction;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={emp.avatarUrl}
                          alt={emp.firstName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{emp.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">{emp.department}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">${st.baseSalary.toLocaleString()}</td>
                    <td className="py-3.5 px-6 font-medium text-emerald-700">+${allowances.toLocaleString()}</td>
                    <td className="py-3.5 px-6 font-medium text-rose-600">-${deductions.toLocaleString()}</td>
                    <td className="py-3.5 px-6 font-extrabold text-indigo-900">${st.netSalary.toLocaleString()}</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] flex items-center space-x-1 ml-auto transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Revise Structure</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT SALARY STRUCTURE MODAL */}
      {editingEmp && (
        <Modal
          isOpen={!!editingEmp}
          onClose={() => setEditingEmp(null)}
          title={`Salary Structure: ${editingEmp.firstName} ${editingEmp.lastName}`}
          subtitle={`Employee ID #${editingEmp.employeeId}`}
          maxWidth="xl"
        >
          <form onSubmit={handleSaveSalary} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Earnings Inputs */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200">
                  Earnings Components ($)
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Basic Salary</label>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    required
                    className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">House Rent Allowance (HRA)</label>
                  <input
                    type="number"
                    value={hra}
                    onChange={(e) => setHra(Number(e.target.value))}
                    required
                    className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Special Allowance</label>
                  <input
                    type="number"
                    value={specialAllowance}
                    onChange={(e) => setSpecialAllowance(Number(e.target.value))}
                    required
                    className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Medical Allowance</label>
                  <input
                    type="number"
                    value={medicalAllowance}
                    onChange={(e) => setMedicalAllowance(Number(e.target.value))}
                    required
                    className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Deductions Inputs */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200">
                  Deductions ($)
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Provident Fund (PF)</label>
                  <input
                    type="number"
                    value={pfDeduction}
                    onChange={(e) => setPfDeduction(Number(e.target.value))}
                    required
                    className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Income Tax (TDS)</label>
                  <input
                    type="number"
                    value={taxDeduction}
                    onChange={(e) => setTaxDeduction(Number(e.target.value))}
                    required
                    className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Computed Net Pay Bar */}
            <div className="p-4 rounded-xl bg-indigo-900 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] text-indigo-300 font-bold uppercase">RECALCULATED NET SALARY</p>
                <p className="text-xl font-extrabold tracking-tight">${computedNet.toLocaleString()}</p>
              </div>
              <p className="text-xs text-indigo-200 font-medium">Gross: ${computedGross.toLocaleString()} • Deductions: ${computedDeductions.toLocaleString()}</p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingEmp(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
              >
                Save Compensation Structure
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
