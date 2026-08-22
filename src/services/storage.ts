import type { 
  User, Employee, AttendanceRecord, LeaveRequest, EmployeePayroll, Notification, ActivityLog, 
  SalaryStructure, AttendanceStatus
} from '../types';
import { 
  INITIAL_USERS, INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, INITIAL_LEAVE_REQUESTS, 
  INITIAL_PAYROLLS, INITIAL_NOTIFICATIONS, INITIAL_ACTIVITY_LOGS, getTodayDateString 
} from './mockData';

export { getTodayDateString };

const KEYS = {
  USERS: 'dayflow_users',
  EMPLOYEES: 'dayflow_employees',
  ATTENDANCE: 'dayflow_attendance',
  LEAVE: 'dayflow_leave_requests',
  PAYROLL: 'dayflow_payrolls',
  NOTIFICATIONS: 'dayflow_notifications',
  ACTIVITY: 'dayflow_activity_logs',
};

const listeners: Array<() => void> = [];

export const subscribeToDataChanges = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

export const initStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.EMPLOYEES)) {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }
  if (!localStorage.getItem(KEYS.LEAVE)) {
    localStorage.setItem(KEYS.LEAVE, JSON.stringify(INITIAL_LEAVE_REQUESTS));
  }
  if (!localStorage.getItem(KEYS.PAYROLL)) {
    localStorage.setItem(KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLLS));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(KEYS.ACTIVITY)) {
    localStorage.setItem(KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  }
};

export const resetToSeedData = () => {
  localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(KEYS.LEAVE, JSON.stringify(INITIAL_LEAVE_REQUESTS));
  localStorage.setItem(KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLLS));
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  notifyListeners();
};

// Generic Helpers
const getItem = <T>(key: string): T[] => {
  initStorage();
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return [];
  }
};

const setItem = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
  notifyListeners();
};

// Data Readers
export const getUsers = (): User[] => getItem<User>(KEYS.USERS);
export const getEmployees = (): Employee[] => getItem<Employee>(KEYS.EMPLOYEES);
export const getAttendance = (): AttendanceRecord[] => getItem<AttendanceRecord>(KEYS.ATTENDANCE);
export const getLeaveRequests = (): LeaveRequest[] => getItem<LeaveRequest>(KEYS.LEAVE);
export const getPayrolls = (): EmployeePayroll[] => getItem<EmployeePayroll>(KEYS.PAYROLL);
export const getNotifications = (): Notification[] => getItem<Notification>(KEYS.NOTIFICATIONS);
export const getActivityLogs = (): ActivityLog[] => getItem<ActivityLog>(KEYS.ACTIVITY);

export const getEmployeeById = (idOrEmployeeId: string): Employee | undefined => {
  const employees = getEmployees();
  return employees.find(e => e.id === idOrEmployeeId || e.employeeId === idOrEmployeeId);
};

export const getTodayAttendanceForEmployee = (employeeId: string): AttendanceRecord | undefined => {
  const today = getTodayDateString();
  const records = getAttendance();
  return records.find(r => r.employeeId === employeeId && r.date === today);
};

// Activity logging helper
export const addActivityLog = (actorId: string, actorName: string, action: string, entity: string, details: string) => {
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorId,
    actorName,
    action,
    entity,
    details,
    timestamp: new Date().toISOString(),
  };
  setItem(KEYS.ACTIVITY, [newLog, ...logs]);
};

// Notification helper
export const addNotification = (
  recipientId: string,
  type: Notification['type'],
  title: string,
  message: string,
  targetTab?: string
) => {
  const notifs = getNotifications();
  const newNotif: Notification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipientId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    targetTab,
  };
  setItem(KEYS.NOTIFICATIONS, [newNotif, ...notifs]);
};

export const markNotificationAsRead = (notifId: string) => {
  const notifs = getNotifications();
  const updated = notifs.map(n => n.id === notifId ? { ...n, read: true } : n);
  setItem(KEYS.NOTIFICATIONS, updated);
};

export const markAllNotificationsAsRead = (recipientId: string) => {
  const notifs = getNotifications();
  const updated = notifs.map(n => 
    (n.recipientId === recipientId || n.recipientId === 'ALL') ? { ...n, read: true } : n
  );
  setItem(KEYS.NOTIFICATIONS, updated);
};

// State Machine: Attendance Operations
export const checkInEmployee = (employeeId: string, notes: string = ''): AttendanceRecord => {
  const today = getTodayDateString();
  const records = getAttendance();
  const now = new Date();
  const timeStr = now.toTimeString().substring(0, 5); // HH:mm
  const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);

  const existingIndex = records.findIndex(r => r.employeeId === employeeId && r.date === today);
  const employee = getEmployeeById(employeeId);
  const empName = employee ? `${employee.firstName} ${employee.lastName}` : employeeId;

  let updatedRecord: AttendanceRecord;

  if (existingIndex > -1) {
    updatedRecord = {
      ...records[existingIndex],
      checkIn: timeStr,
      status: 'CHECKED_IN',
      isLate,
      notes: notes || records[existingIndex].notes || 'Punctual Check-in',
    };
    records[existingIndex] = updatedRecord;
  } else {
    updatedRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      date: today,
      checkIn: timeStr,
      checkOut: null,
      durationMinutes: 0,
      status: 'CHECKED_IN',
      notes: notes || 'Standard Check-in',
      isLate,
    };
    records.unshift(updatedRecord);
  }

  setItem(KEYS.ATTENDANCE, records);
  addActivityLog(employeeId, empName, 'CHECK_IN', 'Attendance', `Checked in at ${timeStr}`);
  return updatedRecord;
};

export const checkOutEmployee = (employeeId: string, notes: string = ''): AttendanceRecord => {
  const today = getTodayDateString();
  const records = getAttendance();
  const now = new Date();
  const timeStr = now.toTimeString().substring(0, 5);

  const existingIndex = records.findIndex(r => r.employeeId === employeeId && r.date === today);
  const employee = getEmployeeById(employeeId);
  const empName = employee ? `${employee.firstName} ${employee.lastName}` : employeeId;

  if (existingIndex === -1 || !records[existingIndex].checkIn) {
    throw new Error('Cannot check out without an active check-in record for today.');
  }

  const record = records[existingIndex];
  
  // Calculate duration in minutes
  const [inH, inM] = record.checkIn!.split(':').map(Number);
  const [outH, outM] = timeStr.split(':').map(Number);
  const durationMinutes = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM));

  const status: AttendanceStatus = durationMinutes < 240 ? 'HALF_DAY' : 'CHECKED_OUT';

  const updatedRecord: AttendanceRecord = {
    ...record,
    checkOut: timeStr,
    durationMinutes,
    status,
    notes: notes || record.notes || 'Completed workday',
  };

  records[existingIndex] = updatedRecord;
  setItem(KEYS.ATTENDANCE, records);
  addActivityLog(employeeId, empName, 'CHECK_OUT', 'Attendance', `Checked out at ${timeStr} (${Math.round(durationMinutes / 60 * 10) / 10} hrs)`);
  return updatedRecord;
};

// Leave Request Workflow Engine
export const submitLeaveRequest = (
  employeeId: string,
  leaveType: LeaveRequest['leaveType'],
  startDate: string,
  endDate: string,
  remarks: string
): LeaveRequest => {
  const employee = getEmployeeById(employeeId);
  if (!employee) throw new Error('Employee not found');

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const newRequest: LeaveRequest = {
    id: `lvr-${Date.now()}`,
    employeeId,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    department: employee.department,
    leaveType,
    startDate,
    endDate,
    durationDays,
    remarks,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const requests = getLeaveRequests();
  setItem(KEYS.LEAVE, [newRequest, ...requests]);

  addNotification(
    'ALL',
    'LEAVE_SUBMITTED',
    'New Leave Approval Pending',
    `${newRequest.employeeName} submitted a ${leaveType} leave request for ${durationDays} day(s).`,
    'approvals'
  );

  addActivityLog(
    employeeId,
    newRequest.employeeName,
    'LEAVE_SUBMITTED',
    'Leave Request',
    `Applied for ${durationDays} day(s) of ${leaveType} leave`
  );

  return newRequest;
};

export const approveLeaveRequest = (
  requestId: string,
  reviewerId: string,
  comment: string = ''
): LeaveRequest => {
  const requests = getLeaveRequests();
  const reqIndex = requests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) throw new Error('Leave request not found');

  const req = requests[reqIndex];
  const reviewer = getEmployeeById(reviewerId);
  const reviewerName = reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'HR Administrator';

  const updatedReq: LeaveRequest = {
    ...req,
    status: 'Approved',
    reviewerId,
    reviewerName,
    reviewerComment: comment || 'Approved by HR',
    updatedAt: new Date().toISOString(),
  };

  requests[reqIndex] = updatedReq;
  setItem(KEYS.LEAVE, requests);

  // 1. Transactional update: Adjust employee leave balances
  const employees = getEmployees();
  const empIndex = employees.findIndex(e => e.employeeId === req.employeeId);
  if (empIndex > -1) {
    const emp = employees[empIndex];
    if (req.leaveType === 'Paid') {
      emp.leaveBalance.paidUsed += req.durationDays;
    } else if (req.leaveType === 'Sick') {
      emp.leaveBalance.sickUsed += req.durationDays;
    } else {
      emp.leaveBalance.unpaidUsed += req.durationDays;
    }
    employees[empIndex] = emp;
    setItem(KEYS.EMPLOYEES, employees);
  }

  // 2. Transactional update: Create/Update Attendance records as LEAVE for the date range
  const attendanceRecords = getAttendance();
  const startDate = new Date(req.startDate);
  const endDate = new Date(req.endDate);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dStr = d.toISOString().split('T')[0];
    const existingIndex = attendanceRecords.findIndex(a => a.employeeId === req.employeeId && a.date === dStr);
    
    if (existingIndex > -1) {
      attendanceRecords[existingIndex] = {
        ...attendanceRecords[existingIndex],
        status: 'LEAVE',
        notes: `Approved ${req.leaveType} Leave`,
      };
    } else {
      attendanceRecords.push({
        id: `att-lvr-${Date.now()}-${dStr}`,
        employeeId: req.employeeId,
        date: dStr,
        checkIn: null,
        checkOut: null,
        durationMinutes: 0,
        status: 'LEAVE',
        notes: `Approved ${req.leaveType} Leave`,
      });
    }
  }
  setItem(KEYS.ATTENDANCE, attendanceRecords);

  // 3. Emit notification to employee
  addNotification(
    req.employeeId,
    'LEAVE_APPROVED',
    'Leave Request Approved',
    `Your ${req.leaveType} leave request for ${req.startDate} to ${req.endDate} was approved.`,
    'leave'
  );

  // 4. Log activity
  addActivityLog(
    reviewerId,
    reviewerName,
    'LEAVE_APPROVED',
    'Leave Request',
    `Approved ${req.employeeName}'s leave request (#${req.id})`
  );

  return updatedReq;
};

export const rejectLeaveRequest = (
  requestId: string,
  reviewerId: string,
  comment: string
): LeaveRequest => {
  const requests = getLeaveRequests();
  const reqIndex = requests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) throw new Error('Leave request not found');

  const req = requests[reqIndex];
  const reviewer = getEmployeeById(reviewerId);
  const reviewerName = reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'HR Administrator';

  const updatedReq: LeaveRequest = {
    ...req,
    status: 'Rejected',
    reviewerId,
    reviewerName,
    reviewerComment: comment || 'Request rejected by HR.',
    updatedAt: new Date().toISOString(),
  };

  requests[reqIndex] = updatedReq;
  setItem(KEYS.LEAVE, requests);

  addNotification(
    req.employeeId,
    'LEAVE_REJECTED',
    'Leave Request Declined',
    `Your ${req.leaveType} leave request was declined by ${reviewerName}. Reason: ${comment}`,
    'leave'
  );

  addActivityLog(
    reviewerId,
    reviewerName,
    'LEAVE_REJECTED',
    'Leave Request',
    `Declined ${req.employeeName}'s leave request (#${req.id})`
  );

  return updatedReq;
};

// Payroll Operations
export const updateSalaryStructure = (
  employeeId: string,
  newStructure: Omit<SalaryStructure, 'netSalary'>,
  actorId: string,
  actorName: string
): EmployeePayroll => {
  const payrolls = getPayrolls();
  const index = payrolls.findIndex(p => p.employeeId === employeeId);

  const netSalary = Math.max(
    0,
    newStructure.baseSalary + 
    newStructure.hra + 
    newStructure.specialAllowance + 
    newStructure.medicalAllowance - 
    newStructure.pfDeduction - 
    newStructure.taxDeduction
  );

  const fullStructure: SalaryStructure = {
    ...newStructure,
    netSalary,
  };

  let updatedPayroll: EmployeePayroll;

  if (index > -1) {
    updatedPayroll = {
      ...payrolls[index],
      salaryStructure: fullStructure,
    };
    payrolls[index] = updatedPayroll;
  } else {
    updatedPayroll = {
      id: `pay-${Date.now()}`,
      employeeId,
      salaryStructure: fullStructure,
      paySlips: [],
    };
    payrolls.push(updatedPayroll);
  }

  setItem(KEYS.PAYROLL, payrolls);

  addNotification(
    employeeId,
    'PAYROLL_UPDATE',
    'Salary Structure Updated',
    `Your compensation structure has been revised by HR. Net Salary: $${netSalary.toLocaleString()}`,
    'payroll'
  );

  addActivityLog(
    actorId,
    actorName,
    'PAYROLL_UPDATE',
    'Payroll',
    `Updated salary structure for employee #${employeeId}`
  );

  return updatedPayroll;
};

// Employee Management
export const updateEmployeeProfile = (
  employeeId: string,
  updates: Partial<Employee>,
  actorId: string,
  actorName: string
): Employee => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.employeeId === employeeId || e.id === employeeId);
  if (index === -1) throw new Error('Employee not found');

  const updatedEmployee = {
    ...employees[index],
    ...updates,
  };

  employees[index] = updatedEmployee;
  setItem(KEYS.EMPLOYEES, employees);

  addActivityLog(
    actorId,
    actorName,
    'PROFILE_UPDATE',
    'Employee Profile',
    `Updated profile info for ${updatedEmployee.firstName} ${updatedEmployee.lastName}`
  );

  return updatedEmployee;
};

export const addEmployee = (
  empData: Omit<Employee, 'id' | 'leaveBalance' | 'documents'>,
  actorId: string,
  actorName: string
): Employee => {
  const employees = getEmployees();
  const users = getUsers();

  const newId = `emp-${Date.now()}`;
  const newEmployee: Employee = {
    ...empData,
    id: newId,
    documents: [],
    leaveBalance: { paid: 20, paidUsed: 0, sick: 10, sickUsed: 0, unpaid: 10, unpaidUsed: 0 },
  };

  const newUser: User = {
    id: `usr-${Date.now()}`,
    employeeId: newEmployee.employeeId,
    email: newEmployee.email,
    role: newEmployee.role,
    isVerified: true,
    createdAt: new Date().toISOString(),
  };

  employees.unshift(newEmployee);
  users.unshift(newUser);

  setItem(KEYS.EMPLOYEES, employees);
  setItem(KEYS.USERS, users);

  // Initialize payroll structure
  updateSalaryStructure(
    newEmployee.employeeId,
    {
      baseSalary: 8000,
      hra: 2400,
      specialAllowance: 1200,
      medicalAllowance: 400,
      pfDeduction: 960,
      taxDeduction: 1040,
      currency: 'USD',
    },
    actorId,
    actorName
  );

  addActivityLog(
    actorId,
    actorName,
    'ADD_EMPLOYEE',
    'Employee Directory',
    `Registered new employee ${newEmployee.firstName} ${newEmployee.lastName} (${newEmployee.employeeId})`
  );

  return newEmployee;
};
