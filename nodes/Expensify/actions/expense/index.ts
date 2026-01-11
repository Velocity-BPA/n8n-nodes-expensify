/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { expensifyApiRequest } from '../../transport';
import { amountToCents, formatDate } from '../../utils';

export async function createExpense(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const employeeEmail = this.getNodeParameter('employeeEmail', index) as string;
	const merchant = this.getNodeParameter('merchant', index) as string;
	const created = this.getNodeParameter('created', index) as string;
	const amount = this.getNodeParameter('amount', index) as number;
	const currency = this.getNodeParameter('currency', index, 'USD') as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const transaction: IDataObject = {
		created: formatDate(created),
		merchant,
		amount: amountToCents(amount),
		currency: currency.toUpperCase(),
	};

	if (additionalFields.category) {
		transaction.category = additionalFields.category;
	}
	if (additionalFields.tag) {
		transaction.tag = additionalFields.tag;
	}
	if (additionalFields.billable !== undefined) {
		transaction.billable = additionalFields.billable;
	}
	if (additionalFields.reimbursable !== undefined) {
		transaction.reimbursable = additionalFields.reimbursable;
	}
	if (additionalFields.comment) {
		transaction.comment = additionalFields.comment;
	}
	if (additionalFields.reportId) {
		transaction.reportID = additionalFields.reportId;
	}
	if (additionalFields.policyId) {
		transaction.policyID = additionalFields.policyId;
	}
	if (additionalFields.externalId) {
		transaction.externalID = additionalFields.externalId;
	}

	const response = await expensifyApiRequest.call(this, {
		type: 'create',
		inputSettings: {
			type: 'expenses',
			employeeEmail,
			transactionList: [transaction],
		},
	});

	return [
		{
			json: {
				success: true,
				employeeEmail,
				transaction,
				...response,
			},
		},
	];
}

export async function createBatchExpenses(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const employeeEmail = this.getNodeParameter('employeeEmail', index) as string;
	const expensesJson = this.getNodeParameter('expenses', index) as string;

	let expenses: IDataObject[];
	try {
		expenses = JSON.parse(expensesJson);
		if (!Array.isArray(expenses)) {
			throw new Error('Expenses must be an array');
		}
	} catch (error) {
		throw new Error(`Invalid expenses JSON: ${(error as Error).message}`);
	}

	const transactionList = expenses.map((expense) => {
		const transaction: IDataObject = {
			created: expense.created ? formatDate(expense.created as string) : formatDate(new Date()),
			merchant: expense.merchant || 'Unknown',
			amount: expense.amount ? amountToCents(expense.amount as number) : 0,
			currency: ((expense.currency as string) || 'USD').toUpperCase(),
		};

		if (expense.category) transaction.category = expense.category;
		if (expense.tag) transaction.tag = expense.tag;
		if (expense.billable !== undefined) transaction.billable = expense.billable;
		if (expense.reimbursable !== undefined) transaction.reimbursable = expense.reimbursable;
		if (expense.comment) transaction.comment = expense.comment;
		if (expense.reportId || expense.reportID) transaction.reportID = expense.reportId || expense.reportID;
		if (expense.policyId || expense.policyID) transaction.policyID = expense.policyId || expense.policyID;
		if (expense.externalId || expense.externalID) transaction.externalID = expense.externalId || expense.externalID;

		return transaction;
	});

	const response = await expensifyApiRequest.call(this, {
		type: 'create',
		inputSettings: {
			type: 'expenses',
			employeeEmail,
			transactionList,
		},
	});

	return [
		{
			json: {
				success: true,
				employeeEmail,
				expenseCount: transactionList.length,
				...response,
			},
		},
	];
}
