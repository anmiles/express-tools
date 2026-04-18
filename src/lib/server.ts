import type { Server } from 'http';
import type { AddressInfo } from 'net';

import logger from '@anmiles/logger';
import type { Express } from 'express';
import { open } from 'out-url';
import enableDestroy from 'server-destroy';

let server: Server | undefined;

function getHost(address: string): string {
	switch (address) {
		case '::':
			return 'localhost';
		case '0.0.0.0':
			return 'localhost';
		default:
			return address;
	}
}

function getUrl(address: string | AddressInfo): string {
	return typeof address === 'string'
		? address
		: `http://${getHost(address.address)}:${address.port}`;
}

export async function startServer(app: Express, options?: { host?: string; port?: number; open?: boolean }): Promise<void> {
	return new Promise((resolve, reject) => {
		logger.log('Starting server...');
		const host = options?.host ?? '0.0.0.0';

		// eslint-disable-next-line promise/prefer-await-to-callbacks
		server = app.listen(options?.port ?? 0, host, (error) => {
			if (error) {
				return void reject(error);
			}

			enableDestroy(server!);
			const address = server!.address();

			if (address === null) {
				return void reject('Cannot start server');
			}

			const url = getUrl(address);

			logger.log(`Server started at ${url}`);

			if (options?.open) {
				void open(url);
			}

			return void resolve();
		});
	});
}

export async function stopServer(): Promise<void> {
	return new Promise((resolve) => {
		if (!server) {
			return void resolve();
		}

		logger.log('Stopping server...');
		server.destroy(() => {
			server = undefined;
			resolve();
		});
	});
}
