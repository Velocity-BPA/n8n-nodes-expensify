/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { expensifyApiRequest } from '../../transport';
import { parsePolicyIds } from '../../utils';

export async function createPolicy(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyName = this.getNodeParameter('policyName', index) as string;
	const plan = this.getNodeParameter('plan', index, 'team') as string;

	const response = await expensifyApiRequest.call(this, {
		type: 'create',
		inputSettings: {
			type: 'policy',
			policyName,
			plan,
		},
	});

	return [
		{
			json: {
				success: true,
				policyName,
				plan,
				...response,
			},
		},
	];
}

export async function getPolicy(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyIdList = this.getNodeParameter('policyIdList', index) as string;
	const fields = this.getNodeParameter('fields', index, []) as string[];
	const adminOnly = this.getNodeParameter('adminOnly', index, false) as boolean;

	const inputSettings: IDataObject = {
		type: 'policy',
		policyIDList: parsePolicyIds(policyIdList),
	};

	if (fields.length > 0) {
		inputSettings.fields = fields;
	}

	if (adminOnly) {
		inputSettings.adminOnly = true;
	}

	const response = await expensifyApiRequest.call(this, {
		type: 'get',
		inputSettings,
	});

	if (response.policyInfo && Array.isArray(response.policyInfo)) {
		return response.policyInfo.map((policy) => ({
			json: policy as unknown as IDataObject,
		}));
	}

	return [{ json: response as unknown as IDataObject }];
}

export async function getAllPolicies(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const adminOnly = this.getNodeParameter('adminOnly', index, false) as boolean;

	const inputSettings: IDataObject = {
		type: 'policy',
		fields: [],
	};

	if (adminOnly) {
		inputSettings.adminOnly = true;
	}

	const response = await expensifyApiRequest.call(this, {
		type: 'get',
		inputSettings,
	});

	if (response.policyList && Array.isArray(response.policyList)) {
		return response.policyList.map((policy) => ({
			json: policy as unknown as IDataObject,
		}));
	}

	return [{ json: response as unknown as IDataObject }];
}

export async function updateCategories(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const action = this.getNodeParameter('action', index, 'merge') as string;
	const categoriesJson = this.getNodeParameter('categories', index) as string;

	let categories: IDataObject[];
	try {
		categories = JSON.parse(categoriesJson);
		if (!Array.isArray(categories)) {
			throw new Error('Categories must be an array');
		}
	} catch (error) {
		throw new Error(`Invalid categories JSON: ${(error as Error).message}`);
	}

	const inputSettings: IDataObject = {
		type: 'categories',
		policyID: policyId,
		categories: {
			action,
			data: categories,
		},
	};

	const response = await expensifyApiRequest.call(this, {
		type: 'update',
		inputSettings,
	});

	return [
		{
			json: {
				success: true,
				policyId,
				action,
				categoryCount: categories.length,
				...response,
			},
		},
	];
}

export async function updateTags(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const action = this.getNodeParameter('action', index, 'merge') as string;
	const tagsJson = this.getNodeParameter('tags', index) as string;

	let tags: IDataObject[];
	try {
		tags = JSON.parse(tagsJson);
		if (!Array.isArray(tags)) {
			throw new Error('Tags must be an array');
		}
	} catch (error) {
		throw new Error(`Invalid tags JSON: ${(error as Error).message}`);
	}

	const inputSettings: IDataObject = {
		type: 'tags',
		policyID: policyId,
		tags: {
			action,
			data: tags,
		},
	};

	const response = await expensifyApiRequest.call(this, {
		type: 'update',
		inputSettings,
	});

	return [
		{
			json: {
				success: true,
				policyId,
				action,
				tagCount: tags.length,
				...response,
			},
		},
	];
}

export async function updateReportFields(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const action = this.getNodeParameter('action', index, 'merge') as string;
	const reportFieldsJson = this.getNodeParameter('reportFields', index) as string;

	let reportFields: IDataObject[];
	try {
		reportFields = JSON.parse(reportFieldsJson);
		if (!Array.isArray(reportFields)) {
			throw new Error('Report fields must be an array');
		}
	} catch (error) {
		throw new Error(`Invalid report fields JSON: ${(error as Error).message}`);
	}

	const inputSettings: IDataObject = {
		type: 'reportFields',
		policyID: policyId,
		reportFields: {
			action,
			data: reportFields,
		},
	};

	const response = await expensifyApiRequest.call(this, {
		type: 'update',
		inputSettings,
	});

	return [
		{
			json: {
				success: true,
				policyId,
				action,
				reportFieldCount: reportFields.length,
				...response,
			},
		},
	];
}
