/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
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
			description: 'Your Partner User ID from Expensify integration settings',
			hint: 'Get this from https://www.expensify.com/tools/integrations/',
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
			description: 'Your Partner User Secret from Expensify integration settings',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: 'requestJobDescription=' + encodeURIComponent(JSON.stringify({
				type: 'get',
				credentials: {
					partnerUserID: '={{$credentials.partnerUserID}}',
					partnerUserSecret: '={{$credentials.partnerUserSecret}}',
				},
				inputSettings: {
					type: 'policy',
					fields: [],
				},
			})),
		},
	};
}
