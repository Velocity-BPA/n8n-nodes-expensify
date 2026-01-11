/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { expensifyApiRequest } from '../../transport';

export async function createExpenseRule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const employeeEmail = this.getNodeParameter('employeeEmail', index) as string;
	const tag = this.getNodeParameter('tag', index, '') as string;
	const defaultBillable = this.getNodeParameter('defaultBillable', index, false) as boolean;

	const actions: IDataObject = {};
	if (tag) {
		actions.tag = tag;
	}
	if (defaultBillable !== undefined) {
		actions.defaultBillable = defaultBillable;
	}

	const response = await expensifyApiRequest.call(this, {
		type: 'update',
		inputSettings: {
			type: 'expenseRules',
			policyID: policyId,
			employeeEmail,
			expenseRules: [
				{
					actions,
				},
			],
		},
	});

	return [
		{
			json: {
				success: true,
				policyId,
				employeeEmail,
				actions,
				...response,
			},
		},
	];
}

export async function updateExpenseRule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const employeeEmail = this.getNodeParameter('employeeEmail', index) as string;
	const ruleId = this.getNodeParameter('ruleId', index) as string;
	const tag = this.getNodeParameter('tag', index, '') as string;
	const defaultBillable = this.getNodeParameter('defaultBillable', index, undefined) as boolean | undefined;

	const actions: IDataObject = {};
	if (tag) {
		actions.tag = tag;
	}
	if (defaultBillable !== undefined) {
		actions.defaultBillable = defaultBillable;
	}

	const response = await expensifyApiRequest.call(this, {
		type: 'update',
		inputSettings: {
			type: 'expenseRules',
			policyID: policyId,
			employeeEmail,
			expenseRules: [
				{
					ruleID: ruleId,
					actions,
				},
			],
		},
	});

	return [
		{
			json: {
				success: true,
				policyId,
				employeeEmail,
				ruleId,
				actions,
				...response,
			},
		},
	];
}

export async function deleteExpenseRule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const employeeEmail = this.getNodeParameter('employeeEmail', index) as string;
	const ruleId = this.getNodeParameter('ruleId', index) as string;

	const response = await expensifyApiRequest.call(this, {
		type: 'update',
		inputSettings: {
			type: 'expenseRules',
			policyID: policyId,
			employeeEmail,
			expenseRules: [
				{
					ruleID: ruleId,
					delete: true,
				},
			],
		},
	});

	return [
		{
			json: {
				success: true,
				policyId,
				employeeEmail,
				ruleId,
				action: 'deleted',
				...response,
			},
		},
	];
}
