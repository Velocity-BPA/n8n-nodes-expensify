import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ExpensifyApi implements ICredentialType {
	name = 'expensifyApi';
	displayName = 'Expensify API';
	documentationUrl = 'https://integrations.expensify.com/Integration-Server/doc/';
	properties: INodeProperties[] = [
		{
			displayName: 'Partner User ID',
			name: 'partnerUserID',
			type: 'string',
			default: '',
			required: true,
			description: 'The partner user ID for authentication',
		},
		{
			displayName: 'Partner User Secret',
			name: 'partnerUserSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The partner user secret for authentication',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations',
			required: true,
			description: 'The base URL for the Expensify Integration Server',
		},
	];
}