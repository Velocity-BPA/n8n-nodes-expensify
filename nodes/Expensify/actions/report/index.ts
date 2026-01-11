/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { expensifyExportAndDownload, expensifyApiRequest } from '../../transport';
import { getMimeType, getFileExtension, DEFAULT_CSV_TEMPLATE } from '../../utils';

export async function exportReports(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reportIdList = this.getNodeParameter('reportIdList', index, '') as string;
	const fileExtension = this.getNodeParameter('fileExtension', index, 'csv') as string;
	const markAsExported = this.getNodeParameter('markAsExported', index, false) as boolean;
	const exportLabel = this.getNodeParameter('exportLabel', index, 'n8n Export') as string;
	const useCustomTemplate = this.getNodeParameter('useCustomTemplate', index, false) as boolean;
	const customTemplate = this.getNodeParameter('customTemplate', index, '') as string;

	const inputSettings: IDataObject = {
		type: 'combinedReportData',
	};

	if (reportIdList) {
		inputSettings.filters = {
			reportIDList: reportIdList,
		};
	}

	const jobDescription: IDataObject = {
		type: 'file',
		inputSettings,
		outputSettings: {
			fileExtension,
		},
	};

	if (markAsExported) {
		jobDescription.onFinish = [
			{ actionName: 'markAsExported', label: exportLabel },
		];
	}

	const additionalParams: Record<string, string> = {};
	if (useCustomTemplate && customTemplate) {
		additionalParams.template = customTemplate;
	} else if (fileExtension === 'csv') {
		additionalParams.template = DEFAULT_CSV_TEMPLATE;
	}

	const { content, fileName } = await expensifyExportAndDownload.call(
		this,
		jobDescription as any,
		Object.keys(additionalParams).length > 0 ? additionalParams : undefined,
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
				success: true,
			},
			binary: {
				data: await this.helpers.prepareBinaryData(content, fileName, mimeType),
			},
		},
	];
}

export async function exportByDateRange(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;
	const reportState = this.getNodeParameter('reportState', index, []) as string[];
	const fileExtension = this.getNodeParameter('fileExtension', index, 'csv') as string;
	const limit = this.getNodeParameter('limit', index, '') as string;
	const markAsExported = this.getNodeParameter('markAsExported', index, false) as boolean;
	const exportLabel = this.getNodeParameter('exportLabel', index, 'n8n Export') as string;
	const excludeAlreadyExported = this.getNodeParameter('excludeAlreadyExported', index, false) as boolean;

	const filters: IDataObject = {
		startDate,
		endDate,
	};

	if (excludeAlreadyExported) {
		filters.markedAsExported = exportLabel;
	}

	const inputSettings: IDataObject = {
		type: 'combinedReportData',
		filters,
	};

	if (reportState.length > 0) {
		inputSettings.reportState = reportState.join(',');
	}

	if (limit) {
		inputSettings.limit = limit;
	}

	const jobDescription: IDataObject = {
		type: 'file',
		inputSettings,
		outputSettings: {
			fileExtension,
		},
	};

	if (markAsExported) {
		jobDescription.onFinish = [
			{ actionName: 'markAsExported', label: exportLabel },
		];
	}

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
				startDate,
				endDate,
				reportState: reportState.join(','),
				success: true,
			},
			binary: {
				data: await this.helpers.prepareBinaryData(content, fileName, mimeType),
			},
		},
	];
}

export async function exportByStatus(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reportState = this.getNodeParameter('reportState', index) as string[];
	const fileExtension = this.getNodeParameter('fileExtension', index, 'csv') as string;
	const limit = this.getNodeParameter('limit', index, '') as string;
	const employeeEmail = this.getNodeParameter('employeeEmail', index, '') as string;

	const inputSettings: IDataObject = {
		type: 'combinedReportData',
		reportState: reportState.join(','),
	};

	if (limit) {
		inputSettings.limit = limit;
	}

	if (employeeEmail) {
		inputSettings.employeeEmail = employeeEmail;
	}

	const jobDescription: IDataObject = {
		type: 'file',
		inputSettings,
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
				reportState: reportState.join(','),
				success: true,
			},
			binary: {
				data: await this.helpers.prepareBinaryData(content, fileName, mimeType),
			},
		},
	];
}

export async function downloadFile(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const fileName = this.getNodeParameter('fileName', index) as string;

	const { content } = await expensifyExportAndDownload.call(this, {
		type: 'download',
		fileName,
		fileSystem: 'integrationServer',
	} as any);

	const ext = getFileExtension(fileName);
	const mimeType = getMimeType(ext);

	return [
		{
			json: {
				fileName,
				fileExtension: ext,
				success: true,
			},
			binary: {
				data: await this.helpers.prepareBinaryData(content, fileName, mimeType),
			},
		},
	];
}

export async function updateStatus(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reportIdList = this.getNodeParameter('reportIdList', index) as string;

	const response = await expensifyApiRequest.call(this, {
		type: 'update',
		inputSettings: {
			type: 'reportStatus',
			status: 'REIMBURSED',
			filters: {
				reportIDList: reportIdList,
			},
		},
	});

	return [
		{
			json: {
				success: true,
				reportIdList,
				...response,
			},
		},
	];
}

export async function createReport(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const employeeEmail = this.getNodeParameter('employeeEmail', index) as string;
	const policyId = this.getNodeParameter('policyId', index) as string;
	const title = this.getNodeParameter('title', index, '') as string;

	const inputSettings: IDataObject = {
		type: 'report',
		employeeEmail,
		report: {
			policyID: policyId,
		},
	};

	if (title) {
		(inputSettings.report as IDataObject).title = title;
	}

	const response = await expensifyApiRequest.call(this, {
		type: 'create',
		inputSettings,
	});

	return [
		{
			json: {
				success: true,
				employeeEmail,
				policyId,
				title,
				...response,
			},
		},
	];
}
