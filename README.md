# n8n-nodes-expensify

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node for integrating with Expensify's expense management platform. Provides access to 5 core resources including reports, expenses, employees, policies, and transactions with full CRUD operations for automating expense workflows and financial data synchronization.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Expensify API](https://img.shields.io/badge/Expensify-API-green)
![Expense Management](https://img.shields.io/badge/Expense-Management-orange)
![Financial Automation](https://img.shields.io/badge/Financial-Automation-purple)

## Features

- **Comprehensive Expense Management** - Full CRUD operations for expenses, reports, and financial data
- **Employee & Policy Administration** - Manage employee profiles and expense policies programmatically
- **Transaction Processing** - Automated transaction creation, updates, and reconciliation workflows
- **Report Generation** - Create, update, and retrieve expense reports with detailed financial information
- **Policy Enforcement** - Integrate expense policies and approval workflows into automated processes
- **Financial Data Sync** - Seamless synchronization between Expensify and other financial systems
- **Bulk Operations** - Process multiple expenses, reports, or transactions efficiently
- **Audit Trail Integration** - Maintain detailed records of expense modifications and approvals

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-expensify`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-expensify
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-expensify.git
cd n8n-nodes-expensify
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-expensify
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Expensify API key obtained from account settings | Yes |
| User ID | Your Expensify user ID for authentication | Yes |
| User Secret | Your Expensify user secret for secure API access | Yes |

## Resources & Operations

### 1. Report

| Operation | Description |
|-----------|-------------|
| Create | Create a new expense report |
| Get | Retrieve a specific report by ID |
| Get All | List all reports with filtering options |
| Update | Modify report details and status |
| Delete | Remove a report from the system |
| Submit | Submit a report for approval |
| Approve | Approve a submitted report |
| Reject | Reject a submitted report with comments |

### 2. Expense

| Operation | Description |
|-----------|-------------|
| Create | Add a new expense entry |
| Get | Retrieve expense details by ID |
| Get All | List expenses with date and category filters |
| Update | Modify expense amount, category, or details |
| Delete | Remove an expense entry |
| Attach Receipt | Upload and attach receipt images |
| Categorize | Assign or update expense categories |
| Split | Split an expense across multiple categories |

### 3. Employee

| Operation | Description |
|-----------|-------------|
| Create | Add a new employee to the system |
| Get | Retrieve employee profile information |
| Get All | List all employees with role and status filters |
| Update | Modify employee details and permissions |
| Delete | Remove an employee from the system |
| Invite | Send invitation to new employee |
| Activate | Activate an employee account |
| Deactivate | Temporarily disable an employee account |

### 4. Policy

| Operation | Description |
|-----------|-------------|
| Create | Create a new expense policy |
| Get | Retrieve policy configuration and rules |
| Get All | List all policies with type and status filters |
| Update | Modify policy rules and settings |
| Delete | Remove a policy from the system |
| Assign | Assign policy to employees or groups |
| Unassign | Remove policy assignment |
| Clone | Duplicate an existing policy |

### 5. Transaction

| Operation | Description |
|-----------|-------------|
| Create | Record a new financial transaction |
| Get | Retrieve transaction details by ID |
| Get All | List transactions with date and amount filters |
| Update | Modify transaction details or status |
| Delete | Remove a transaction record |
| Reconcile | Mark transaction as reconciled |
| Export | Export transaction data for accounting systems |
| Import | Import transactions from external sources |

## Usage Examples

```javascript
// Create a new expense with receipt attachment
{
  "merchant": "Office Supply Store",
  "amount": 4250,
  "currency": "USD",
  "category": "Office Supplies",
  "date": "2024-01-15",
  "comment": "Printer paper and ink cartridges",
  "receiptURL": "https://example.com/receipt.jpg"
}
```

```javascript
// Submit an expense report for approval
{
  "reportID": "R123456789",
  "action": "submit",
  "approverEmail": "manager@company.com",
  "comments": "Q1 travel expenses - all receipts attached"
}
```

```javascript
// Get all expenses for a date range
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "status": "approved",
  "limit": 100,
  "sortBy": "date"
}
```

```javascript
// Create expense policy with approval rules
{
  "name": "Travel Policy 2024",
  "maxAmount": 50000,
  "requireReceipts": true,
  "autoApprovalLimit": 10000,
  "approvers": ["manager@company.com", "finance@company.com"],
  "categories": ["Travel", "Meals", "Lodging"]
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key and user credentials in node configuration |
| Report Not Found | Specified report ID does not exist | Check report ID format and verify report exists in Expensify |
| Insufficient Permissions | User lacks permission for requested operation | Ensure user has appropriate role and policy permissions |
| Rate Limit Exceeded | Too many API requests in time window | Implement delays between requests or use batch operations |
| Invalid Expense Data | Expense creation failed due to validation errors | Verify required fields, amount formats, and category assignments |
| Receipt Upload Failed | File attachment or processing error | Check file format, size limits, and network connectivity |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-expensify/issues)
- **Expensify API Documentation**: [Expensify Integrations](https://integrations.expensify.com/)
- **Community Forum**: [Expensify Community](https://community.expensify.com/)