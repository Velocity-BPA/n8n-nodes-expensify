/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import * as actions from './actions';

export class Expensify implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Expensify',
		name: 'expensify',
		icon: 'file:expensify.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Expensify API for expense management',
		defaults: {
			name: 'Expensify',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'expensifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Domain Card',
						value: 'domainCard',
					},
					{
						name: 'Employee',
						value: 'employee',
					},
					{
						name: 'Expense',
						value: 'expense',
					},
					{
						name: 'Expense Rule',
						value: 'expenseRule',
					},
					{
						name: 'Policy',
						value: 'policy',
					},
					{
						name: 'Reconciliation',
						value: 'reconciliation',
					},
					{
						name: 'Report',
						value: 'report',
					},
					{
						name: 'Tag Approver',
						value: 'tagApprover',
					},
				],
				default: 'report',
			},

			// Report Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['report'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new report',
						action: 'Create a report',
					},
					{
						name: 'Download File',
						value: 'downloadFile',
						description: 'Download a previously generated export file',
						action: 'Download a file',
					},
					{
						name: 'Export',
						value: 'export',
						description: 'Export reports by ID list',
						action: 'Export reports',
					},
					{
						name: 'Export by Date Range',
						value: 'exportByDateRange',
						description: 'Export reports within a date range',
						action: 'Export reports by date range',
					},
					{
						name: 'Export by Status',
						value: 'exportByStatus',
						description: 'Export reports filtered by status',
						action: 'Export reports by status',
					},
					{
						name: 'Update Status',
						value: 'updateStatus',
						description: 'Mark reports as reimbursed',
						action: 'Update report status',
					},
				],
				default: 'export',
			},

			// Expense Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['expense'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a single expense',
						action: 'Create an expense',
					},
					{
						name: 'Create Batch',
						value: 'createBatch',
						description: 'Create multiple expenses in one request',
						action: 'Create batch expenses',
					},
				],
				default: 'create',
			},

			// Policy Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['policy'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new policy',
						action: 'Create a policy',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get detailed policy information',
						action: 'Get a policy',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get all policies',
						action: 'Get many policies',
					},
					{
						name: 'Update Categories',
						value: 'updateCategories',
						description: 'Add, update, or replace policy categories',
						action: 'Update policy categories',
					},
					{
						name: 'Update Report Fields',
						value: 'updateReportFields',
						description: 'Add, update, or replace policy report fields',
						action: 'Update policy report fields',
					},
					{
						name: 'Update Tags',
						value: 'updateTags',
						description: 'Add, update, or replace policy tags',
						action: 'Update policy tags',
					},
				],
				default: 'getAll',
			},

			// Employee Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['employee'],
					},
				},
				options: [
					{
						name: 'Add',
						value: 'add',
						description: 'Add an employee to a policy',
						action: 'Add an employee',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get all employees on a policy',
						action: 'Get many employees',
					},
					{
						name: 'Remove',
						value: 'remove',
						description: 'Remove an employee from a policy',
						action: 'Remove an employee',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update policy employees via JSON data',
						action: 'Update employees',
					},
				],
				default: 'getAll',
			},

			// Expense Rule Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['expenseRule'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create an expense rule',
						action: 'Create an expense rule',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an expense rule',
						action: 'Delete an expense rule',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an expense rule',
						action: 'Update an expense rule',
					},
				],
				default: 'create',
			},

			// Tag Approver Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['tagApprover'],
					},
				},
				options: [
					{
						name: 'Remove',
						value: 'remove',
						description: 'Remove approver from a tag',
						action: 'Remove tag approver',
					},
					{
						name: 'Set Multiple',
						value: 'setMultiple',
						description: 'Set approvers for multiple tags',
						action: 'Set multiple tag approvers',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Set approver for a tag',
						action: 'Update tag approver',
					},
				],
				default: 'update',
			},

			// Reconciliation Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['reconciliation'],
					},
				},
				options: [
					{
						name: 'Export',
						value: 'export',
						description: 'Export reconciliation data',
						action: 'Export reconciliation data',
					},
					{
						name: 'Export Card Transactions',
						value: 'exportCardTransactions',
						description: 'Export all card transactions for reconciliation',
						action: 'Export card transactions',
					},
				],
				default: 'export',
			},

			// Domain Card Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['domainCard'],
					},
				},
				options: [
					{
						name: 'Get by Number',
						value: 'getByNumber',
						description: 'Get a domain card by card number',
						action: 'Get domain card by number',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get all domain cards',
						action: 'Get many domain cards',
					},
				],
				default: 'getAll',
			},

			// ==================== REPORT FIELDS ====================
			// Export operation fields
			{
				displayName: 'Report ID List',
				name: 'reportIdList',
				type: 'string',
				default: '',
				description: 'Comma-separated list of report IDs (format: R00xxxxxxx)',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['export'],
					},
				},
			},
			{
				displayName: 'File Extension',
				name: 'fileExtension',
				type: 'options',
				options: [
					{ name: 'CSV', value: 'csv' },
					{ name: 'JSON', value: 'json' },
					{ name: 'PDF', value: 'pdf' },
					{ name: 'TXT', value: 'txt' },
					{ name: 'XLS', value: 'xls' },
					{ name: 'XLSX', value: 'xlsx' },
					{ name: 'XML', value: 'xml' },
				],
				default: 'csv',
				description: 'Output file format',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['export', 'exportByDateRange', 'exportByStatus'],
					},
				},
			},
			{
				displayName: 'Mark as Exported',
				name: 'markAsExported',
				type: 'boolean',
				default: false,
				description: 'Whether to mark exported reports with a label',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['export', 'exportByDateRange'],
					},
				},
			},
			{
				displayName: 'Export Label',
				name: 'exportLabel',
				type: 'string',
				default: 'n8n Export',
				description: 'Label to mark exported reports with',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['export', 'exportByDateRange'],
						markAsExported: [true],
					},
				},
			},
			{
				displayName: 'Use Custom Template',
				name: 'useCustomTemplate',
				type: 'boolean',
				default: false,
				description: 'Whether to use a custom FreeMarker template',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['export'],
					},
				},
			},
			{
				displayName: 'Custom Template',
				name: 'customTemplate',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				description: 'FreeMarker template for export formatting',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['export'],
						useCustomTemplate: [true],
					},
				},
			},

			// Export by Date Range fields
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				required: true,
				description: 'Start date for the export range (yyyy-mm-dd)',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['exportByDateRange'],
					},
				},
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				required: true,
				description: 'End date for the export range (yyyy-mm-dd)',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['exportByDateRange'],
					},
				},
			},
			{
				displayName: 'Report States',
				name: 'reportState',
				type: 'multiOptions',
				options: [
					{ name: 'Approved', value: 'APPROVED' },
					{ name: 'Archived', value: 'ARCHIVED' },
					{ name: 'Open', value: 'OPEN' },
					{ name: 'Reimbursed', value: 'REIMBURSED' },
					{ name: 'Submitted', value: 'SUBMITTED' },
				],
				default: [],
				description: 'Filter by report status',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['exportByDateRange', 'exportByStatus'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: '',
				description: 'Maximum number of reports to export',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['exportByDateRange', 'exportByStatus'],
					},
				},
			},
			{
				displayName: 'Exclude Already Exported',
				name: 'excludeAlreadyExported',
				type: 'boolean',
				default: false,
				description: 'Whether to exclude reports already marked with the export label',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['exportByDateRange'],
					},
				},
			},

			// Export by Status fields
			{
				displayName: 'Employee Email',
				name: 'employeeEmail',
				type: 'string',
				default: '',
				description: 'Filter reports by employee email',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['exportByStatus'],
					},
				},
			},

			// Download File fields
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				required: true,
				description: 'Name of the file to download',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['downloadFile'],
					},
				},
			},

			// Update Status fields
			{
				displayName: 'Report ID List',
				name: 'reportIdList',
				type: 'string',
				default: '',
				required: true,
				description: 'Comma-separated list of report IDs to mark as reimbursed',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['updateStatus'],
					},
				},
			},

			// Create Report fields
			{
				displayName: 'Employee Email',
				name: 'employeeEmail',
				type: 'string',
				default: '',
				required: true,
				description: 'Email of the employee to create the report for',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Policy ID',
				name: 'policyId',
				type: 'string',
				default: '',
				required: true,
				description: 'Policy ID to create the report under',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title for the new report',
				displayOptions: {
					show: {
						resource: ['report'],
						operation: ['create'],
					},
				},
			},

			// ==================== EXPENSE FIELDS ====================
			{
				displayName: 'Employee Email',
				name: 'employeeEmail',
				type: 'string',
				default: '',
				required: true,
				description: "Email of the employee's account to create expenses in",
				displayOptions: {
					show: {
						resource: ['expense'],
						operation: ['create', 'createBatch'],
					},
				},
			},
			{
				displayName: 'Merchant',
				name: 'merchant',
				type: 'string',
				default: '',
				required: true,
				description: 'Name of the expense merchant',
				displayOptions: {
					show: {
						resource: ['expense'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Date',
				name: 'created',
				type: 'dateTime',
				default: '',
				required: true,
				description: 'Date of the expense (yyyy-mm-dd)',
				displayOptions: {
					show: {
						resource: ['expense'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				default: 0,
				required: true,
				description: 'Amount in dollars (will be converted to cents)',
				displayOptions: {
					show: {
						resource: ['expense'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'USD',
				description: 'Three-letter currency code (USD, EUR, etc.)',
				displayOptions: {
					show: {
						resource: ['expense'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['expense'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Billable',
						name: 'billable',
						type: 'boolean',
						default: false,
						description: 'Whether the expense is billable',
					},
					{
						displayName: 'Category',
						name: 'category',
						type: 'string',
						default: '',
						description: 'Category name to assign',
					},
					{
						displayName: 'Comment',
						name: 'comment',
						type: 'string',
						default: '',
						description: 'Expense comment/note',
					},
					{
						displayName: 'External ID',
						name: 'externalId',
						type: 'string',
						default: '',
						description: 'Custom unique identifier for the expense',
					},
					{
						displayName: 'Policy ID',
						name: 'policyId',
						type: 'string',
						default: '',
						description: 'Policy ID for tax settings',
					},
					{
						displayName: 'Reimbursable',
						name: 'reimbursable',
						type: 'boolean',
						default: true,
						description: 'Whether the expense is reimbursable',
					},
					{
						displayName: 'Report ID',
						name: 'reportId',
						type: 'string',
						default: '',
						description: 'Report ID to attach expense to',
					},
					{
						displayName: 'Tag',
						name: 'tag',
						type: 'string',
						default: '',
						description: 'Tag name to assign',
					},
				],
			},
			{
				displayName: 'Expenses JSON',
				name: 'expenses',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '[\n  {\n    "merchant": "Office Store",\n    "created": "2024-01-15",\n    "amount": 45.99,\n    "currency": "USD",\n    "category": "Office Supplies"\n  }\n]',
				required: true,
				description: 'JSON array of expenses to create',
				displayOptions: {
					show: {
						resource: ['expense'],
						operation: ['createBatch'],
					},
				},
			},

			// ==================== POLICY FIELDS ====================
			{
				displayName: 'Policy Name',
				name: 'policyName',
				type: 'string',
				default: '',
				required: true,
				description: 'Name for the new policy',
				displayOptions: {
					show: {
						resource: ['policy'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Plan',
				name: 'plan',
				type: 'options',
				options: [
					{ name: 'Corporate', value: 'corporate' },
					{ name: 'Team', value: 'team' },
				],
				default: 'team',
				description: 'Policy plan type',
				displayOptions: {
					show: {
						resource: ['policy'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Policy ID List',
				name: 'policyIdList',
				type: 'string',
				default: '',
				required: true,
				description: 'Comma-separated list of policy IDs',
				displayOptions: {
					show: {
						resource: ['policy'],
						operation: ['get'],
					},
				},
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'multiOptions',
				options: [
					{ name: 'Categories', value: 'categories' },
					{ name: 'Employees', value: 'employees' },
					{ name: 'Report Fields', value: 'reportFields' },
					{ name: 'Tags', value: 'tags' },
					{ name: 'Tax', value: 'tax' },
				],
				default: [],
				description: 'Fields to retrieve from the policy',
				displayOptions: {
					show: {
						resource: ['policy'],
						operation: ['get'],
					},
				},
			},
			{
				displayName: 'Admin Only',
				name: 'adminOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to only get policies where user is admin',
				displayOptions: {
					show: {
						resource: ['policy'],
						operation: ['get', 'getAll'],
					},
				},
			},
			{
				displayName: 'Policy ID',
				name: 'policyId',
				type: 'string',
				default: '',
				required: true,
				description: 'Policy ID to update',
				displayOptions: {
					show: {
						resource: ['policy'],
						operation: ['updateCategories', 'updateTags', 'updateReportFields'],
					},
				},
			},
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{ name: 'Merge', value: 'merge', description: 'Merge with existing data' },
					{ name: 'Replace', value: 'replace', description: 'Replace all existing data' },
				],
				default: 'merge',
				description: 'How to update the data',
				displayOptions: {
					show: {
						resource: ['policy'],
						operation: ['updateCategories', 'updateTags', 'updateReportFields'],
					},
				},
			},
			{
				displayName: 'Categories JSON',
				name: 'categories',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '[\n  {\n    "name": "Travel",\n    "enabled": true,\n    "glCode": "6000"\n  }\n]',
				required: true,
				description: 'JSON array of categories',
				displayOptions: {
					show: {
						resource: ['policy'],
						operation: ['updateCategories'],
					},
				},
			},
			{
				displayName: 'Tags JSON',
				name: 'tags',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '[\n  {\n    "name": "Project A",\n    "enabled": true\n  }\n]',
				required: true,
				description: 'JSON array of tags',
				displayOptions: {
					show: {
						resource: ['policy'],
						operation: ['updateTags'],
					},
				},
			},
			{
				displayName: 'Report Fields JSON',
				name: 'reportFields',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '[\n  {\n    "name": "Department",\n    "type": "dropdown",\n    "values": ["Engineering", "Sales", "Marketing"]\n  }\n]',
				required: true,
				description: 'JSON array of report fields',
				displayOptions: {
					show: {
						resource: ['policy'],
						operation: ['updateReportFields'],
					},
				},
			},

			// ==================== EMPLOYEE FIELDS ====================
			{
				displayName: 'Policy ID',
				name: 'policyId',
				type: 'string',
				default: '',
				required: true,
				description: 'Policy to manage employees on',
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['update', 'getAll', 'add', 'remove'],
					},
				},
			},
			{
				displayName: 'Employees JSON',
				name: 'employees',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '[\n  {\n    "employeeEmail": "user@example.com",\n    "managerEmail": "manager@example.com",\n    "admin": false\n  }\n]',
				required: true,
				description: 'JSON array of employee data',
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['update'],
					},
				},
			},
			{
				displayName: 'Employee Email',
				name: 'employeeEmail',
				type: 'string',
				default: '',
				required: true,
				description: 'Email address of the employee',
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['add', 'remove'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['add'],
					},
				},
				options: [
					{
						displayName: 'Admin',
						name: 'admin',
						type: 'boolean',
						default: false,
						description: 'Whether user has admin privileges',
					},
					{
						displayName: 'Employee Payroll ID',
						name: 'employeePayrollId',
						type: 'string',
						default: '',
						description: 'Payroll ID for the employee',
					},
					{
						displayName: 'Employee User ID',
						name: 'employeeUserId',
						type: 'string',
						default: '',
						description: 'Custom user ID',
					},
					{
						displayName: 'Forward Manager Email',
						name: 'forwardManagerEmail',
						type: 'string',
						default: '',
						description: 'Forward-to manager email',
					},
					{
						displayName: 'Manager Email',
						name: 'managerEmail',
						type: 'string',
						default: '',
						description: 'Manager/submits-to email address',
					},
				],
			},

			// ==================== EXPENSE RULE FIELDS ====================
			{
				displayName: 'Policy ID',
				name: 'policyId',
				type: 'string',
				default: '',
				required: true,
				description: 'Policy the rule belongs to',
				displayOptions: {
					show: {
						resource: ['expenseRule'],
						operation: ['create', 'update', 'delete'],
					},
				},
			},
			{
				displayName: 'Employee Email',
				name: 'employeeEmail',
				type: 'string',
				default: '',
				required: true,
				description: 'Employee to create/update rule for',
				displayOptions: {
					show: {
						resource: ['expenseRule'],
						operation: ['create', 'update', 'delete'],
					},
				},
			},
			{
				displayName: 'Rule ID',
				name: 'ruleId',
				type: 'string',
				default: '',
				required: true,
				description: 'ID of the rule to update or delete',
				displayOptions: {
					show: {
						resource: ['expenseRule'],
						operation: ['update', 'delete'],
					},
				},
			},
			{
				displayName: 'Tag',
				name: 'tag',
				type: 'string',
				default: '',
				description: 'Tag to apply via this rule',
				displayOptions: {
					show: {
						resource: ['expenseRule'],
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: 'Default Billable',
				name: 'defaultBillable',
				type: 'boolean',
				default: false,
				description: 'Whether expenses should be billable by default',
				displayOptions: {
					show: {
						resource: ['expenseRule'],
						operation: ['create', 'update'],
					},
				},
			},

			// ==================== TAG APPROVER FIELDS ====================
			{
				displayName: 'Policy ID',
				name: 'policyId',
				type: 'string',
				default: '',
				required: true,
				description: 'Policy to update tag approvers for',
				displayOptions: {
					show: {
						resource: ['tagApprover'],
						operation: ['update', 'remove', 'setMultiple'],
					},
				},
			},
			{
				displayName: 'Tag Name',
				name: 'tagName',
				type: 'string',
				default: '',
				required: true,
				description: 'Name of the tag',
				displayOptions: {
					show: {
						resource: ['tagApprover'],
						operation: ['update', 'remove'],
					},
				},
			},
			{
				displayName: 'Approver Email',
				name: 'approverEmail',
				type: 'string',
				default: '',
				required: true,
				description: 'Email of the policy member to approve expenses with this tag',
				displayOptions: {
					show: {
						resource: ['tagApprover'],
						operation: ['update'],
					},
				},
			},
			{
				displayName: 'Tag Approvers JSON',
				name: 'tagApprovers',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '[\n  {\n    "tagName": "Project A",\n    "approverEmail": "approver@example.com"\n  }\n]',
				required: true,
				description: 'JSON array of tag approver assignments',
				displayOptions: {
					show: {
						resource: ['tagApprover'],
						operation: ['setMultiple'],
					},
				},
			},

			// ==================== RECONCILIATION FIELDS ====================
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				required: true,
				description: 'Domain to run reconciliation for',
				displayOptions: {
					show: {
						resource: ['reconciliation'],
						operation: ['export', 'exportCardTransactions'],
					},
				},
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				required: true,
				description: 'Start date for expenses (yyyy-mm-dd)',
				displayOptions: {
					show: {
						resource: ['reconciliation'],
						operation: ['export', 'exportCardTransactions'],
					},
				},
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				required: true,
				description: 'End date for expenses (yyyy-mm-dd)',
				displayOptions: {
					show: {
						resource: ['reconciliation'],
						operation: ['export', 'exportCardTransactions'],
					},
				},
			},
			{
				displayName: 'Reconciliation Type',
				name: 'reconciliationType',
				type: 'options',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Unreported', value: 'unreported' },
				],
				default: 'unreported',
				description: 'Type of reconciliation export',
				displayOptions: {
					show: {
						resource: ['reconciliation'],
						operation: ['export'],
					},
				},
			},
			{
				displayName: 'Feed',
				name: 'feed',
				type: 'string',
				default: 'export_all_feeds',
				description: 'Card feed name or "export_all_feeds"',
				displayOptions: {
					show: {
						resource: ['reconciliation'],
						operation: ['export'],
					},
				},
			},
			{
				displayName: 'File Extension',
				name: 'fileExtension',
				type: 'options',
				options: [
					{ name: 'CSV', value: 'csv' },
					{ name: 'JSON', value: 'json' },
					{ name: 'TXT', value: 'txt' },
					{ name: 'XML', value: 'xml' },
				],
				default: 'csv',
				description: 'Output file format',
				displayOptions: {
					show: {
						resource: ['reconciliation'],
						operation: ['export', 'exportCardTransactions'],
					},
				},
			},

			// ==================== DOMAIN CARD FIELDS ====================
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				required: true,
				description: 'Domain name to get cards for',
				displayOptions: {
					show: {
						resource: ['domainCard'],
						operation: ['getAll', 'getByNumber'],
					},
				},
			},
			{
				displayName: 'Card Number',
				name: 'cardNumber',
				type: 'string',
				default: '',
				required: true,
				description: 'Card number or last four digits to search for',
				displayOptions: {
					show: {
						resource: ['domainCard'],
						operation: ['getByNumber'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[] = [];

				switch (resource) {
					case 'report':
						switch (operation) {
							case 'export':
								result = await actions.report.exportReports.call(this, i);
								break;
							case 'exportByDateRange':
								result = await actions.report.exportByDateRange.call(this, i);
								break;
							case 'exportByStatus':
								result = await actions.report.exportByStatus.call(this, i);
								break;
							case 'downloadFile':
								result = await actions.report.downloadFile.call(this, i);
								break;
							case 'updateStatus':
								result = await actions.report.updateStatus.call(this, i);
								break;
							case 'create':
								result = await actions.report.createReport.call(this, i);
								break;
						}
						break;

					case 'expense':
						switch (operation) {
							case 'create':
								result = await actions.expense.createExpense.call(this, i);
								break;
							case 'createBatch':
								result = await actions.expense.createBatchExpenses.call(this, i);
								break;
						}
						break;

					case 'policy':
						switch (operation) {
							case 'create':
								result = await actions.policy.createPolicy.call(this, i);
								break;
							case 'get':
								result = await actions.policy.getPolicy.call(this, i);
								break;
							case 'getAll':
								result = await actions.policy.getAllPolicies.call(this, i);
								break;
							case 'updateCategories':
								result = await actions.policy.updateCategories.call(this, i);
								break;
							case 'updateTags':
								result = await actions.policy.updateTags.call(this, i);
								break;
							case 'updateReportFields':
								result = await actions.policy.updateReportFields.call(this, i);
								break;
						}
						break;

					case 'employee':
						switch (operation) {
							case 'update':
								result = await actions.employee.updateEmployees.call(this, i);
								break;
							case 'getAll':
								result = await actions.employee.getAllEmployees.call(this, i);
								break;
							case 'add':
								result = await actions.employee.addEmployee.call(this, i);
								break;
							case 'remove':
								result = await actions.employee.removeEmployee.call(this, i);
								break;
						}
						break;

					case 'expenseRule':
						switch (operation) {
							case 'create':
								result = await actions.expenseRule.createExpenseRule.call(this, i);
								break;
							case 'update':
								result = await actions.expenseRule.updateExpenseRule.call(this, i);
								break;
							case 'delete':
								result = await actions.expenseRule.deleteExpenseRule.call(this, i);
								break;
						}
						break;

					case 'tagApprover':
						switch (operation) {
							case 'update':
								result = await actions.tagApprover.updateTagApprover.call(this, i);
								break;
							case 'remove':
								result = await actions.tagApprover.removeTagApprover.call(this, i);
								break;
							case 'setMultiple':
								result = await actions.tagApprover.setMultipleTagApprovers.call(this, i);
								break;
						}
						break;

					case 'reconciliation':
						switch (operation) {
							case 'export':
								result = await actions.reconciliation.exportReconciliation.call(this, i);
								break;
							case 'exportCardTransactions':
								result = await actions.reconciliation.exportCardTransactions.call(this, i);
								break;
						}
						break;

					case 'domainCard':
						switch (operation) {
							case 'getAll':
								result = await actions.domainCard.getAllDomainCards.call(this, i);
								break;
							case 'getByNumber':
								result = await actions.domainCard.getDomainCardByNumber.call(this, i);
								break;
						}
						break;
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
