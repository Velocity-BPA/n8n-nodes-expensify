/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Format date to yyyy-mm-dd
 */
export function formatDate(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toISOString().split('T')[0];
}

/**
 * Parse amount from cents to dollars
 */
export function centsToAmount(cents: number): number {
	return cents / 100;
}

/**
 * Convert amount to cents
 */
export function amountToCents(amount: number): number {
	return Math.round(amount * 100);
}

/**
 * Parse report IDs from comma-separated string or array
 */
export function parseReportIds(input: string | string[]): string {
	if (Array.isArray(input)) {
		return input.join(',');
	}
	return input;
}

/**
 * Parse policy IDs from comma-separated string or array
 */
export function parsePolicyIds(input: string | string[]): string[] {
	if (Array.isArray(input)) {
		return input;
	}
	return input.split(',').map((id) => id.trim());
}

/**
 * Build transaction list from node input
 */
export function buildTransactionList(items: INodeExecutionData[], mapping: IDataObject): IDataObject[] {
	return items.map((item) => {
		const transaction: IDataObject = {};
		
		for (const [nodeField, expensifyField] of Object.entries(mapping)) {
			const value = item.json[nodeField];
			if (value !== undefined && value !== null && value !== '') {
				transaction[expensifyField as string] = value;
			}
		}
		
		return transaction;
	});
}

/**
 * Parse JSON response that might be stringified
 */
export function parseJsonResponse(response: unknown): IDataObject {
	if (typeof response === 'string') {
		try {
			return JSON.parse(response);
		} catch {
			return { rawResponse: response };
		}
	}
	return response as IDataObject;
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
	const parts = filename.split('.');
	return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Generate MIME type from file extension
 */
export function getMimeType(extension: string): string {
	const mimeTypes: Record<string, string> = {
		csv: 'text/csv',
		xls: 'application/vnd.ms-excel',
		xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		pdf: 'application/pdf',
		json: 'application/json',
		xml: 'application/xml',
		txt: 'text/plain',
	};
	
	return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Default FreeMarker template for CSV export
 */
export const DEFAULT_CSV_TEMPLATE = `<#if addHeader == true>
Report ID,Report Name,Status,Merchant,Amount,Currency,Category,Date,Submitted By<#lt>
</#if>
<#list reports as report>
<#list report.transactionList as expense>
\${report.reportID},<#t>
"\${report.reportName}",<#t>
\${report.status},<#t>
"\${expense.merchant}",<#t>
\${expense.amount},<#t>
\${expense.currency},<#t>
"\${expense.category!}",<#t>
\${expense.created},<#t>
\${report.accountEmail}<#lt>
</#list>
</#list>`;

/**
 * Default FreeMarker template for JSON export
 */
export const DEFAULT_JSON_TEMPLATE = `{
  "reports": [
<#list reports as report>
    {
      "reportID": "\${report.reportID}",
      "reportName": "\${report.reportName}",
      "status": "\${report.status}",
      "total": \${report.total},
      "currency": "\${report.currency}",
      "accountEmail": "\${report.accountEmail}",
      "transactions": [
<#list report.transactionList as expense>
        {
          "transactionID": "\${expense.transactionID}",
          "merchant": "\${expense.merchant}",
          "amount": \${expense.amount},
          "currency": "\${expense.currency}",
          "category": "\${expense.category!}",
          "created": "\${expense.created}"
        }<#sep>,</#sep>
</#list>
      ]
    }<#sep>,</#sep>
</#list>
  ]
}`;

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate report ID format (R00xxxxxxx)
 */
export function isValidReportId(reportId: string): boolean {
	const reportIdRegex = /^R[0-9A-Za-z]+$/;
	return reportIdRegex.test(reportId);
}

/**
 * Validate policy ID format
 */
export function isValidPolicyId(policyId: string): boolean {
	const policyIdRegex = /^[0-9A-Fa-f]+$/;
	return policyIdRegex.test(policyId);
}

/**
 * Clean and validate amount input
 */
export function validateAmount(amount: unknown): number {
	const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
	if (isNaN(num)) {
		throw new Error('Invalid amount value');
	}
	return num;
}

/**
 * Sanitize string for CSV
 */
export function sanitizeForCsv(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}
