import React from 'react';
import { Modal } from '../common/Modal';
import type { Employee, PaySlip, SalaryStructure } from '../../types';
import { Printer, CheckCircle2 } from 'lucide-react';

interface PaySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  paySlip: PaySlip;
  salaryStructure: SalaryStructure;
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({
  isOpen,
  onClose,
  employee,
  paySlip,
  salaryStructure,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Salary Slip - ${paySlip.monthYear}`} maxWidth="2xl">
      <div className="space-y-6">
        {/* Printable Area */}
        <div id="printable-payslip" className="bg-white p-6 rounded-xl border border-slate-200 text-slate-800 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Dayflow Technologies Inc.</h2>
                <p className="text-xs text-slate-500">100 Enterprise Way, Suite 400, San Francisco, CA</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PAYMENT COMPLETED</span>
              </span>
              <p className="text-xs text-slate-500 mt-1">Issued: {paySlip.issueDate}</p>
            </div>
          </div>

          {/* Employee & Pay Period Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs">
            <div>
              <p className="text-slate-400 font-medium">EMPLOYEE NAME</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.firstName} {employee.lastName}</p>
              <p className="text-slate-600 mt-1"><span className="font-medium">ID:</span> {employee.employeeId}</p>
              <p className="text-slate-600"><span className="font-medium">Role:</span> {employee.designation}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">PAYMENT DETAILS</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{paySlip.monthYear}</p>
              <p className="text-slate-600 mt-1"><span className="font-medium">Department:</span> {employee.department}</p>
              <p className="text-slate-600"><span className="font-medium">Joining Date:</span> {employee.joiningDate}</p>
            </div>
          </div>

          {/* Earnings vs Deductions Breakdown */}
          <div className="grid grid-cols-2 gap-6">
            {/* Earnings Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-200">
                Earnings
              </h4>
              <div className="space-y-2 mt-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Basic Pay</span>
                  <span className="font-semibold text-slate-900">${salaryStructure.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">House Rent Allowance (HRA)</span>
                  <span className="font-semibold text-slate-900">${salaryStructure.hra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Special Allowance</span>
                  <span className="font-semibold text-slate-900">${salaryStructure.specialAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Medical Allowance</span>
                  <span className="font-semibold text-slate-900">${salaryStructure.medicalAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-xs font-bold text-slate-900 pt-3">
                  <span>Gross Earnings</span>
                  <span className="text-indigo-600">
                    ${(salaryStructure.baseSalary + salaryStructure.hra + salaryStructure.specialAllowance + salaryStructure.medicalAllowance).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-200">
                Deductions
              </h4>
              <div className="space-y-2 mt-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Provident Fund (PF)</span>
                  <span className="font-semibold text-slate-900">${salaryStructure.pfDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Income Tax (TDS)</span>
                  <span className="font-semibold text-slate-900">${salaryStructure.taxDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-xs font-bold text-slate-900 pt-7">
                  <span>Total Deductions</span>
                  <span className="text-rose-600">
                    ${(salaryStructure.pfDeduction + salaryStructure.taxDeduction).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Total Bar */}
          <div className="bg-indigo-900 text-white p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">NET TAKE-HOME SALARY</p>
              <p className="text-2xl font-extrabold tracking-tight">${paySlip.netPay.toLocaleString()}</p>
            </div>
            <p className="text-xs text-indigo-200 font-medium">Direct Deposit to Bank Account</p>
          </div>

          <p className="text-[10px] text-center text-slate-400 font-medium">
            This document is a computer-generated salary slip and requires no physical signature.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pay Slip</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
