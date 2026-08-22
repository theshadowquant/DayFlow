import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeAttendance } from './pages/employee/EmployeeAttendance';
import { EmployeeLeave } from './pages/employee/EmployeeLeave';
import { EmployeePayroll } from './pages/employee/EmployeePayroll';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';

// HR / Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmployeeDirectory } from './pages/admin/EmployeeDirectory';
import { HRAttendanceManager } from './pages/admin/HRAttendanceManager';
import { HRLeaveApprovalQueue } from './pages/admin/HRLeaveApprovalQueue';
import { HRPayrollManager } from './pages/admin/HRPayrollManager';
import { HRAnalyticsReports } from './pages/admin/HRAnalyticsReports';
import { HRSettings } from './pages/admin/HRSettings';

const MainContent: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  const renderTabContent = () => {
    if (role === 'EMPLOYEE') {
      switch (currentTab) {
        case 'dashboard':
          return <EmployeeDashboard onNavigate={setCurrentTab} />;
        case 'attendance':
          return <EmployeeAttendance />;
        case 'leave':
          return <EmployeeLeave />;
        case 'payroll':
          return <EmployeePayroll />;
        case 'profile':
          return <EmployeeProfile />;
        default:
          return <EmployeeDashboard onNavigate={setCurrentTab} />;
      }
    } else {
      // ADMIN / HR
      switch (currentTab) {
        case 'dashboard':
          return <AdminDashboard onNavigate={setCurrentTab} />;
        case 'directory':
          return <EmployeeDirectory />;
        case 'hr-attendance':
          return <HRAttendanceManager />;
        case 'hr-approvals':
          return <HRLeaveApprovalQueue />;
        case 'hr-payroll':
          return <HRPayrollManager />;
        case 'hr-analytics':
          return <HRAnalyticsReports />;
        case 'hr-settings':
          return <HRSettings />;
        default:
          return <AdminDashboard onNavigate={setCurrentTab} />;
      }
    }
  };

  return (
    <AppShell currentTab={currentTab} onNavigate={setCurrentTab}>
      {renderTabContent()}
    </AppShell>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
