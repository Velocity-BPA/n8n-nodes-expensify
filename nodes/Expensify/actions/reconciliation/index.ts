/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { expensifyExportAndDownload } from '../../transport';
import { getMimeType, getFileExtension, formatDate } from '../../utils';

export async function exportReconciliation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const domain = this.getNodeParameter('domain', index) as string;
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;
	const reconciliationType = this.getNodeParameter('reconciliationType', index, 'unreported') as string;
	const feed = this.getNodeParameter('feed', index, 'export_all_feeds') as string;
	const fileExtension = this.getNodeParameter('fileExtension', index, 'csv') as string;

	const jobDescription: IDataObject = {
		type: 'reconciliation',
		inputSettings: {
			type: reconciliationType,
			startDate: formatDate(startDate),
			endDate: formatDate(endDate),
			domain,
			feed,
		},
		outputSettings: {
			fileExtension,
		},
	};

	const { content, fileName } = await expensifyExportAndDownload.call(
		this,
		jobDescription as any,
	);

	const ext = getFileExtension(fileName) || fileExtension;
	const mimeType = getMimeType(ext);

	// If JSON, parse and return as data
	if (ext === 'json') {
		try {
			const jsonData = JSON.parse(content.toString());
			return [{ json: jsonData }];
		} catch {
			// Return as binary if parsing fails
		}
	}

	return [
		{
			json: {
				fileName,
				fileExtension: ext,
				domain,
				startDate,
				endDate,
				reconciliationType,
				feed,
				success: true,
			},
			binary: {
				data: await this.helpers.prepareBinaryData(content, fileName, mimeType),
			},
		},
	];
}

export async function exportCardTransactions(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const domain = this.getNodeParameter('domain', index) as string;
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;
	const fileExtension = this.getNodeParameter('fileExtension', index, 'csv') as string;

	const jobDescription: IDataObject = {
		type: 'reconciliation',
		inputSettings: {
			type: 'all',
			startDate: formatDate(startDate),
			endDate: formatDate(endDate),
			domain,
			feed: 'export_all_feeds',
		},
		outputSettings: {
			fileExtension,
		},
	};

	const { content, fileName } = await expensifyExportAndDownload.call(
		this,
		jobDescription as any,
	);

	const ext = getFileExtension(fileName) || fileExtension;
	const mimeType = getMimeType(ext);

	if (ext === 'json') {
		try {
			const jsonData = JSON.parse(content.toString());
			return [{ json: jsonData }];
		} catch {
			// Continue to return as binary
		}
	}

	return [
		{
			json: {
				fileName,
				fileExtension: ext,
				domain,
				startDate,
				endDate,
				success: true,
			},
			binary: {
				data: await this.helpers.prepareBinaryData(content, fileName, mimeType),
			},
		},
	];
}
