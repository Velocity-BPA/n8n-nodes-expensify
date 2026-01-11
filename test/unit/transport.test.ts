/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { buildEmployeeCsv } from '../../nodes/Expensify/transport';

describe('Transport Functions', () => {
	describe('buildEmployeeCsv', () => {
		it('should build CSV with headers and single employee', () => {
			const employees = [
				{
					employeeEmail: 'user@example.com',
					managerEmail: 'manager@example.com',
					admin: false,
				},
			];

			const csv = buildEmployeeCsv(employees);
			const lines = csv.split('\n');

			expect(lines[0]).toBe(
				'EmployeeEmail,ManagerEmail,Admin,EmployeeUserId,EmployeePayrollId,ForwardManagerEmail',
			);
			expect(lines[1]).toBe('user@example.com,manager@example.com,false,,,');
		});

		it('should build CSV with multiple employees', () => {
			const employees = [
				{
					employeeEmail: 'user1@example.com',
					managerEmail: 'manager@example.com',
					admin: true,
				},
				{
					employeeEmail: 'user2@example.com',
					managerEmail: 'manager@example.com',
					admin: false,
					employeeUserId: 'EMP001',
				},
			];

			const csv = buildEmployeeCsv(employees);
			const lines = csv.split('\n');

			expect(lines.length).toBe(3);
			expect(lines[1]).toBe('user1@example.com,manager@example.com,true,,,');
			expect(lines[2]).toBe('user2@example.com,manager@example.com,false,EMP001,,');
		});

		it('should handle empty employee array', () => {
			const csv = buildEmployeeCsv([]);
			const lines = csv.split('\n');

			expect(lines.length).toBe(1);
			expect(lines[0]).toBe(
				'EmployeeEmail,ManagerEmail,Admin,EmployeeUserId,EmployeePayrollId,ForwardManagerEmail',
			);
		});

		it('should handle all optional fields', () => {
			const employees = [
				{
					employeeEmail: 'user@example.com',
					managerEmail: 'manager@example.com',
					admin: true,
					employeeUserId: 'EMP001',
					employeePayrollId: 'PAY001',
					forwardManagerEmail: 'forward@example.com',
				},
			];

			const csv = buildEmployeeCsv(employees);
			const lines = csv.split('\n');

			expect(lines[1]).toBe(
				'user@example.com,manager@example.com,true,EMP001,PAY001,forward@example.com',
			);
		});
	});
});
