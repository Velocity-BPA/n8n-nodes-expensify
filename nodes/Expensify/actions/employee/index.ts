/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { expensifyApiRequest, buildEmployeeCsv } from '../../transport';

export async function updateEmployees(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const employeesJson = this.getNodeParameter('employees', index) as string;

	let employees: IDataObject[];
	try {
		employees = JSON.parse(employeesJson);
		if (!Array.isArray(employees)) {
			throw new Error('Employees must be an array');
		}
	} catch (error) {
		throw new Error(`Invalid employees JSON: ${(error as Error).message}`);
	}

	// Build CSV data for the employee updater
	const csvData = buildEmployeeCsv(employees);

	const response = await expensifyApiRequest.call(
		this,
		{
			type: 'update',
			inputSettings: {
				type: 'employees',
				policyID: policyId,
				fileType: 'csv',
			},
		},
		{
			data: csvData,
		},
	);

	return [
		{
			json: {
				success: true,
				policyId,
				employeeCount: employees.length,
				...response,
			},
		},
	];
}

export async function getAllEmployees(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;

	const response = await expensifyApiRequest.call(this, {
		type: 'get',
		inputSettings: {
			type: 'policy',
			policyIDList: [policyId],
			fields: ['employees'],
		},
	});

	if (response.policyInfo && Array.isArray(response.policyInfo) && response.policyInfo.length > 0) {
		const policyInfo = response.policyInfo[0] as IDataObject;
		if (policyInfo.employees && Array.isArray(policyInfo.employees)) {
			return (policyInfo.employees as IDataObject[]).map((employee) => ({
				json: {
					policyId,
					...employee,
				},
			}));
		}
	}

	return [
		{
			json: {
				policyId,
				employees: [],
			},
		},
	];
}

export async function addEmployee(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const employeeEmail = this.getNodeParameter('employeeEmail', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const employee: IDataObject = {
		employeeEmail,
	};

	if (additionalFields.managerEmail) {
		employee.managerEmail = additionalFields.managerEmail;
	}
	if (additionalFields.admin !== undefined) {
		employee.admin = additionalFields.admin;
	}
	if (additionalFields.employeeUserId) {
		employee.employeeUserId = additionalFields.employeeUserId;
	}
	if (additionalFields.employeePayrollId) {
		employee.employeePayrollId = additionalFields.employeePayrollId;
	}
	if (additionalFields.forwardManagerEmail) {
		employee.forwardManagerEmail = additionalFields.forwardManagerEmail;
	}

	const csvData = buildEmployeeCsv([employee]);

	const response = await expensifyApiRequest.call(
		this,
		{
			type: 'update',
			inputSettings: {
				type: 'employees',
				policyID: policyId,
				fileType: 'csv',
			},
		},
		{
			data: csvData,
		},
	);

	return [
		{
			json: {
				success: true,
				policyId,
				employee,
				...response,
			},
		},
	];
}

export async function removeEmployee(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const employeeEmail = this.getNodeParameter('employeeEmail', index) as string;

	// To remove an employee, we send an empty manager which disassociates them
	const csvData = `EmployeeEmail,ManagerEmail,Admin\n${employeeEmail},,`;

	const response = await expensifyApiRequest.call(
		this,
		{
			type: 'update',
			inputSettings: {
				type: 'employees',
				policyID: policyId,
				fileType: 'csv',
				delete: true,
			},
		},
		{
			data: csvData,
		},
	);

	return [
		{
			json: {
				success: true,
				policyId,
				employeeEmail,
				action: 'removed',
				...response,
			},
		},
	];
}
