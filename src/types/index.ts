export type Role = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: Role;
  isVerified: boolean;
  createdAt: string;
}

export type EmploymentStatus = 'Active' | 'On Leave' | 'Terminated' | 'Probation';

export type Department = 
  | 'Engineering' 
  | 'Product Management' 
  | 'UI/UX Design' 
  | 'Human Resources' 
  | 'Sales & Marketing' 
  | 'Finance & Operations';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  dateUploaded: string;
  size: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  designation: string;
  department: Department;
  joiningDate: string;
  status: EmploymentStatus;
  avatarUrl: string;
  managerId: string | null;
  managerName?: string;
  address: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  documents: DocumentItem[];
  leaveBalance: {
    paid: number;
    paidUsed: number;
    sick: number;
    sickUsed: number;
    unpaid: number;
    unpaidUsed: number;
  };
}

export type AttendanceStatus = 
  | 'NOT_CHECKED_IN' 
  | 'CHECKED_IN' 
  | 'CHECKED_OUT' 
  | 'ABSENT' 
  | 'HALF_DAY' 
  | 'LEAVE';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:mm format
  checkOut: string | null; // HH:mm format
  durationMinutes: number;
  status: AttendanceStatus;
  notes?: string;
  isLate?: boolean;
}

export type LeaveType = 'Paid' | 'Sick' | 'Unpaid';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  durationDays: number;
  remarks: string;
  status: LeaveStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewerComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryStructure {
  baseSalary: number;
  hra: number;
  specialAllowance: number;
  medicalAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  netSalary: number;
  currency: string;
}

export interface PaySlip {
  id: string;
  employeeId: string;
  monthYear: string;
  issueDate: string;
  basicPay: number;
  hra: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: 'Paid' | 'Processing';
}

export interface EmployeePayroll {
  id: string;
  employeeId: string;
  salaryStructure: SalaryStructure;
  paySlips: PaySlip[];
}

export type NotificationType = 
  | 'LEAVE_SUBMITTED' 
  | 'LEAVE_APPROVED' 
  | 'LEAVE_REJECTED' 
  | 'ATTENDANCE_ALERT' 
  | 'PAYROLL_UPDATE' 
  | 'PROFILE_UPDATE';

export interface Notification {
  id: string;
  recipientId: string; // 'ALL' or specific employeeId
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  targetTab?: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
}
