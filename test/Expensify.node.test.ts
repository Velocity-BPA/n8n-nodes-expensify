/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Expensify } from '../nodes/Expensify/Expensify.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Expensify Node', () => {
  let node: Expensify;

  beforeAll(() => {
    node = new Expensify();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Expensify');
      expect(node.description.name).toBe('expensify');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Report Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				partnerUserID: 'test-user-id',
				partnerUserSecret: 'test-secret',
				baseUrl: 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	test('should download report successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('downloadReport')
			.mockReturnValueOnce('{}')
			.mockReturnValueOnce('')
			.mockReturnValueOnce(false);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			jobDescription: 'download job created',
			jobID: 'test-job-id',
		});

		const result = await executeReportOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.jobDescription).toBe('download job created');
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				url: 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations',
			}),
		);
	});

	test('should get report list successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getReportList')
			.mockReturnValueOnce('2023-01-01')
			.mockReturnValueOnce('2023-12-31')
			.mockReturnValueOnce('test@example.com')
			.mockReturnValueOnce('');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			reportList: [{ reportID: '123', reportName: 'Test Report' }],
		});

		const result = await executeReportOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.reportList).toBeDefined();
	});

	test('should create report successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createReport')
			.mockReturnValueOnce('employee@example.com')
			.mockReturnValueOnce('New Test Report')
			.mockReturnValueOnce('{}');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			reportID: '456',
			success: true,
		});

		const result = await executeReportOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.reportID).toBe('456');
	});

	test('should update report successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('updateReport')
			.mockReturnValueOnce('123')
			.mockReturnValueOnce('Updated Report Name')
			.mockReturnValueOnce('{}');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			success: true,
			reportID: '123',
		});

		const result = await executeReportOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.success).toBe(true);
	});

	test('should handle API errors gracefully', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('downloadReport');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executeReportOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('API Error');
	});

	test('should throw error for unknown operation', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

		await expect(
			executeReportOperations.call(mockExecuteFunctions, [{ json: {} }]),
		).rejects.toThrow('Unknown operation: unknownOperation');
	});
});

describe('Expense Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        partnerUserID: 'test-user-id',
        partnerUserSecret: 'test-user-secret',
        baseUrl: 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  it('should create expense successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createExpense')
      .mockReturnValueOnce('test@example.com')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce('USD')
      .mockReturnValueOnce('Travel')
      .mockReturnValueOnce('Test Merchant')
      .mockReturnValueOnce('2023-12-01');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      responseCode: 200,
      responseMessage: 'Expense created successfully'
    });

    const items = [{ json: {} }];
    const result = await executeExpenseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.responseCode).toBe(200);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations'
      })
    );
  });

  it('should update expense successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('updateExpense')
      .mockReturnValueOnce('TXN123')
      .mockReturnValueOnce(150)
      .mockReturnValueOnce('Meals')
      .mockReturnValueOnce('Updated Merchant')
      .mockReturnValueOnce('Updated comment');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      responseCode: 200,
      responseMessage: 'Expense updated successfully'
    });

    const items = [{ json: {} }];
    const result = await executeExpenseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.responseCode).toBe(200);
  });

  it('should delete expense successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('deleteExpense')
      .mockReturnValueOnce('TXN123');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      responseCode: 200,
      responseMessage: 'Expense deleted successfully'
    });

    const items = [{ json: {} }];
    const result = await executeExpenseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.responseCode).toBe(200);
  });

  it('should get expense list successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getExpenseList')
      .mockReturnValueOnce('2023-01-01')
      .mockReturnValueOnce('2023-12-31')
      .mockReturnValueOnce('test@example.com')
      .mockReturnValueOnce('RPT1,RPT2');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      responseCode: 200,
      expenses: [
        { transactionID: 'TXN1', amount: 100 },
        { transactionID: 'TXN2', amount: 200 }
      ]
    });

    const items = [{ json: {} }];
    const result = await executeExpenseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.responseCode).toBe(200);
    expect(result[0].json.expenses).toHaveLength(2);
  });

  it('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createExpense');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const items = [{ json: {} }];
    const result = await executeExpenseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });

  it('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createExpense');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);

    const items = [{ json: {} }];
    
    await expect(executeExpenseOperations.call(mockExecuteFunctions, items))
      .rejects.toThrow('API Error');
  });
});

describe('Employee Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				partnerUserID: 'test-user-id',
				partnerUserSecret: 'test-secret',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	it('should create employee successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createEmployee')
			.mockReturnValueOnce('test@example.com')
			.mockReturnValueOnce('EMP001')
			.mockReturnValueOnce('manager@example.com')
			.mockReturnValueOnce('John')
			.mockReturnValueOnce('Doe');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			responseCode: 200,
			responseMessage: 'Employee created successfully',
		});

		const result = await executeEmployeeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.responseCode).toBe(200);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations',
			body: JSON.stringify({
				type: 'createEmployee',
				credentials: {
					partnerUserID: 'test-user-id',
					partnerUserSecret: 'test-secret',
				},
				employeeEmail: 'test@example.com',
				employeeID: 'EMP001',
				managerEmail: 'manager@example.com',
				firstName: 'John',
				lastName: 'Doe',
			}),
			headers: {
				'Content-Type': 'application/json',
			},
			json: true,
		});
	});

	it('should update employee successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('updateEmployee')
			.mockReturnValueOnce('test@example.com')
			.mockReturnValueOnce('EMP001')
			.mockReturnValueOnce('manager@example.com')
			.mockReturnValueOnce('Jane')
			.mockReturnValueOnce('Smith');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			responseCode: 200,
			responseMessage: 'Employee updated successfully',
		});

		const result = await executeEmployeeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.responseCode).toBe(200);
	});

	it('should get employee list successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getEmployeeList')
			.mockReturnValueOnce('test@example.com');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			responseCode: 200,
			employees: [
				{ email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
			],
		});

		const result = await executeEmployeeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.responseCode).toBe(200);
		expect(result[0].json.employees).toHaveLength(1);
	});

	it('should set employee limit successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('setEmployeeLimit')
			.mockReturnValueOnce('test@example.com')
			.mockReturnValueOnce(1000);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			responseCode: 200,
			responseMessage: 'Employee limit set successfully',
		});

		const result = await executeEmployeeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.responseCode).toBe(200);
	});

	it('should handle API errors properly', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createEmployee')
			.mockReturnValueOnce('test@example.com')
			.mockReturnValueOnce('EMP001')
			.mockReturnValueOnce('manager@example.com')
			.mockReturnValueOnce('John')
			.mockReturnValueOnce('Doe');

		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executeEmployeeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('API Error');
	});

	it('should throw error for unknown operation', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

		await expect(
			executeEmployeeOperations.call(mockExecuteFunctions, [{ json: {} }])
		).rejects.toThrow('Unknown operation: unknownOperation');
	});
});

describe('Policy Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        partnerUserID: 'test-user-id',
        partnerUserSecret: 'test-secret',
        baseUrl: 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
      },
    };
  });

  test('should create policy successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createPolicy')
      .mockReturnValueOnce('Test Policy')
      .mockReturnValueOnce('team')
      .mockReturnValueOnce('USD');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ responseCode: 200, jobDescription: 'Policy created' });

    const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.responseCode).toBe(200);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      form: { requestJobDescription: expect.stringContaining('Test Policy') },
      json: true,
    });
  });

  test('should update policy successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('updatePolicy')
      .mockReturnValueOnce('policy123')
      .mockReturnValueOnce('Updated Policy')
      .mockReturnValueOnce('{"autoReporting": true}');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ responseCode: 200, jobDescription: 'Policy updated' });

    const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.responseCode).toBe(200);
  });

  test('should get policy list successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getPolicyList')
      .mockReturnValueOnce('policy123');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ responseCode: 200, policyList: [] });

    const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.responseCode).toBe(200);
  });

  test('should update policy connection data successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('updatePolicyConnectionData')
      .mockReturnValueOnce('policy123')
      .mockReturnValueOnce('{"quickbooksOnlineCompanyID": "123456"}');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ responseCode: 200, jobDescription: 'Connection data updated' });

    const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.responseCode).toBe(200);
  });

  test('should handle invalid JSON in settings', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('updatePolicy')
      .mockReturnValueOnce('policy123')
      .mockReturnValueOnce('Updated Policy')
      .mockReturnValueOnce('invalid json');

    await expect(executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Invalid JSON in settings parameter');
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createPolicy')
      .mockReturnValueOnce('Test Policy')
      .mockReturnValueOnce('team')
      .mockReturnValueOnce('USD');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    await expect(executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
  });

  test('should continue on fail when enabled', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createPolicy')
      .mockReturnValueOnce('Test Policy')
      .mockReturnValueOnce('team')
      .mockReturnValueOnce('USD');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('Transaction Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				partnerUserID: 'test-user-id',
				partnerUserSecret: 'test-user-secret',
				baseUrl: 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				constructExecutionMetaData: jest.fn().mockImplementation((data, meta) => data.map((item: any) => ({ ...item, pairedItem: meta.itemData }))),
			},
		};
	});

	describe('exportTransaction operation', () => {
		it('should export transactions successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('exportTransaction')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-12-31')
				.mockReturnValueOnce(true);

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				jobID: 'job123',
				status: 'success',
				responseMessage: 'Transactions exported',
			});

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: {
					jobID: 'job123',
					status: 'success',
					responseMessage: 'Transactions exported',
				},
				pairedItem: { item: 0 },
			}]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				form: {
					requestJobDescription: JSON.stringify({
						partnerUserID: 'test-user-id',
						partnerUserSecret: 'test-user-secret',
						type: 'export',
						startDate: '2023-01-01',
						endDate: '2023-12-31',
						markedAsExported: true,
					}),
				},
				json: true,
			});
		});

		it('should handle export transaction errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('exportTransaction')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-12-31')
				.mockReturnValueOnce(false);

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: { error: 'API Error' },
				pairedItem: { item: 0 },
			}]);
		});
	});

	describe('updateTransactionStatus operation', () => {
		it('should update transaction status successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('updateTransactionStatus')
				.mockReturnValueOnce('txn123')
				.mockReturnValueOnce('approved');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				jobID: 'job456',
				status: 'success',
				responseMessage: 'Transaction status updated',
			});

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: {
					jobID: 'job456',
					status: 'success',
					responseMessage: 'Transaction status updated',
				},
				pairedItem: { item: 0 },
			}]);
		});
	});

	describe('getTransactionList operation', () => {
		it('should get transaction list successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransactionList')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-12-31')
				.mockReturnValueOnce('rpt1,rpt2,rpt3');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				jobID: 'job789',
				transactions: [{ id: 'txn1' }, { id: 'txn2' }],
			});

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: {
					jobID: 'job789',
					transactions: [{ id: 'txn1' }, { id: 'txn2' }],
				},
				pairedItem: { item: 0 },
			}]);
		});
	});

	describe('reconcileTransactions operation', () => {
		it('should reconcile transactions successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('reconcileTransactions')
				.mockReturnValueOnce('[{"id": "txn1", "amount": 100}]')
				.mockReturnValueOnce('{"reconcileDate": "2023-12-31"}');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				jobID: 'job101',
				status: 'success',
				reconciledCount: 1,
			});

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: {
					jobID: 'job101',
					status: 'success',
					reconciledCount: 1,
				},
				pairedItem: { item: 0 },
			}]);
		});

		it('should handle invalid JSON in transaction list', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('reconcileTransactions')
				.mockReturnValueOnce('invalid json')
				.mockReturnValueOnce('{}');

			await expect(executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]))
				.rejects
				.toThrow('Invalid JSON in transaction list');
		});
	});
});
});
