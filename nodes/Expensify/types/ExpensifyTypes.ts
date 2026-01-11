/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface IExpensifyCredentials {
	partnerUserID: string;
	partnerUserSecret: string;
}

export interface IExpensifyJobDescription {
	type: string;
	credentials?: {
		partnerUserID: string;
		partnerUserSecret: string;
	};
	inputSettings?: IExpensifyInputSettings;
	onReceive?: IExpensifyOnReceive;
	outputSettings?: IExpensifyOutputSettings;
	onFinish?: IExpensifyOnFinishAction[];
	fileName?: string;
	fileSystem?: 'integrationServer' | 'reconciliation';
	[key: string]: unknown;
}

export interface IExpensifyInputSettings {
	type: string;
	reportState?: string;
	limit?: string;
	filters?: IExpensifyFilters;
	employeeEmail?: string;
	transactionList?: IExpensifyTransaction[];
	policyIDList?: string[];
	fields?: string[];
	adminOnly?: boolean;
	policyName?: string;
	plan?: 'team' | 'corporate';
	categories?: IExpensifyCategory[];
	tags?: IExpensifyTag[];
	reportFields?: IExpensifyReportField[];
	employees?: IExpensifyEmployee[];
	expenseRules?: IExpensifyExpenseRule[];
	[key: string]: unknown;
}

export interface IExpensifyFilters {
	startDate?: string;
	endDate?: string;
	markedAsExported?: string;
	reportIDList?: string;
	policyIDList?: string;
	approvedAfter?: string;
	[key: string]: unknown;
}

export interface IExpensifyOnReceive {
	immediateResponse?: string[];
}

export interface IExpensifyOutputSettings {
	fileExtension?: string;
	fileBasename?: string;
	includeFullPageReceiptsPdf?: boolean;
}

export interface IExpensifyOnFinishAction {
	actionName: string;
	label?: string;
	[key: string]: unknown;
}

export interface IExpensifyTransaction {
	created: string;
	currency: string;
	merchant: string;
	amount: number;
	category?: string;
	tag?: string;
	billable?: boolean;
	reimbursable?: boolean;
	comment?: string;
	reportID?: string;
	policyID?: string;
	externalID?: string;
	[key: string]: unknown;
}

export interface IExpensifyCategory {
	name: string;
	enabled?: boolean;
	glCode?: string;
	payrollCode?: string;
	commentHint?: string;
	areCommentsRequired?: boolean;
	maxExpenseAmount?: number;
	[key: string]: unknown;
}

export interface IExpensifyTag {
	name: string;
	enabled?: boolean;
	glCode?: string;
	[key: string]: unknown;
}

export interface IExpensifyReportField {
	name: string;
	type: 'text' | 'dropdown' | 'date';
	values?: string[];
	defaultValue?: string;
	[key: string]: unknown;
}

export interface IExpensifyEmployee {
	employeeEmail: string;
	managerEmail?: string;
	admin?: boolean;
	employeeUserId?: string;
	employeePayrollId?: string;
	forwardManagerEmail?: string;
	[key: string]: unknown;
}

export interface IExpensifyExpenseRule {
	ruleID?: string;
	actions?: IExpensifyRuleAction;
	[key: string]: unknown;
}

export interface IExpensifyRuleAction {
	tag?: string;
	defaultBillable?: boolean;
	[key: string]: unknown;
}

export interface IExpensifyApiResponse {
	responseCode?: number;
	responseMessage?: string;
	policyInfo?: IExpensifyPolicyInfo[];
	policyList?: IExpensifyPolicyListItem[];
	fileName?: string;
	transactionList?: IExpensifyTransactionResponse[];
	[key: string]: unknown;
}

export interface IExpensifyPolicyInfo {
	id: string;
	name: string;
	type: string;
	outputCurrency: string;
	categories?: IExpensifyCategory[];
	tags?: IExpensifyTagLevel[];
	reportFields?: IExpensifyReportField[];
	tax?: IExpensifyTax;
	employees?: IExpensifyPolicyEmployee[];
	[key: string]: unknown;
}

export interface IExpensifyTagLevel {
	name: string;
	tags: IExpensifyTag[];
	[key: string]: unknown;
}

export interface IExpensifyTax {
	name?: string;
	ratesCount?: number;
	rates?: IExpensifyTaxRate[];
	[key: string]: unknown;
}

export interface IExpensifyTaxRate {
	name: string;
	rate: number;
	[key: string]: unknown;
}

export interface IExpensifyPolicyEmployee {
	email: string;
	role: string;
	[key: string]: unknown;
}

export interface IExpensifyPolicyListItem {
	id: string;
	name: string;
	type: string;
	role: string;
	outputCurrency: string;
	[key: string]: unknown;
}

export interface IExpensifyTransactionResponse {
	transactionID: string;
	reportID: string;
	[key: string]: unknown;
}

export interface IExpensifyReport {
	reportID: string;
	reportName: string;
	status: string;
	total: number;
	currency: string;
	submitterEmail: string;
	created: string;
	transactionList?: IExpensifyTransaction[];
	[key: string]: unknown;
}

export type ExpensifyReportState = 
	| 'OPEN'
	| 'SUBMITTED'
	| 'APPROVED'
	| 'REIMBURSED'
	| 'ARCHIVED';

export type ExpensifyFileExtension = 
	| 'csv'
	| 'xls'
	| 'xlsx'
	| 'txt'
	| 'pdf'
	| 'json'
	| 'xml';

export type ExpensifyReconciliationType = 'unreported' | 'all';
