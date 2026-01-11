/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { expensifyApiRequest } from '../../transport';

export async function getAllDomainCards(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const domain = this.getNodeParameter('domain', index) as string;

	const response = await expensifyApiRequest.call(this, {
		type: 'get',
		inputSettings: {
			type: 'domainCardList',
			domain,
		},
	});

	if (response.cardList && Array.isArray(response.cardList)) {
		return (response.cardList as IDataObject[]).map((card) => ({
			json: {
				domain,
				...card,
			},
		}));
	}

	return [
		{
			json: {
				domain,
				cards: response.cardList || [],
				...response,
			},
		},
	];
}

export async function getDomainCardByNumber(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const domain = this.getNodeParameter('domain', index) as string;
	const cardNumber = this.getNodeParameter('cardNumber', index) as string;

	const response = await expensifyApiRequest.call(this, {
		type: 'get',
		inputSettings: {
			type: 'domainCardList',
			domain,
		},
	});

	if (response.cardList && Array.isArray(response.cardList)) {
		const card = (response.cardList as IDataObject[]).find(
			(c) => c.cardNumber === cardNumber || c.lastFour === cardNumber,
		);
		
		if (card) {
			return [
				{
					json: {
						domain,
						...card,
					},
				},
			];
		}
	}

	return [
		{
			json: {
				domain,
				cardNumber,
				found: false,
				message: `Card ${cardNumber} not found in domain ${domain}`,
			},
		},
	];
}
