# n8n-nodes-expensify

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Expensify, enabling workflow automation for expense report management, employee provisioning, policy administration, and financial data reconciliation through Expensify's Integration Server API.

![n8n](https://img.shields.io/badge/n8n-community%20node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Report Management**: Export, create, and manage expense reports with flexible filtering
- **Expense Tracking**: Create single or batch expenses with full field support
- **Policy Administration**: Create and configure policies including categories, tags, and report fields
- **Employee Provisioning**: Add, update, and remove employees from policies
- **Expense Rules**: Create and manage expense rules for employees
- **Tag Approvers**: Configure tag-based approval workflows
- **Reconciliation**: Export card transaction data for financial reconciliation
- **Domain Cards**: Query domain-level credit card assignments
- **Polling Trigger**: Monitor for new or updated reports automatically

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Search for `n8n-nodes-expensify`
4. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-expensify
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-expensify.git
cd n8n-nodes-expensify

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-expensify

# Restart n8n
```

## Credentials Setup

To use this node, you'll need Expensify API credentials:

1. Create an Expensify account at https://www.expensify.com/
2. Navigate to https://www.expensify.com/tools/integrations/
3. Generate credentials - you'll receive a Partner User ID and Partner User Secret
4. Store credentials securely - they are only shown once

| Field | Description |
|-------|-------------|
| Partner User ID | Your unique partner identifier |
| Partner User Secret | Your secret key (keep secure) |

## Resources & Operations

### Report

| Operation | Description |
|-----------|-------------|
| Export | Export reports by ID list to CSV/XLS/XLSX/PDF/JSON/XML |
| Export by Date Range | Export reports within a specific date range |
| Export by Status | Export reports filtered by status |
| Download File | Download a previously generated export file |
| Update Status | Mark approved reports as reimbursed |
| Create | Create a new report |

### Expense

| Operation | Description |
|-----------|-------------|
| Create | Create a single expense |
| Create Batch | Create multiple expenses in one request |

### Policy

| Operation | Description |
|-----------|-------------|
| Create | Create a new policy |
| Get | Get detailed policy information |
| Get Many | List all policies |
| Update Categories | Add, update, or replace policy categories |
| Update Tags | Add, update, or replace policy tags |
| Update Report Fields | Add, update, or replace policy report fields |

### Employee

| Operation | Description |
|-----------|-------------|
| Add | Add an employee to a policy |
| Get Many | Get all employees on a policy |
| Remove | Remove an employee from a policy |
| Update | Update policy employees via JSON data |

### Expense Rule

| Operation | Description |
|-----------|-------------|
| Create | Create an expense rule for an employee |
| Update | Update an existing expense rule |
| Delete | Delete an expense rule |

### Tag Approver

| Operation | Description |
|-----------|-------------|
| Update | Set approver for a tag |
| Remove | Remove approver from a tag |
| Set Multiple | Set approvers for multiple tags |

### Reconciliation

| Operation | Description |
|-----------|-------------|
| Export | Export reconciliation data |
| Export Card Transactions | Export all card transactions |

### Domain Card

| Operation | Description |
|-----------|-------------|
| Get Many | Get all domain cards |
| Get by Number | Get a domain card by card number |

## Trigger Node

The **Expensify Trigger** node polls for new or updated reports:

| Event | Description |
|-------|-------------|
| New Report | Polls for new reports created |
| Submitted Reports | Polls for newly submitted reports |
| Approved Reports | Polls for newly approved reports |
| Reimbursed Reports | Polls for newly reimbursed reports |
| Report Status Change | Polls for reports with any status change |

### Trigger Options

- **Policy ID**: Filter reports by policy
- **Employee Email**: Filter reports by employee
- **Initial Lookback Days**: Number of days to look back on first poll (max 30)
- **Max Reports Per Poll**: Maximum reports to return per poll

## Usage Examples

### Export Approved Reports

```javascript
// Export all approved reports from the last 30 days
{
  "resource": "report",
  "operation": "exportByDateRange",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "reportState": ["APPROVED"],
  "fileExtension": "csv"
}
```

### Create an Expense

```javascript
// Create a single expense
{
  "resource": "expense",
  "operation": "create",
  "employeeEmail": "user@company.com",
  "merchant": "Office Supplies Store",
  "created": "2024-01-15",
  "amount": 45.99,
  "currency": "USD",
  "additionalFields": {
    "category": "Office Supplies",
    "reimbursable": true,
    "comment": "Purchased via n8n automation"
  }
}
```

### Batch Create Expenses

```javascript
// Create multiple expenses at once
{
  "resource": "expense",
  "operation": "createBatch",
  "employeeEmail": "user@company.com",
  "expenses": "[{\"merchant\":\"Store A\",\"created\":\"2024-01-15\",\"amount\":25.00,\"currency\":\"USD\"},{\"merchant\":\"Store B\",\"created\":\"2024-01-16\",\"amount\":50.00,\"currency\":\"USD\"}]"
}
```

## Expensify API Concepts

### Single Endpoint Architecture

Unlike typical REST APIs, Expensify uses a single endpoint where the "job type" in the request body determines the operation. All requests are POST requests to `https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations`.

### Rate Limiting

Expensify enforces rate limits:
- 5 requests per 10 seconds
- 20 requests per 60 seconds

The node implements automatic retry with exponential backoff for rate limit errors.

### Report States

Reports can have the following states:
- **OPEN**: Draft reports not yet submitted
- **SUBMITTED**: Reports awaiting approval
- **APPROVED**: Reports approved for reimbursement
- **REIMBURSED**: Reports that have been paid
- **ARCHIVED**: Archived/closed reports

### Export Templates

The node supports FreeMarker templates for customizing export formats. A default CSV template is provided, but you can supply custom templates for advanced formatting needs.

## Error Handling

The node provides comprehensive error handling:

| Error Code | Description |
|------------|-------------|
| 200 | Success |
| 207 | Partial success (some items failed) |
| 403 | Invalid permissions |
| 404 | Resource not found |
| 410 | Validation error (malformed request) |
| 429 | Rate limit exceeded |
| 500 | Generic error |

## Security Best Practices

1. **Protect Credentials**: Never share your Partner User Secret
2. **Use Environment Variables**: Store credentials in n8n credential system
3. **Limit Permissions**: Use the minimum required permissions
4. **Monitor Access**: Regularly review API usage in Expensify
5. **Rotate Secrets**: Periodically regenerate API credentials

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Format code
npm run format
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-expensify/issues)
- **Documentation**: [Expensify API Docs](https://integrations.expensify.com/Integration-Server/doc/)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [n8n](https://n8n.io/) for the excellent workflow automation platform
- [Expensify](https://www.expensify.com/) for their comprehensive API
- The n8n community for inspiration and support
