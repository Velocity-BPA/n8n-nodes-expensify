/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { expensifyApiRequest } from '../../transport';

export async function updateTagApprover(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const tagName = this.getNodeParameter('tagName', index) as string;
	const approverEmail = this.getNodeParameter('approverEmail', index) as string;

	const response = await expensifyApiRequest.call(this, {
		type: 'update',
		inputSettings: {
			type: 'tags',
			policyID: policyId,
			tags: {
				action: 'merge',
				data: [
					{
						name: tagName,
						approver: approverEmail,
					},
				],
			},
		},
	});

	return [
		{
			json: {
				success: true,
				policyId,
				tagName,
				approverEmail,
				...response,
			},
		},
	];
}

export async function removeTagApprover(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const tagName = this.getNodeParameter('tagName', index) as string;

	const response = await expensifyApiRequest.call(this, {
		type: 'update',
		inputSettings: {
			type: 'tags',
			policyID: policyId,
			tags: {
				action: 'merge',
				data: [
					{
						name: tagName,
						approver: '',
					},
				],
			},
		},
	});

	return [
		{
			json: {
				success: true,
				policyId,
				tagName,
				action: 'approver_removed',
				...response,
			},
		},
	];
}

export async function setMultipleTagApprovers(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const policyId = this.getNodeParameter('policyId', index) as string;
	const tagApproversJson = this.getNodeParameter('tagApprovers', index) as string;

	let tagApprovers: IDataObject[];
	try {
		tagApprovers = JSON.parse(tagApproversJson);
		if (!Array.isArray(tagApprovers)) {
			throw new Error('Tag approvers must be an array');
		}
	} catch (error) {
		throw new Error(`Invalid tag approvers JSON: ${(error as Error).message}`);
	}

	const data = tagApprovers.map((ta) => ({
		name: ta.tagName || ta.name,
		approver: ta.approverEmail || ta.approver,
	}));

	const response = await expensifyApiRequest.call(this, {
		type: 'update',
		inputSettings: {
			type: 'tags',
			policyID: policyId,
			tags: {
				action: 'merge',
				data,
			},
		},
	});

	return [
		{
			json: {
				success: true,
				policyId,
				tagApproverCount: data.length,
				...response,
			},
		},
	];
}
