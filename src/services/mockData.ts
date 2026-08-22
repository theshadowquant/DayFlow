import type { Employee, User, AttendanceRecord, LeaveRequest, EmployeePayroll, Notification, ActivityLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    employeeId: 'EMP-1001',
    email: 'sarah.jenkins@dayflow.io',
    role: 'ADMIN',
    isVerified: true,
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'usr-2',
    employeeId: 'EMP-1002',
    email: 'alex.morgan@dayflow.io',
    role: 'EMPLOYEE',
    isVerified: true,
    createdAt: '2025-01-15T09:30:00Z',
  },
  {
    id: 'usr-3',
    employeeId: 'EMP-1003',
    email: 'marcus.vance@dayflow.io',
    role: 'EMPLOYEE',
    isVerified: true,
    createdAt: '2025-02-01T10:00:00Z',
  },
  {
    id: 'usr-4',
    employeeId: 'EMP-1004',
    email: 'elena.rodriguez@dayflow.io',
    role: 'ADMIN',
    isVerified: true,
    createdAt: '2025-02-10T11:15:00Z',
  },
  {
    id: 'usr-5',
    employeeId: 'EMP-1005',
    email: 'david.chen@dayflow.io',
    role: 'EMPLOYEE',
    isVerified: true,
    createdAt: '2025-03-01T08:45:00Z',
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1001',
    employeeId: 'EMP-1001',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.jenkins@dayflow.io',
    phone: '+1 (555) 234-5678',
    role: 'ADMIN',
    designation: 'VP of Human Capital',
    department: 'Human Resources',
    joiningDate: '2024-03-15',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    managerId: null,
    managerName: 'Board of Directors',
    address: '742 Evergreen Terrace, San Francisco, CA 94107',
    emergencyContact: {
      name: 'Robert Jenkins',
      relation: 'Spouse',
      phone: '+1 (555) 987-6543',
    },
    documents: [
      { id: 'doc-1', name: 'Employment_Contract_S_Jenkins.pdf', type: 'PDF', dateUploaded: '2024-03-15', size: '2.4 MB' },
      { id: 'doc-2', name: 'Tax_Declaration_2026.pdf', type: 'PDF', dateUploaded: '2026-01-10', size: '1.1 MB' }
    ],
    leaveBalance: { paid: 20, paidUsed: 3, sick: 10, sickUsed: 1, unpaid: 10, unpaidUsed: 0 }
  },
  {
    id: 'emp-1002',
    employeeId: 'EMP-1002',
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@dayflow.io',
    phone: '+1 (555) 345-6789',
    role: 'EMPLOYEE',
    designation: 'Senior Frontend Architect',
    department: 'Engineering',
    joiningDate: '2024-06-01',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    managerId: 'emp-1005',
    managerName: 'David Chen',
    address: '1288 Mission St, Apt 402, San Francisco, CA 94103',
    emergencyContact: {
      name: 'Jessica Morgan',
      relation: 'Sister',
      phone: '+1 (555) 876-5432',
    },
    documents: [
      { id: 'doc-3', name: 'Identity_Verification_A_Morgan.pdf', type: 'PDF', dateUploaded: '2024-06-01', size: '1.8 MB' },
      { id: 'doc-4', name: 'Engineering_Certification.pdf', type: 'PDF', dateUploaded: '2025-08-12', size: '3.2 MB' }
    ],
    leaveBalance: { paid: 18, paidUsed: 4, sick: 8, sickUsed: 2, unpaid: 5, unpaidUsed: 0 }
  },
  {
    id: 'emp-1003',
    employeeId: 'EMP-1003',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@dayflow.io',
    phone: '+1 (555) 456-7890',
    role: 'EMPLOYEE',
    designation: 'Lead Product Designer',
    department: 'UI/UX Design',
    joiningDate: '2024-08-15',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    managerId: 'emp-1004',
    managerName: 'Elena Rodriguez',
    address: '450 Sutter St, San Francisco, CA 94108',
    emergencyContact: {
      name: 'Carla Vance',
      relation: 'Spouse',
      phone: '+1 (555) 765-4321',
    },
    documents: [
      { id: 'doc-5', name: 'NDA_Signed_M_Vance.pdf', type: 'PDF', dateUploaded: '2024-08-15', size: '1.4 MB' }
    ],
    leaveBalance: { paid: 22, paidUsed: 5, sick: 10, sickUsed: 0, unpaid: 10, unpaidUsed: 0 }
  },
  {
    id: 'emp-1004',
    employeeId: 'EMP-1004',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    email: 'elena.rodriguez@dayflow.io',
    phone: '+1 (555) 567-8901',
    role: 'ADMIN',
    designation: 'VP of Product',
    department: 'Product Management',
    joiningDate: '2024-01-10',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    managerId: null,
    managerName: 'CEO Office',
    address: '890 Broadway, Redwood City, CA 94063',
    emergencyContact: {
      name: 'Carlos Rodriguez',
      relation: 'Brother',
      phone: '+1 (555) 654-3210',
    },
    documents: [
      { id: 'doc-6', name: 'Executive_Offer_E_Rodriguez.pdf', type: 'PDF', dateUploaded: '2024-01-10', size: '2.9 MB' }
    ],
    leaveBalance: { paid: 25, paidUsed: 2, sick: 12, sickUsed: 1, unpaid: 10, unpaidUsed: 0 }
  },
  {
    id: 'emp-1005',
    employeeId: 'EMP-1005',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.chen@dayflow.io',
    phone: '+1 (555) 678-9012',
    role: 'EMPLOYEE',
    designation: 'Director of Engineering',
    department: 'Engineering',
    joiningDate: '2024-02-01',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    managerId: null,
    managerName: 'CEO Office',
    address: '2100 Bush St, San Francisco, CA 94115',
    emergencyContact: {
      name: 'Mei Chen',
      relation: 'Mother',
      phone: '+1 (555) 543-2109',
    },
    documents: [
      { id: 'doc-7', name: 'Engineering_Director_Agreement.pdf', type: 'PDF', dateUploaded: '2024-02-01', size: '3.1 MB' }
    ],
    leaveBalance: { paid: 20, paidUsed: 6, sick: 10, sickUsed: 1, unpaid: 10, unpaidUsed: 0 }
  },
  {
    id: 'emp-1006',
    employeeId: 'EMP-1006',
    firstName: 'Rachel',
    lastName: 'Kim',
    email: 'rachel.kim@dayflow.io',
    phone: '+1 (555) 789-0123',
    role: 'EMPLOYEE',
    designation: 'Senior DevOps Engineer',
    department: 'Engineering',
    joiningDate: '2024-09-01',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    managerId: 'emp-1005',
    managerName: 'David Chen',
    address: '320 Castro St, Mountain View, CA 94041',
    emergencyContact: {
      name: 'Daniel Kim',
      relation: 'Spouse',
      phone: '+1 (555) 432-1098',
    },
    documents: [
      { id: 'doc-8', name: 'AWS_DevOps_Cert.pdf', type: 'PDF', dateUploaded: '2024-09-01', size: '1.9 MB' }
    ],
    leaveBalance: { paid: 18, paidUsed: 2, sick: 8, sickUsed: 0, unpaid: 5, unpaidUsed: 0 }
  },
  {
    id: 'emp-1007',
    employeeId: 'EMP-1007',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@dayflow.io',
    phone: '+1 (555) 890-1234',
    role: 'EMPLOYEE',
    designation: 'Growth Marketing Manager',
    department: 'Sales & Marketing',
    joiningDate: '2024-11-01',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    managerId: 'emp-1004',
    managerName: 'Elena Rodriguez',
    address: '550 Howard St, San Francisco, CA 94105',
    emergencyContact: {
      name: 'Laura Wilson',
      relation: 'Spouse',
      phone: '+1 (555) 321-0987',
    },
    documents: [
      { id: 'doc-9', name: 'Marketing_Agreement_J_Wilson.pdf', type: 'PDF', dateUploaded: '2024-11-01', size: '2.0 MB' }
    ],
    leaveBalance: { paid: 15, paidUsed: 1, sick: 10, sickUsed: 1, unpaid: 5, unpaidUsed: 0 }
  },
  {
    id: 'emp-1008',
    employeeId: 'EMP-1008',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@dayflow.io',
    phone: '+1 (555) 901-2345',
    role: 'EMPLOYEE',
    designation: 'Senior Financial Controller',
    department: 'Finance & Operations',
    joiningDate: '2024-05-10',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    managerId: 'emp-1001',
    managerName: 'Sarah Jenkins',
    address: '100 University Ave, Palo Alto, CA 94301',
    emergencyContact: {
      name: 'Amit Sharma',
      relation: 'Spouse',
      phone: '+1 (555) 210-9876',
    },
    documents: [
      { id: 'doc-10', name: 'CPA_Credentials_P_Sharma.pdf', type: 'PDF', dateUploaded: '2024-05-10', size: '4.1 MB' }
    ],
    leaveBalance: { paid: 20, paidUsed: 5, sick: 10, sickUsed: 0, unpaid: 10, unpaidUsed: 0 }
  }
];

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayStr = getTodayDateString();

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'EMP-1001',
    date: todayStr,
    checkIn: '08:45',
    checkOut: null,
    durationMinutes: 125,
    status: 'CHECKED_IN',
    notes: 'Morning management sync',
    isLate: false,
  },
  {
    id: 'att-2',
    employeeId: 'EMP-1002',
    date: todayStr,
    checkIn: '09:05',
    checkOut: null,
    durationMinutes: 105,
    status: 'CHECKED_IN',
    notes: 'Frontend sprint standup',
    isLate: false,
  },
  {
    id: 'att-3',
    employeeId: 'EMP-1003',
    date: todayStr,
    checkIn: null,
    checkOut: null,
    durationMinutes: 0,
    status: 'LEAVE',
    notes: 'Approved Medical Leave',
    isLate: false,
  },
  {
    id: 'att-4',
    employeeId: 'EMP-1004',
    date: todayStr,
    checkIn: '08:30',
    checkOut: null,
    durationMinutes: 140,
    status: 'CHECKED_IN',
    notes: 'Executive review',
    isLate: false,
  },
  {
    id: 'att-5',
    employeeId: 'EMP-1005',
    date: todayStr,
    checkIn: '09:42',
    checkOut: null,
    durationMinutes: 68,
    status: 'CHECKED_IN',
    notes: 'Arrived after client call',
    isLate: true,
  },
  {
    id: 'att-6',
    employeeId: 'EMP-1006',
    date: todayStr,
    checkIn: '08:55',
    checkOut: null,
    durationMinutes: 115,
    status: 'CHECKED_IN',
    notes: 'Infrastructure monitoring',
    isLate: false,
  },
  {
    id: 'att-7',
    employeeId: 'EMP-1007',
    date: todayStr,
    checkIn: null,
    checkOut: null,
    durationMinutes: 0,
    status: 'NOT_CHECKED_IN',
    notes: '',
    isLate: false,
  },
  {
    id: 'att-8',
    employeeId: 'EMP-1008',
    date: todayStr,
    checkIn: '09:00',
    checkOut: null,
    durationMinutes: 110,
    status: 'CHECKED_IN',
    notes: 'Quarterly financial audit',
    isLate: false,
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lvr-101',
    employeeId: 'EMP-1003',
    employeeName: 'Marcus Vance',
    department: 'UI/UX Design',
    leaveType: 'Sick',
    startDate: todayStr,
    endDate: todayStr,
    durationDays: 1,
    remarks: 'Severe dental migraine; doctor appointment scheduled at 11 AM.',
    status: 'Approved',
    reviewerId: 'EMP-1001',
    reviewerName: 'Sarah Jenkins',
    reviewerComment: 'Approved. Get well soon, Marcus!',
    createdAt: '2026-08-21T18:30:00Z',
    updatedAt: '2026-08-21T19:15:00Z',
  },
  {
    id: 'lvr-102',
    employeeId: 'EMP-1002',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    leaveType: 'Paid',
    startDate: '2026-08-26',
    endDate: '2026-08-28',
    durationDays: 3,
    remarks: 'Attending React Advanced Summit and taking a personal day off for family commitment.',
    status: 'Pending',
    createdAt: '2026-08-22T08:15:00Z',
    updatedAt: '2026-08-22T08:15:00Z',
  },
  {
    id: 'lvr-103',
    employeeId: 'EMP-1006',
    employeeName: 'Rachel Kim',
    department: 'Engineering',
    leaveType: 'Paid',
    startDate: '2026-09-01',
    endDate: '2026-09-05',
    durationDays: 5,
    remarks: 'Annual summer vacation trip.',
    status: 'Pending',
    createdAt: '2026-08-21T14:20:00Z',
    updatedAt: '2026-08-21T14:20:00Z',
  },
  {
    id: 'lvr-104',
    employeeId: 'EMP-1007',
    employeeName: 'James Wilson',
    department: 'Sales & Marketing',
    leaveType: 'Unpaid',
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    durationDays: 3,
    remarks: 'Personal urgent relocation affairs.',
    status: 'Approved',
    reviewerId: 'EMP-1004',
    reviewerName: 'Elena Rodriguez',
    reviewerComment: 'Approved as per discussion.',
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-08-05T11:45:00Z',
  }
];

export const INITIAL_PAYROLLS: EmployeePayroll[] = [
  {
    id: 'pay-1001',
    employeeId: 'EMP-1001',
    salaryStructure: {
      baseSalary: 12500,
      hra: 3750,
      specialAllowance: 2200,
      medicalAllowance: 500,
      pfDeduction: 1500,
      taxDeduction: 2450,
      netSalary: 15000,
      currency: 'USD',
    },
    paySlips: [
      { id: 'ps-1001-1', employeeId: 'EMP-1001', monthYear: 'July 2026', issueDate: '2026-07-31', basicPay: 12500, hra: 3750, allowances: 2700, deductions: 3950, netPay: 15000, status: 'Paid' },
      { id: 'ps-1001-2', employeeId: 'EMP-1001', monthYear: 'June 2026', issueDate: '2026-06-30', basicPay: 12500, hra: 3750, allowances: 2700, deductions: 3950, netPay: 15000, status: 'Paid' }
    ]
  },
  {
    id: 'pay-1002',
    employeeId: 'EMP-1002',
    salaryStructure: {
      baseSalary: 11000,
      hra: 3300,
      specialAllowance: 1800,
      medicalAllowance: 400,
      pfDeduction: 1320,
      taxDeduction: 2180,
      netSalary: 13000,
      currency: 'USD',
    },
    paySlips: [
      { id: 'ps-1002-1', employeeId: 'EMP-1002', monthYear: 'July 2026', issueDate: '2026-07-31', basicPay: 11000, hra: 3300, allowances: 2200, deductions: 3500, netPay: 13000, status: 'Paid' },
      { id: 'ps-1002-2', employeeId: 'EMP-1002', monthYear: 'June 2026', issueDate: '2026-06-30', basicPay: 11000, hra: 3300, allowances: 2200, deductions: 3500, netPay: 13000, status: 'Paid' }
    ]
  },
  {
    id: 'pay-1003',
    employeeId: 'EMP-1003',
    salaryStructure: {
      baseSalary: 9500,
      hra: 2850,
      specialAllowance: 1500,
      medicalAllowance: 400,
      pfDeduction: 1140,
      taxDeduction: 1610,
      netSalary: 11500,
      currency: 'USD',
    },
    paySlips: [
      { id: 'ps-1003-1', employeeId: 'EMP-1003', monthYear: 'July 2026', issueDate: '2026-07-31', basicPay: 9500, hra: 2850, allowances: 1900, deductions: 2750, netPay: 11500, status: 'Paid' }
    ]
  },
  {
    id: 'pay-1004',
    employeeId: 'EMP-1004',
    salaryStructure: {
      baseSalary: 13500,
      hra: 4050,
      specialAllowance: 2500,
      medicalAllowance: 500,
      pfDeduction: 1620,
      taxDeduction: 2930,
      netSalary: 16000,
      currency: 'USD',
    },
    paySlips: [
      { id: 'ps-1004-1', employeeId: 'EMP-1004', monthYear: 'July 2026', issueDate: '2026-07-31', basicPay: 13500, hra: 4050, allowances: 3000, deductions: 4550, netPay: 16000, status: 'Paid' }
    ]
  },
  {
    id: 'pay-1005',
    employeeId: 'EMP-1005',
    salaryStructure: {
      baseSalary: 14000,
      hra: 4200,
      specialAllowance: 2800,
      medicalAllowance: 500,
      pfDeduction: 1680,
      taxDeduction: 3320,
      netSalary: 16500,
      currency: 'USD',
    },
    paySlips: [
      { id: 'ps-1005-1', employeeId: 'EMP-1005', monthYear: 'July 2026', issueDate: '2026-07-31', basicPay: 14000, hra: 4200, allowances: 3300, deductions: 5000, netPay: 16500, status: 'Paid' }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    recipientId: 'ALL',
    type: 'ATTENDANCE_ALERT',
    title: 'Q3 Policy Update',
    message: 'Please complete your quarterly profile verification before August 31st.',
    read: false,
    createdAt: '2026-08-20T09:00:00Z',
    targetTab: 'profile',
  },
  {
    id: 'notif-2',
    recipientId: 'EMP-1003',
    type: 'LEAVE_APPROVED',
    title: 'Leave Request Approved',
    message: 'Your Sick leave request for August 22, 2026 has been approved by Sarah Jenkins.',
    read: false,
    createdAt: '2026-08-21T19:15:00Z',
    targetTab: 'leave',
  },
  {
    id: 'notif-3',
    recipientId: 'EMP-1001',
    type: 'LEAVE_SUBMITTED',
    title: 'New Pending Leave Request',
    message: 'Alex Morgan submitted a Paid leave request for Aug 26 - Aug 28.',
    read: false,
    createdAt: '2026-08-22T08:15:00Z',
    targetTab: 'approvals',
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    actorId: 'EMP-1001',
    actorName: 'Sarah Jenkins',
    action: 'LEAVE_APPROVED',
    entity: 'LeaveRequest #lvr-101',
    details: 'Approved Sick leave for Marcus Vance (1 day)',
    timestamp: '2026-08-21T19:15:00Z',
  },
  {
    id: 'log-2',
    actorId: 'EMP-1002',
    actorName: 'Alex Morgan',
    action: 'LEAVE_SUBMITTED',
    entity: 'LeaveRequest #lvr-102',
    details: 'Submitted Paid leave request for Aug 26 - Aug 28 (3 days)',
    timestamp: '2026-08-22T08:15:00Z',
  },
  {
    id: 'log-3',
    actorId: 'EMP-1002',
    actorName: 'Alex Morgan',
    action: 'CHECK_IN',
    entity: 'Attendance',
    details: 'Checked in at 09:05 AM',
    timestamp: '2026-08-22T09:05:00Z',
  }
];
