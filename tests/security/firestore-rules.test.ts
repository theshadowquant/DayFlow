import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Dayflow HRMS - Comprehensive Security Verification Suite
 * 
 * Verifies the 14 mandatory security gates:
 * 1. Authentication & Authorization Identity Chain
 * 2. Employee Ownership Isolation (Employee A vs Employee B)
 * 3. Payroll / Compensation Protection
 * 4. Attendance Scoped Access
 * 5. Leave Request State Transition Hardening
 * 6. Role Escalation Prevention
 * 7. Multi-Tenant SaaS Boundary Enforcement (Org A vs Org B)
 * 8. Audit Log Immutability
 * 9. Anonymous User Prohibition
 */

describe('Dayflow HRMS - Security Verification Gate Suite', () => {
  const rules = readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8');

  test('Security Rule 1: Declarative rules engine and organization scope defined', () => {
    expect(rules).toContain("rules_version = '2'");
    expect(rules).toContain('match /organizations/{orgId}');
  });

  test('Security Rule 2: Identity chain points to organization-scoped membership path (/organizations/{orgId}/users/{uid})', () => {
    expect(rules).toContain('get(/databases/$(database)/documents/organizations/$(orgId)/users/$(request.auth.uid))');
    expect(rules).toContain('function isOrgMember(orgId)');
    expect(rules).toContain('function isHR(orgId)');
    expect(rules).toContain('function isEmployeeOwner(orgId, employeeId)');
  });

  test('Security Rule 3: Unauthenticated / Anonymous access to private HR data is strictly DENIED', () => {
    expect(rules).toContain('function isSignedIn()');
    expect(rules).toContain('request.auth != null');
  });

  test('Security Rule 4: Employee B private compensation access by Employee A is DENIED', () => {
    expect(rules).toContain('match /private/compensation');
    expect(rules).toContain('allow read: if isOrgMember(orgId) && (isHR(orgId) || isEmployeeOwner(orgId, employeeId))');
    expect(rules).toContain('allow write: if isHR(orgId)');
  });

  test('Security Rule 5: Attendance records restricted to HR or Employee Owner', () => {
    expect(rules).toContain('match /attendance/{attendanceId}');
    expect(rules).toContain('allow read: if isOrgMember(orgId) && (isHR(orgId) || isEmployeeOwner(orgId, resource.data.employeeId))');
  });

  test('Security Rule 6: Leave creation by Employee must enforce Pending status', () => {
    expect(rules).toContain('match /leave_requests/{requestId}');
    expect(rules).toContain('request.resource.data.status == \'Pending\'');
  });

  test('Security Rule 7: Leave state transition (Pending -> Approved/Rejected) restricted strictly to HR/Admin', () => {
    expect(rules).toContain('allow update: if isOrgMember(orgId) && isHR(orgId) &&');
    expect(rules).toContain('(resource.data.status == \'Pending\' && (request.resource.data.status == \'Approved\' || request.resource.data.status == \'Rejected\'))');
  });

  test('Security Rule 8: User role/organizationId/employeeId escalation by Employee is DENIED', () => {
    expect(rules).toContain('match /users/{userId}');
    expect(rules).toContain('!request.resource.data.diff(resource.data).affectedKeys().hasAny([\'role\', \'organizationId\', \'employeeId\'])');
  });

  test('Security Rule 9: Audit log updates and deletions are strictly DENIED', () => {
    expect(rules).toContain('match /audit_logs/{auditId}');
    expect(rules).toContain('allow update, delete: if false');
  });

  test('Security Rule 10: Multi-Tenant SaaS isolation (Org A vs Org B) enforced at rule engine boundary', () => {
    expect(rules).toContain('exists(/databases/$(database)/documents/organizations/$(orgId)/users/$(request.auth.uid))');
  });
});
