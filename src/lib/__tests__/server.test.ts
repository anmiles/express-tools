/* eslint-disable promise/prefer-await-to-callbacks */
import type { Server } from 'http';

import logger from '@anmiles/logger';
import type { Express } from 'express';
import { open } from 'out-url';

import { startServer, stopServer } from '../server';

jest.mock('server-destroy', () => jest.fn().mockImplementation(() => { destroyEnabled = true; }));
jest.mock('out-url');
jest.mock('@anmiles/logger');

let destroyEnabled: boolean;
let listenError: Error | undefined;

const address: jest.Mock<ReturnType<Server['address']>, Parameters<Server['address']>> = jest.fn();
const destroy: jest.Mock<ReturnType<Server['destroy']>, Parameters<Server['destroy']>> = jest.fn();

destroy.mockImplementation((callback) => {
	if (callback) {
		callback();
	}
});

const port = 1234;

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const server = {
	address,
	destroy,
} as unknown as Server;

const listen = jest.fn<Server, [number, (error?: Error) => void], boolean>()
	.mockImplementation((_port, callback) => {
		setTimeout(() => callback(listenError));
		return server;
	});

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const app = {
	listen,
} as unknown as Express;

beforeEach(() => {
	destroyEnabled = false;
	listenError    = undefined;
});

describe('src/lib/server', () => {
	describe('startServer', () => {
		it('should start server and output its address as a localhost with port if address is of type AddressInfo', async () => {
			address.mockReturnValue({ port, address: 'random', family: 'random' });

			await startServer(app, { port });

			expect(logger.log).toHaveBeenCalledWith('Starting server...');
			expect(logger.log).toHaveBeenCalledWith('Server started at http://localhost:1234');
		});

		it('should start server and output its address if it is of type string', async () => {
			address.mockReturnValue('http://example.com/server');

			await startServer(app, { port });

			expect(logger.log).toHaveBeenCalledWith('Starting server...');
			expect(logger.log).toHaveBeenCalledWith('Server started at http://example.com/server');
		});

		it('should call listen with a port specified', async () => {
			await startServer(app, { port });

			expect(listen).toHaveBeenCalledWith(port, expect.anything());
		});

		it('should call listen with a port 0 if not specified', async () => {
			await startServer(app);

			expect(listen).toHaveBeenCalledWith(0, expect.anything());
		});

		it('should enable destroy', async () => {
			address.mockReturnValue('http://example.com/server');

			await startServer(app, { port });

			expect(destroyEnabled).toBe(true);
		});

		it('should open url if expected', async () => {
			address.mockReturnValue('http://example.com/server');

			await startServer(app, { port, open: true });

			expect(open).toHaveBeenCalledWith('http://example.com/server');
		});

		it('should not open url if not expected', async () => {
			address.mockReturnValue('http://example.com/server');

			await startServer(app, { port });

			expect(open).not.toHaveBeenCalled();
		});

		it('should throw if server address is null', async () => {
			address.mockReturnValue(null);

			await expect(startServer(app, { port })).rejects.toEqual('Cannot start server');
		});

		it('should throw if could not listen to port', async () => {
			address.mockReturnValue('http://example.com/server');
			listenError = new Error('Test error');

			await expect(startServer(app, { port })).rejects.toThrow('Test error');
		});
	});

	describe('stopServer', () => {
		it('should stop server', async () => {
			await stopServer();

			expect(destroy).toHaveBeenCalled();
			expect(logger.log).toHaveBeenCalledWith('Stopping server...');
		});

		it('should not stop server twice', async () => {
			await stopServer();

			expect(destroy).not.toHaveBeenCalled();
			expect(logger.log).not.toHaveBeenCalled();
		});
	});
});
