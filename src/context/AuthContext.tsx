import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Employee, Role } from '../types';
import { getUsers, getEmployees, subscribeToDataChanges, getEmployeeById, clearSessionCache, DEFAULT_ORG_ID } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  currentEmployee: Employee | null;
  role: Role;
  organizationId: string;
  isAuthenticated: boolean;
  inspectingEmployee: Employee | null; // Phase 10: HR Inspection Mode (HR remains HR_UID)
  setInspectingEmployeeId: (empId: string | null) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (empId: string, email: string, pass: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  availableEmployees: Employee[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_USER_KEY = 'dayflow_active_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [inspectingEmployee, setInspectingEmployee] = useState<Employee | null>(null);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [organizationId] = useState<string>(DEFAULT_ORG_ID);

  const syncState = () => {
    const users = getUsers();
    const employees = getEmployees();
    setAvailableEmployees(employees);

    const activeUserId = localStorage.getItem(ACTIVE_USER_KEY);
    let activeUser = users.find(u => u.id === activeUserId);

    // Default session login
    if (!activeUser && users.length > 0) {
      activeUser = users.find(u => u.employeeId === 'EMP-1002') || users[0];
      localStorage.setItem(ACTIVE_USER_KEY, activeUser.id);
    }

    if (activeUser) {
      setCurrentUser(activeUser);
      const emp = getEmployeeById(activeUser.employeeId);
      setCurrentEmployee(emp || null);
    } else {
      setCurrentUser(null);
      setCurrentEmployee(null);
    }
  };

  useEffect(() => {
    syncState();
    const unsubscribe = subscribeToDataChanges(syncState);
    return () => unsubscribe();
  }, []);

  const setInspectingEmployeeId = (empId: string | null) => {
    if (!empId) {
      setInspectingEmployee(null);
      return;
    }
    const emp = getEmployeeById(empId);
    setInspectingEmployee(emp || null);
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass) {
      return { success: false, error: 'Email and password are required fields.' };
    }

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (pass.length < 6) {
      return { success: false, error: 'Invalid password credentials provided.' };
    }

    localStorage.setItem(ACTIVE_USER_KEY, user.id);
    setCurrentUser(user);
    const emp = getEmployeeById(user.employeeId);
    setCurrentEmployee(emp || null);
    setInspectingEmployee(null);
    return { success: true };
  };

  const register = async (empId: string, email: string, pass: string, role: Role): Promise<{ success: boolean; error?: string }> => {
    if (!empId || !email || !pass) {
      return { success: false, error: 'All fields are mandatory for registration.' };
    }

    if (pass.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const employees = getEmployees();
    let emp = employees.find(e => e.employeeId.toUpperCase() === empId.trim().toUpperCase());
    
    if (!emp) {
      const parts = email.split('@')[0].split('.');
      const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'New';
      const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'Employee';
      
      emp = {
        id: `emp-${Date.now()}`,
        employeeId: empId.toUpperCase(),
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        phone: '+1 (555) 000-0000',
        role,
        designation: role === 'ADMIN' || role === 'HR' ? 'HR Specialist' : 'Software Engineer',
        department: role === 'ADMIN' || role === 'HR' ? 'Human Resources' : 'Engineering',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        managerId: null,
        address: '100 Dayflow Way, San Francisco, CA',
        emergencyContact: { name: 'Emergency Contact', relation: 'Family', phone: '+1 (555) 000-0000' },
        documents: [],
        leaveBalance: { paid: 20, paidUsed: 0, sick: 10, sickUsed: 0, unpaid: 10, unpaidUsed: 0 }
      };
      employees.unshift(emp);
      localStorage.setItem('dayflow_employees', JSON.stringify(employees));
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      employeeId: emp.employeeId,
      email: email.trim().toLowerCase(),
      role,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    users.unshift(newUser);
    localStorage.setItem('dayflow_users', JSON.stringify(users));

    localStorage.setItem(ACTIVE_USER_KEY, newUser.id);
    setCurrentUser(newUser);
    setCurrentEmployee(emp);
    setInspectingEmployee(null);
    return { success: true };
  };

  // Phase 9: Clean Logout & Session Isolation
  const logout = () => {
    clearSessionCache();
    setCurrentUser(null);
    setCurrentEmployee(null);
    setInspectingEmployee(null);
  };

  const role: Role = currentUser?.role || 'EMPLOYEE';
  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentEmployee,
        role,
        organizationId,
        isAuthenticated,
        inspectingEmployee,
        setInspectingEmployeeId,
        login,
        register,
        logout,
        availableEmployees,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
