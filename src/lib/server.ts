import type { Server } from 'http';

import logger from '@anmiles/logger';
import type { Express } from 'express';
import { open } from 'out-url';
import enableDestroy from 'server-destroy';

let server: Server | undefined;

export async function startServer(app: Express, options?: { port?: number; open?: boolean }): Promise<void> {
	return new Promise((resolve, reject) => {
		logger.log('Starting server...');

		// eslint-disable-next-line promise/prefer-await-to-callbacks
		server = app.listen(options?.port ?? 0, (error) => {
			if (error) {
				return void reject(error);
			}

			enableDestroy(server!);
			const address = server!.address();

			if (address === null) {
				return void reject('Cannot start server');
			}

			const url = typeof address === 'string'
				? address
				: `http://localhost:${address.port}`;

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
