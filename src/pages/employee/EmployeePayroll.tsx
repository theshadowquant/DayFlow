import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPayrolls, subscribeToDataChanges } from '../../services/storage';
import type { EmployeePayroll as PayrollType, PaySlip } from '../../types';
import { PaySlipModal } from '../../components/payroll/PaySlipModal';
import { ShieldCheck, Printer } from 'lucide-react';

export const EmployeePayroll: React.FC = () => {
  const { currentEmployee } = useAuth();
  const [payroll, setPayroll] = useState<PayrollType | undefined>(undefined);
  const [selectedPaySlip, setSelectedPaySlip] = useState<PaySlip | null>(null);

  const fetchPayroll = () => {
    if (!currentEmployee) return;
    const all = getPayrolls();
    const myPayroll = all.find(p => p.employeeId === currentEmployee.employeeId);
    setPayroll(myPayroll);
  };

  useEffect(() => {
    fetchPayroll();
    const unsubscribe = subscribeToDataChanges(fetchPayroll);
    return () => unsubscribe();
  }, [currentEmployee]);

  if (!currentEmployee || !payroll) return null;

  const struct = payroll.salaryStructure;
  const grossSalary = struct.baseSalary + struct.hra + struct.specialAllowance + struct.medicalAllowance;
  const totalDeductions = struct.pfDeduction + struct.taxDeduction;

  return (
    <div className="space-y-6">
      {/* Salary Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between border border-slate-800">
        <div>
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">COMPENSATION & SALARY STRUCTURE</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">
            ${struct.netSalary.toLocaleString()} <span className="text-sm font-normal text-slate-300">/ month</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Gross Earnings: ${grossSalary.toLocaleString()} • Deductions: ${totalDeductions.toLocaleString()}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-indigo-500/20 px-4 py-2 rounded-xl border border-indigo-500/30 text-indigo-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Direct Deposit Active</span>
        </div>
      </div>

      {/* Salary Component Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earnings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Earnings Structure</span>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Monthly</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Base Salary</span>
              <span className="font-bold text-slate-900">${struct.baseSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">House Rent Allowance (HRA)</span>
              <span className="font-bold text-slate-900">${struct.hra.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Special Allowance</span>
              <span className="font-bold text-slate-900">${struct.specialAllowance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Medical Allowance</span>
              <span className="font-bold text-slate-900">${struct.medicalAllowance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-extrabold text-indigo-900 pt-2">
              <span>Total Gross Monthly Earnings</span>
              <span>${grossSalary.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Statutory & Tax Deductions</span>
            <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded">Withheld</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Provident Fund (PF)</span>
              <span className="font-bold text-slate-900">${struct.pfDeduction.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Income Tax (TDS)</span>
              <span className="font-bold text-slate-900">${struct.taxDeduction.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-extrabold text-rose-700 pt-10">
              <span>Total Monthly Deductions</span>
              <span>${totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Slips History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Historical Salary Slips</h3>
          <p className="text-xs text-slate-500">View and print official monthly pay statements</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Pay Period</th>
                <th className="py-3 px-6">Issue Date</th>
                <th className="py-3 px-6">Gross Pay</th>
                <th className="py-3 px-6">Deductions</th>
                <th className="py-3 px-6">Net Salary</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {payroll.paySlips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No historical salary slips generated yet.
                  </td>
                </tr>
              ) : (
                payroll.paySlips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">{slip.monthYear}</td>
                    <td className="py-3.5 px-6 font-medium text-slate-700">{slip.issueDate}</td>
                    <td className="py-3.5 px-6 font-medium text-slate-900">${(slip.basicPay + slip.hra + slip.allowances).toLocaleString()}</td>
                    <td className="py-3.5 px-6 font-medium text-rose-600">${slip.deductions.toLocaleString()}</td>
                    <td className="py-3.5 px-6 font-extrabold text-indigo-900">${slip.netPay.toLocaleString()}</td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {slip.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedPaySlip(slip)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View Statement</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PaySlip Modal */}
      {selectedPaySlip && (
        <PaySlipModal
          isOpen={!!selectedPaySlip}
          onClose={() => setSelectedPaySlip(null)}
          employee={currentEmployee}
          paySlip={selectedPaySlip}
          salaryStructure={struct}
        />
      )}
    </div>
  );
};
