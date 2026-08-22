import type { 
  User, Employee, AttendanceRecord, LeaveRequest, EmployeePayroll, Notification, ActivityLog, 
  SalaryStructure, AttendanceStatus
} from '../types';
import { 
  INITIAL_USERS, INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, INITIAL_LEAVE_REQUESTS, 
  INITIAL_PAYROLLS, INITIAL_NOTIFICATIONS, INITIAL_ACTIVITY_LOGS, getTodayDateString 
} from './mockData';
import { db, isFirebaseConfigured, COLLECTIONS, DEFAULT_ORG_ID, getOrgCollectionPath } from './firebase';
import { collection, onSnapshot, doc, setDoc, query, where } from 'firebase/firestore';

export { getTodayDateString, isFirebaseConfigured, DEFAULT_ORG_ID };

const KEYS = {
  USERS: 'dayflow_users',
  EMPLOYEES: 'dayflow_employees',
  ATTENDANCE: 'dayflow_attendance',
  LEAVE: 'dayflow_leave_requests',
  PAYROLL: 'dayflow_payrolls',
  NOTIFICATIONS: 'dayflow_notifications',
  ACTIVITY: 'dayflow_activity_logs',
};

let listeners: Array<() => void> = [];
let firestoreUnsubscribers: Array<() => void> = [];

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

// Complete session cache reset & Firestore unsubscriber for Logout (Phase 9)
export const clearSessionCache = () => {
  firestoreUnsubscribers.forEach(unsub => unsub());
  firestoreUnsubscribers = [];
  listeners = [];
  isFirestoreInitialized = false;
  localStorage.removeItem('dayflow_active_user_id');
};

let isFirestoreInitialized = false;

export const initStorage = (orgId: string = DEFAULT_ORG_ID, activeEmployeeId?: string, userRole?: string) => {
  if (isFirebaseConfigured && db && !isFirestoreInitialized) {
    isFirestoreInitialized = true;
    
    // Clear old unsubscribers
    firestoreUnsubscribers.forEach(unsub => unsub());
    firestoreUnsubscribers = [];

    const isHrOrAdmin = userRole === 'HR' || userRole === 'ADMIN';

    // 1. Users Collection
    const usersCol = collection(db, getOrgCollectionPath(orgId, COLLECTIONS.USERS));
    const unsubUsers = onSnapshot(usersCol, (snapshot: any) => {
      const data = snapshot.docs.map((d: any) => d.data() as User);
      if (data.length > 0) localStorage.setItem(KEYS.USERS, JSON.stringify(data));
      notifyListeners();
    });
    firestoreUnsubscribers.push(unsubUsers);

    // 2. Employees Collection - HR gets org-scoped, Employee gets own record query (Phase 8)
    const empCol = collection(db, getOrgCollectionPath(orgId, COLLECTIONS.EMPLOYEES));
    const empQuery = (isHrOrAdmin || !activeEmployeeId) 
      ? empCol 
      : query(empCol, where('employeeId', '==', activeEmployeeId));

    const unsubEmp = onSnapshot(empQuery, (snapshot: any) => {
      const data = snapshot.docs.map((d: any) => d.data() as Employee);
      if (data.length > 0) localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(data));
      notifyListeners();
    });
    firestoreUnsubscribers.push(unsubEmp);

    // 3. Attendance Records - Scoped query
    const attCol = collection(db, getOrgCollectionPath(orgId, COLLECTIONS.ATTENDANCE));
    const attQuery = (isHrOrAdmin || !activeEmployeeId)
      ? attCol
      : query(attCol, where('employeeId', '==', activeEmployeeId));

    const unsubAtt = onSnapshot(attQuery, (snapshot: any) => {
      const data = snapshot.docs.map((d: any) => d.data() as AttendanceRecord);
      if (data.length > 0) localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(data));
      notifyListeners();
    });
    firestoreUnsubscribers.push(unsubAtt);

    // 4. Leave Requests - Scoped query
    const leaveCol = collection(db, getOrgCollectionPath(orgId, COLLECTIONS.LEAVE));
    const leaveQuery = (isHrOrAdmin || !activeEmployeeId)
      ? leaveCol
      : query(leaveCol, where('employeeId', '==', activeEmployeeId));

    const unsubLeave = onSnapshot(leaveQuery, (snapshot: any) => {
      const data = snapshot.docs.map((d: any) => d.data() as LeaveRequest);
      if (data.length > 0) localStorage.setItem(KEYS.LEAVE, JSON.stringify(data));
      notifyListeners();
    });
    firestoreUnsubscribers.push(unsubLeave);

    // 5. Payrolls - Scoped query (Phase 8 & 14 protection)
    const payCol = collection(db, getOrgCollectionPath(orgId, COLLECTIONS.PAYROLL));
    const payQuery = (isHrOrAdmin || !activeEmployeeId)
      ? payCol
      : query(payCol, where('employeeId', '==', activeEmployeeId));

    const unsubPay = onSnapshot(payQuery, (snapshot: any) => {
      const data = snapshot.docs.map((d: any) => d.data() as EmployeePayroll);
      if (data.length > 0) localStorage.setItem(KEYS.PAYROLL, JSON.stringify(data));
      notifyListeners();
    });
    firestoreUnsubscribers.push(unsubPay);

    // 6. Audit Logs - Immutable
    const auditCol = collection(db, getOrgCollectionPath(orgId, COLLECTIONS.ACTIVITY));
    const unsubAudit = onSnapshot(auditCol, (snapshot: any) => {
      const data = snapshot.docs.map((d: any) => d.data() as ActivityLog);
      if (data.length > 0) localStorage.setItem(KEYS.ACTIVITY, JSON.stringify(data));
      notifyListeners();
    });
    firestoreUnsubscribers.push(unsubAudit);
  }

  // LocalStorage Fallback Initialization
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

export const resetToSeedData = async (orgId: string = DEFAULT_ORG_ID) => {
  localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(KEYS.LEAVE, JSON.stringify(INITIAL_LEAVE_REQUESTS));
  localStorage.setItem(KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLLS));
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITY_LOGS));

  // Sync seed data to multi-tenant Firestore structure if configured
  if (isFirebaseConfigured && db) {
    try {
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, `${getOrgCollectionPath(orgId, COLLECTIONS.USERS)}/${u.id}`), { ...u, organizationId: orgId });
      }
      for (const e of INITIAL_EMPLOYEES) {
        await setDoc(doc(db, `${getOrgCollectionPath(orgId, COLLECTIONS.EMPLOYEES)}/${e.id}`), { ...e, organizationId: orgId });
        // Store sensitive compensation in isolated subcollection (Phase 5)
        const pay = INITIAL_PAYROLLS.find(p => p.employeeId === e.employeeId);
        if (pay) {
          await setDoc(doc(db, `organizations/${orgId}/employees/${e.employeeId}/private/compensation`), pay.salaryStructure);
        }
      }
      for (const a of INITIAL_ATTENDANCE) {
        await setDoc(doc(db, `${getOrgCollectionPath(orgId, COLLECTIONS.ATTENDANCE)}/${a.id}`), { ...a, organizationId: orgId });
      }
      for (const l of INITIAL_LEAVE_REQUESTS) {
        await setDoc(doc(db, `${getOrgCollectionPath(orgId, COLLECTIONS.LEAVE)}/${l.id}`), { ...l, organizationId: orgId });
      }
      for (const p of INITIAL_PAYROLLS) {
        await setDoc(doc(db, `${getOrgCollectionPath(orgId, COLLECTIONS.PAYROLL)}/${p.id}`), { ...p, organizationId: orgId });
      }
      for (const n of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, `${getOrgCollectionPath(orgId, COLLECTIONS.NOTIFICATIONS)}/${n.id}`), { ...n, organizationId: orgId });
      }
      for (const act of INITIAL_ACTIVITY_LOGS) {
        await setDoc(doc(db, `${getOrgCollectionPath(orgId, COLLECTIONS.ACTIVITY)}/${act.id}`), { ...act, organizationId: orgId });
      }
    } catch (err) {
      console.error('Error syncing seed data to Firestore:', err);
    }
  }

  notifyListeners();
};

// Generic Local Reader Helpers
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

// Sync item to Multi-Tenant Firestore
const syncDocToFirestore = async (colName: string, docId: string, itemData: any, orgId: string = DEFAULT_ORG_ID) => {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, `${getOrgCollectionPath(orgId, colName)}/${docId}`), {
        ...itemData,
        organizationId: orgId,
      });
    } catch (e) {
      console.error(`Error syncing doc ${docId} to ${colName}:`, e);
    }
  }
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

// Immutable Audit Logging (Phase 12)
export const addActivityLog = (actorId: string, actorName: string, action: string, entity: string, details: string, orgId: string = DEFAULT_ORG_ID) => {
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
  syncDocToFirestore(COLLECTIONS.ACTIVITY, newLog.id, newLog, orgId);
};

// Notification helper
export const addNotification = (
  recipientId: string,
  type: Notification['type'],
  title: string,
  message: string,
  targetTab?: string,
  orgId: string = DEFAULT_ORG_ID
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
  syncDocToFirestore(COLLECTIONS.NOTIFICATIONS, newNotif.id, newNotif, orgId);
};

export const markNotificationAsRead = (notifId: string, orgId: string = DEFAULT_ORG_ID) => {
  const notifs = getNotifications();
  const updated = notifs.map(n => {
    if (n.id === notifId) {
      const readNotif = { ...n, read: true };
      syncDocToFirestore(COLLECTIONS.NOTIFICATIONS, notifId, readNotif, orgId);
      return readNotif;
    }
    return n;
  });
  setItem(KEYS.NOTIFICATIONS, updated);
};

export const markAllNotificationsAsRead = (recipientId: string, orgId: string = DEFAULT_ORG_ID) => {
  const notifs = getNotifications();
  const updated = notifs.map(n => {
    if (n.recipientId === recipientId || n.recipientId === 'ALL') {
      const readNotif = { ...n, read: true };
      syncDocToFirestore(COLLECTIONS.NOTIFICATIONS, n.id, readNotif, orgId);
      return readNotif;
    }
    return n;
  });
  setItem(KEYS.NOTIFICATIONS, updated);
};

// State Machine: Attendance Operations
export const checkInEmployee = (employeeId: string, notes: string = '', orgId: string = DEFAULT_ORG_ID): AttendanceRecord => {
  const today = getTodayDateString();
  const records = getAttendance();
  const now = new Date();
  const timeStr = now.toTimeString().substring(0, 5);
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
  syncDocToFirestore(COLLECTIONS.ATTENDANCE, updatedRecord.id, updatedRecord, orgId);
  addActivityLog(employeeId, empName, 'CHECK_IN', 'Attendance', `Checked in at ${timeStr}`, orgId);
  return updatedRecord;
};

export const checkOutEmployee = (employeeId: string, notes: string = '', orgId: string = DEFAULT_ORG_ID): AttendanceRecord => {
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
  syncDocToFirestore(COLLECTIONS.ATTENDANCE, updatedRecord.id, updatedRecord, orgId);
  addActivityLog(employeeId, empName, 'CHECK_OUT', 'Attendance', `Checked out at ${timeStr} (${Math.round(durationMinutes / 60 * 10) / 10} hrs)`, orgId);
  return updatedRecord;
};

// Leave Request Workflow Engine & Transition Validation (Phase 7 & 12)
export const submitLeaveRequest = (
  employeeId: string,
  leaveType: LeaveRequest['leaveType'],
  startDate: string,
  endDate: string,
  remarks: string,
  orgId: string = DEFAULT_ORG_ID
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
    status: 'Pending', // Enforce Pending status on creation (Phase 7)
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const requests = getLeaveRequests();
  setItem(KEYS.LEAVE, [newRequest, ...requests]);
  syncDocToFirestore(COLLECTIONS.LEAVE, newRequest.id, newRequest, orgId);

  addNotification(
    'ALL',
    'LEAVE_SUBMITTED',
    'New Leave Approval Pending',
    `${newRequest.employeeName} submitted a ${leaveType} leave request for ${durationDays} day(s).`,
    'approvals',
    orgId
  );

  addActivityLog(
    employeeId,
    newRequest.employeeName,
    'LEAVE_SUBMITTED',
    'Leave Request',
    `Applied for ${durationDays} day(s) of ${leaveType} leave`,
    orgId
  );

  return newRequest;
};

export const approveLeaveRequest = (
  requestId: string,
  reviewerId: string,
  comment: string = '',
  orgId: string = DEFAULT_ORG_ID
): LeaveRequest => {
  const requests = getLeaveRequests();
  const reqIndex = requests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) throw new Error('Leave request not found');

  const req = requests[reqIndex];
  if (req.status !== 'Pending') {
    throw new Error('Only Pending leave requests can be approved.');
  }

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
  syncDocToFirestore(COLLECTIONS.LEAVE, updatedReq.id, updatedReq, orgId);

  // Adjust leave balance
  const employees = getEmployees();
  const empIndex = employees.findIndex(e => e.employeeId === req.employeeId);
  if (empIndex > -1) {
    const emp = employees[empIndex];
    if (req.leaveType === 'Paid') emp.leaveBalance.paidUsed += req.durationDays;
    else if (req.leaveType === 'Sick') emp.leaveBalance.sickUsed += req.durationDays;
    else emp.leaveBalance.unpaidUsed += req.durationDays;
    
    employees[empIndex] = emp;
    setItem(KEYS.EMPLOYEES, employees);
    syncDocToFirestore(COLLECTIONS.EMPLOYEES, emp.id, emp, orgId);
  }

  // Update attendance entries for date range
  const attendanceRecords = getAttendance();
  const startDate = new Date(req.startDate);
  const endDate = new Date(req.endDate);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dStr = d.toISOString().split('T')[0];
    const existingIndex = attendanceRecords.findIndex(a => a.employeeId === req.employeeId && a.date === dStr);
    
    let attRecord: AttendanceRecord;
    if (existingIndex > -1) {
      attRecord = { ...attendanceRecords[existingIndex], status: 'LEAVE', notes: `Approved ${req.leaveType} Leave` };
      attendanceRecords[existingIndex] = attRecord;
    } else {
      attRecord = { id: `att-lvr-${Date.now()}-${dStr}`, employeeId: req.employeeId, date: dStr, checkIn: null, checkOut: null, durationMinutes: 0, status: 'LEAVE', notes: `Approved ${req.leaveType} Leave` };
      attendanceRecords.push(attRecord);
    }
    syncDocToFirestore(COLLECTIONS.ATTENDANCE, attRecord.id, attRecord, orgId);
  }
  setItem(KEYS.ATTENDANCE, attendanceRecords);

  addNotification(req.employeeId, 'LEAVE_APPROVED', 'Leave Request Approved', `Your ${req.leaveType} leave request for ${req.startDate} to ${req.endDate} was approved.`, 'leave', orgId);
  addActivityLog(reviewerId, reviewerName, 'LEAVE_APPROVED', 'Leave Request', `Approved ${req.employeeName}'s leave request (#${req.id})`, orgId);

  return updatedReq;
};

export const rejectLeaveRequest = (
  requestId: string,
  reviewerId: string,
  comment: string,
  orgId: string = DEFAULT_ORG_ID
): LeaveRequest => {
  const requests = getLeaveRequests();
  const reqIndex = requests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) throw new Error('Leave request not found');

  const req = requests[reqIndex];
  if (req.status !== 'Pending') {
    throw new Error('Only Pending leave requests can be rejected.');
  }

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
  syncDocToFirestore(COLLECTIONS.LEAVE, updatedReq.id, updatedReq, orgId);

  addNotification(req.employeeId, 'LEAVE_REJECTED', 'Leave Request Declined', `Your ${req.leaveType} leave request was declined by ${reviewerName}. Reason: ${comment}`, 'leave', orgId);
  addActivityLog(reviewerId, reviewerName, 'LEAVE_REJECTED', 'Leave Request', `Declined ${req.employeeName}'s leave request (#${req.id})`, orgId);

  return updatedReq;
};

// Payroll Operations
export const updateSalaryStructure = (
  employeeId: string,
  newStructure: Omit<SalaryStructure, 'netSalary'>,
  actorId: string,
  actorName: string,
  orgId: string = DEFAULT_ORG_ID
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
  syncDocToFirestore(COLLECTIONS.PAYROLL, updatedPayroll.id, updatedPayroll, orgId);

  // Sync to isolated subcollection (Phase 5)
  if (isFirebaseConfigured && db) {
    setDoc(doc(db, `organizations/${orgId}/employees/${employeeId}/private/compensation`), fullStructure).catch(console.error);
  }

  addNotification(employeeId, 'PAYROLL_UPDATE', 'Salary Structure Updated', `Your compensation structure has been revised by HR. Net Salary: $${netSalary.toLocaleString()}`, 'payroll', orgId);
  addActivityLog(actorId, actorName, 'PAYROLL_UPDATE', 'Payroll', `Updated salary structure for employee #${employeeId}`, orgId);

  return updatedPayroll;
};

// Employee Management
export const updateEmployeeProfile = (
  employeeId: string,
  updates: Partial<Employee>,
  actorId: string,
  actorName: string,
  orgId: string = DEFAULT_ORG_ID
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
  syncDocToFirestore(COLLECTIONS.EMPLOYEES, updatedEmployee.id, updatedEmployee, orgId);

  addActivityLog(actorId, actorName, 'PROFILE_UPDATE', 'Employee Profile', `Updated profile info for ${updatedEmployee.firstName} ${updatedEmployee.lastName}`, orgId);

  return updatedEmployee;
};

export const addEmployee = (
  empData: Omit<Employee, 'id' | 'leaveBalance' | 'documents'>,
  actorId: string,
  actorName: string,
  orgId: string = DEFAULT_ORG_ID
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

  syncDocToFirestore(COLLECTIONS.EMPLOYEES, newEmployee.id, newEmployee, orgId);
  syncDocToFirestore(COLLECTIONS.USERS, newUser.id, newUser, orgId);

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
    actorName,
    orgId
  );

  addActivityLog(actorId, actorName, 'ADD_EMPLOYEE', 'Employee Directory', `Registered new employee ${newEmployee.firstName} ${newEmployee.lastName} (${newEmployee.employeeId})`, orgId);

  return newEmployee;
};
