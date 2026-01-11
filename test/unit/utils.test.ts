/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	formatDate,
	centsToAmount,
	amountToCents,
	parseReportIds,
	parsePolicyIds,
	getFileExtension,
	getMimeType,
	isValidEmail,
	isValidReportId,
	isValidPolicyId,
	validateAmount,
	sanitizeForCsv,
} from '../../nodes/Expensify/utils';

describe('Utility Functions', () => {
	describe('formatDate', () => {
		it('should format Date object to yyyy-mm-dd', () => {
			const date = new Date('2024-03-15T10:30:00Z');
			expect(formatDate(date)).toBe('2024-03-15');
		});

		it('should format date string to yyyy-mm-dd', () => {
			expect(formatDate('2024-03-15T10:30:00Z')).toBe('2024-03-15');
		});

		it('should handle ISO date string', () => {
			expect(formatDate('2024-01-01')).toBe('2024-01-01');
		});
	});

	describe('centsToAmount', () => {
		it('should convert cents to dollars', () => {
			expect(centsToAmount(4599)).toBe(45.99);
			expect(centsToAmount(100)).toBe(1);
			expect(centsToAmount(0)).toBe(0);
		});
	});

	describe('amountToCents', () => {
		it('should convert dollars to cents', () => {
			expect(amountToCents(45.99)).toBe(4599);
			expect(amountToCents(1)).toBe(100);
			expect(amountToCents(0)).toBe(0);
		});

		it('should round to nearest cent', () => {
			expect(amountToCents(45.999)).toBe(4600);
			expect(amountToCents(45.991)).toBe(4599);
		});
	});

	describe('parseReportIds', () => {
		it('should return string as-is', () => {
			expect(parseReportIds('R00123,R00456')).toBe('R00123,R00456');
		});

		it('should join array with commas', () => {
			expect(parseReportIds(['R00123', 'R00456'])).toBe('R00123,R00456');
		});
	});

	describe('parsePolicyIds', () => {
		it('should split comma-separated string', () => {
			expect(parsePolicyIds('ABC123, DEF456')).toEqual(['ABC123', 'DEF456']);
		});

		it('should return array as-is', () => {
			expect(parsePolicyIds(['ABC123', 'DEF456'])).toEqual(['ABC123', 'DEF456']);
		});
	});

	describe('getFileExtension', () => {
		it('should extract extension from filename', () => {
			expect(getFileExtension('report.csv')).toBe('csv');
			expect(getFileExtension('data.export.json')).toBe('json');
		});

		it('should return empty string for files without extension', () => {
			expect(getFileExtension('filename')).toBe('');
		});
	});

	describe('getMimeType', () => {
		it('should return correct MIME type for known extensions', () => {
			expect(getMimeType('csv')).toBe('text/csv');
			expect(getMimeType('json')).toBe('application/json');
			expect(getMimeType('pdf')).toBe('application/pdf');
			expect(getMimeType('xlsx')).toBe(
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			);
		});

		it('should return octet-stream for unknown extensions', () => {
			expect(getMimeType('unknown')).toBe('application/octet-stream');
		});

		it('should be case-insensitive', () => {
			expect(getMimeType('CSV')).toBe('text/csv');
			expect(getMimeType('JSON')).toBe('application/json');
		});
	});

	describe('isValidEmail', () => {
		it('should validate correct email formats', () => {
			expect(isValidEmail('user@example.com')).toBe(true);
			expect(isValidEmail('user.name@example.co.uk')).toBe(true);
		});

		it('should reject invalid email formats', () => {
			expect(isValidEmail('invalid')).toBe(false);
			expect(isValidEmail('user@')).toBe(false);
			expect(isValidEmail('@example.com')).toBe(false);
		});
	});

	describe('isValidReportId', () => {
		it('should validate correct report ID formats', () => {
			expect(isValidReportId('R00123456')).toBe(true);
			expect(isValidReportId('RABC123')).toBe(true);
		});

		it('should reject invalid report ID formats', () => {
			expect(isValidReportId('00123456')).toBe(false);
			expect(isValidReportId('X00123456')).toBe(false);
		});
	});

	describe('isValidPolicyId', () => {
		it('should validate correct policy ID formats', () => {
			expect(isValidPolicyId('ABC123DEF456')).toBe(true);
			expect(isValidPolicyId('0123456789ABCDEF')).toBe(true);
		});

		it('should reject invalid policy ID formats', () => {
			expect(isValidPolicyId('ABC-123')).toBe(false);
			expect(isValidPolicyId('GHIJK')).toBe(false);
		});
	});

	describe('validateAmount', () => {
		it('should parse valid amounts', () => {
			expect(validateAmount(45.99)).toBe(45.99);
			expect(validateAmount('45.99')).toBe(45.99);
			expect(validateAmount(100)).toBe(100);
		});

		it('should throw error for invalid amounts', () => {
			expect(() => validateAmount('invalid')).toThrow('Invalid amount value');
			expect(() => validateAmount(NaN)).toThrow('Invalid amount value');
		});
	});

	describe('sanitizeForCsv', () => {
		it('should not modify simple strings', () => {
			expect(sanitizeForCsv('simple')).toBe('simple');
		});

		it('should quote strings with commas', () => {
			expect(sanitizeForCsv('hello, world')).toBe('"hello, world"');
		});

		it('should quote strings with quotes and escape them', () => {
			expect(sanitizeForCsv('say "hello"')).toBe('"say ""hello"""');
		});

		it('should quote strings with newlines', () => {
			expect(sanitizeForCsv('line1\nline2')).toBe('"line1\nline2"');
		});
	});
});
