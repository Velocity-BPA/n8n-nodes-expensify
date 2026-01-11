/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { expensifyApiRequest } from './transport';

interface IPollState {
	lastPollTime?: string;
	seenReportIds?: string[];
}

export class ExpensifyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Expensify Trigger',
		name: 'expensifyTrigger',
		icon: 'file:expensify.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Polls Expensify for new or updated reports',
		defaults: {
			name: 'Expensify Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'expensifyApi',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Approved Reports',
						value: 'approvedReports',
						description: 'Poll for newly approved reports',
					},
					{
						name: 'New Report',
						value: 'newReport',
						description: 'Poll for new reports created',
					},
					{
						name: 'Reimbursed Reports',
						value: 'reimbursedReports',
						description: 'Poll for newly reimbursed reports',
					},
					{
						name: 'Report Status Change',
						value: 'reportStatusChange',
						description: 'Poll for reports with any status change',
					},
					{
						name: 'Submitted Reports',
						value: 'submittedReports',
						description: 'Poll for newly submitted reports',
					},
				],
				default: 'approvedReports',
			},
			{
				displayName: 'Policy ID',
				name: 'policyId',
				type: 'string',
				default: '',
				description: 'Filter reports by policy ID (optional)',
			},
			{
				displayName: 'Employee Email',
				name: 'employeeEmail',
				type: 'string',
				default: '',
				description: 'Filter reports by employee email (optional)',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Initial Lookback Days',
						name: 'initialLookbackDays',
						type: 'number',
						default: 1,
						description: 'Number of days to look back on first poll (max 30)',
					},
					{
						displayName: 'Max Reports Per Poll',
						name: 'maxReports',
						type: 'number',
						default: 100,
						description: 'Maximum number of reports to return per poll',
					},
				],
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const webhookData = this.getWorkflowStaticData('node') as IPollState;
		const event = this.getNodeParameter('event') as string;
		const policyId = this.getNodeParameter('policyId', '') as string;
		const employeeEmail = this.getNodeParameter('employeeEmail', '') as string;
		const options = this.getNodeParameter('options', {}) as IDataObject;

		const initialLookbackDays = Math.min((options.initialLookbackDays as number) || 1, 30);
		const maxReports = (options.maxReports as number) || 100;

		// Calculate date range
		const now = new Date();
		const endDate = now.toISOString().split('T')[0];
		
		let startDate: string;
		if (webhookData.lastPollTime) {
			startDate = webhookData.lastPollTime;
		} else {
			const lookbackDate = new Date(now.getTime() - initialLookbackDays * 24 * 60 * 60 * 1000);
			startDate = lookbackDate.toISOString().split('T')[0];
		}

		// Determine report state based on event
		let reportState: string;
		switch (event) {
			case 'newReport':
				reportState = 'OPEN,SUBMITTED';
				break;
			case 'submittedReports':
				reportState = 'SUBMITTED';
				break;
			case 'approvedReports':
				reportState = 'APPROVED';
				break;
			case 'reimbursedReports':
				reportState = 'REIMBURSED';
				break;
			case 'reportStatusChange':
			default:
				reportState = 'OPEN,SUBMITTED,APPROVED,REIMBURSED';
				break;
		}

		// Build filters
		const filters: IDataObject = {
			startDate,
			endDate,
		};

		if (policyId) {
			filters.policyIDList = policyId;
		}

		// Build input settings
		const inputSettings: IDataObject = {
			type: 'combinedReportData',
			reportState,
			limit: String(maxReports),
			filters,
		};

		if (employeeEmail) {
			inputSettings.employeeEmail = employeeEmail;
		}

		// Request report data as JSON
		const response = await expensifyApiRequest.call(this, {
			type: 'file',
			onReceive: {
				immediateResponse: ['returnRandomFileName'],
			},
			inputSettings,
			outputSettings: {
				fileExtension: 'json',
			},
		});

		// Download the generated file if we got a filename
		let reports: IDataObject[] = [];
		if (response.fileName) {
			const credentials = await this.getCredentials('expensifyApi');
			
			const downloadResponse = await expensifyApiRequest.call(this, {
				type: 'download',
				fileName: response.fileName,
				fileSystem: 'integrationServer',
				credentials: {
					partnerUserID: credentials.partnerUserID as string,
					partnerUserSecret: credentials.partnerUserSecret as string,
				},
			} as any);

			if (typeof downloadResponse === 'string') {
				try {
					const parsed = JSON.parse(downloadResponse);
					reports = (parsed.reports || parsed || []) as IDataObject[];
				} catch {
					reports = [];
				}
			} else if ((downloadResponse as IDataObject).reports) {
				reports = (downloadResponse as IDataObject).reports as IDataObject[];
			}
		}

		// Filter out already seen reports
		const seenIds = webhookData.seenReportIds || [];
		const newReports = reports.filter(
			(report: IDataObject) => !seenIds.includes(report.reportID as string),
		);

		// Update state
		webhookData.lastPollTime = endDate;
		webhookData.seenReportIds = [
			...seenIds,
			...newReports.map((r: IDataObject) => r.reportID as string),
		].slice(-1000); // Keep last 1000 IDs

		if (newReports.length === 0) {
			return null;
		}

		return [
			newReports.map((report: IDataObject) => ({
				json: {
					event,
					...report,
				},
			})),
		];
	}
}
