/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IDataObject,
	JsonObject,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import type {
	IExpensifyJobDescription,
	IExpensifyApiResponse,
} from '../types/ExpensifyTypes';

const BASE_URL = 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations';

/**
 * Log licensing notice once per node load
 */
let licenseNoticeLogged = false;

function logLicenseNotice(): void {
	if (!licenseNoticeLogged) {
		console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
		licenseNoticeLogged = true;
	}
}

/**
 * Make an API request to Expensify
 */
export async function expensifyApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
	jobDescription: Omit<IExpensifyJobDescription, 'credentials'>,
	additionalParams?: Record<string, string>,
): Promise<IExpensifyApiResponse> {
	logLicenseNotice();

	const credentials = await this.getCredentials('expensifyApi');

	const fullJobDescription = {
		...jobDescription,
		credentials: {
			partnerUserID: credentials.partnerUserID as string,
			partnerUserSecret: credentials.partnerUserSecret as string,
		},
	} as IExpensifyJobDescription;

	const formParams = new URLSearchParams();
	formParams.append('requestJobDescription', JSON.stringify(fullJobDescription));

	if (additionalParams) {
		for (const [key, value] of Object.entries(additionalParams)) {
			formParams.append(key, value);
		}
	}

	const options = {
		method: 'POST' as IHttpRequestMethods,
		url: BASE_URL,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: formParams.toString(),
	};

	try {
		const response = await this.helpers.httpRequest(options);
		
		// Handle string responses (need to parse JSON)
		let parsedResponse: IExpensifyApiResponse;
		if (typeof response === 'string') {
			try {
				parsedResponse = JSON.parse(response);
			} catch {
				// Response might be a filename or other non-JSON response
				return { fileName: response } as IExpensifyApiResponse;
			}
		} else {
			parsedResponse = response;
		}

		// Check for Expensify-specific error codes
		if (parsedResponse.responseCode && parsedResponse.responseCode !== 200) {
			throw new NodeApiError(this.getNode(), parsedResponse as JsonObject, {
				message: parsedResponse.responseMessage || 'Unknown Expensify API error',
				httpCode: String(parsedResponse.responseCode),
			});
		}

		return parsedResponse;
	} catch (error) {
		if (error instanceof NodeApiError) {
			throw error;
		}

		const errorData = error as IDataObject;

		// Handle rate limiting
		if (errorData.statusCode === 429 || errorData.httpCode === '429') {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Rate limit exceeded. Please wait and try again. Expensify allows 5 requests per 10 seconds.',
				httpCode: '429',
			});
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Expensify API request failed: ${(error as Error).message}`,
		});
	}
}

/**
 * Download a file from Expensify
 */
export async function expensifyDownloadFile(
	this: IExecuteFunctions,
	fileName: string,
	fileSystem: 'integrationServer' | 'reconciliation' = 'integrationServer',
): Promise<Buffer> {
	logLicenseNotice();

	const credentials = await this.getCredentials('expensifyApi');

	const jobDescription = {
		type: 'download',
		credentials: {
			partnerUserID: credentials.partnerUserID as string,
			partnerUserSecret: credentials.partnerUserSecret as string,
		},
		fileName,
		fileSystem,
	};

	const formParams = new URLSearchParams();
	formParams.append('requestJobDescription', JSON.stringify(jobDescription));

	const options = {
		method: 'POST' as IHttpRequestMethods,
		url: BASE_URL,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: formParams.toString(),
		encoding: 'arraybuffer' as const,
		returnFullResponse: false,
	};

	try {
		const response = await this.helpers.httpRequest(options);
		return Buffer.from(response as ArrayBuffer);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Failed to download file: ${(error as Error).message}`,
		});
	}
}

/**
 * Export reports and get the file content
 */
export async function expensifyExportAndDownload(
	this: IExecuteFunctions,
	jobDescription: Omit<IExpensifyJobDescription, 'credentials'>,
	additionalParams?: Record<string, string>,
): Promise<{ content: Buffer; fileName: string }> {
	// First, create the export job
	const exportResponse = await expensifyApiRequest.call(this, {
		...jobDescription,
		onReceive: {
			immediateResponse: ['returnRandomFileName'],
		},
	}, additionalParams);

	if (!exportResponse.fileName) {
		throw new NodeApiError(this.getNode(), exportResponse as JsonObject, {
			message: 'Export did not return a filename',
		});
	}

	// Then download the file
	const content = await expensifyDownloadFile.call(
		this,
		exportResponse.fileName,
		'integrationServer',
	);

	return {
		content,
		fileName: exportResponse.fileName,
	};
}

/**
 * Retry wrapper with exponential backoff for rate limiting
 */
export async function expensifyApiRequestWithRetry(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
	jobDescription: Omit<IExpensifyJobDescription, 'credentials'>,
	additionalParams?: Record<string, string>,
	maxRetries = 3,
): Promise<IExpensifyApiResponse> {
	let lastError: Error | undefined;
	let waitTime = 2000; // Start with 2 seconds

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await expensifyApiRequest.call(this, jobDescription, additionalParams);
		} catch (error) {
			lastError = error as Error;
			
			// Only retry on rate limit errors
			if ((error as IDataObject).httpCode === '429' && attempt < maxRetries) {
				await sleep(waitTime);
				waitTime *= 2; // Exponential backoff
				continue;
			}
			
			throw error;
		}
	}

	throw lastError;
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build CSV data for employee updates
 */
export function buildEmployeeCsv(employees: IDataObject[]): string {
	const headers = [
		'EmployeeEmail',
		'ManagerEmail',
		'Admin',
		'EmployeeUserId',
		'EmployeePayrollId',
		'ForwardManagerEmail',
	];

	const rows = employees.map((emp) => {
		return headers.map((header) => {
			const value = emp[header.charAt(0).toLowerCase() + header.slice(1)];
			if (value === undefined || value === null) return '';
			if (typeof value === 'boolean') return value ? 'true' : 'false';
			return String(value);
		}).join(',');
	});

	return [headers.join(','), ...rows].join('\n');
}
