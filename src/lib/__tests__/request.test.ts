import type { Request, Response } from 'express';

import { HttpError } from '../httpError';
import { createAsyncRequestHandler, createRequestHandler } from '../request';

let request: Request;
let response: Response;

const status = jest.fn().mockReturnThis();
const send   = jest.fn().mockReturnThis();

beforeEach(() => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
	request = {
		body: 'test',
	} as Request;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
	response = {
		status,
		send,
	} as unknown as Response;
});

describe('src/lib/request', () => {
	describe('createRequestHandler', () => {
		it('should return request handler that responds with result and default status code', () => {
			const requestHandler = createRequestHandler((request) => ({
				result: { value: request.body },
			}));

			void requestHandler(request, response, jest.fn());

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.send).toHaveBeenCalledWith({ value: request.body });
		});

		it('should return request handler that responds with result and custom status code', () => {
			const requestHandler = createRequestHandler((request) => ({
				result: { value: request.body },
				status: 123,
			}));

			void requestHandler(request, response, jest.fn());

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(response.status).toHaveBeenCalledWith(123);
			expect(response.send).toHaveBeenCalledWith({ value: request.body });
		});

		it('should return request handler that responds with error and default status code', () => {
			const requestHandler = createRequestHandler(() => { throw new Error('Test error'); });

			void requestHandler(request, response, jest.fn());

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(response.status).toHaveBeenCalledWith(500);
			expect(response.send).toHaveBeenCalledWith({ error: 'Test error' });
		});

		it('should return request handler that responds with error and custom status code', () => {
			const requestHandler = createRequestHandler(() => { throw new HttpError(444, 'Test error'); });

			void requestHandler(request, response, jest.fn());

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(response.status).toHaveBeenCalledWith(444);
			expect(response.send).toHaveBeenCalledWith({ error: 'Test error' });
		});
	});

	describe('createAsyncRequestHandler', () => {
		it('should return asynchronous request handler that responds with result and default status code', async () => {
			// eslint-disable-next-line @typescript-eslint/require-await
			const asyncRequestHandler = createAsyncRequestHandler(async (request) => ({
				result: { value: request.body },
			}));

			void await asyncRequestHandler(request, response, jest.fn());

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.send).toHaveBeenCalledWith({ value: request.body });
		});

		it('should return asynchronous request handler that responds with result and custom status code', async () => {
			// eslint-disable-next-line @typescript-eslint/require-await
			const asyncRequestHandler = createAsyncRequestHandler(async (request) => ({
				result: { value: request.body },
				status: 123,
			}));

			void await asyncRequestHandler(request, response, jest.fn());

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(response.status).toHaveBeenCalledWith(123);
			expect(response.send).toHaveBeenCalledWith({ value: request.body });
		});

		it('should return asynchronous request handler that responds with error and default status code', async () => {
			const asyncRequestHandler = createAsyncRequestHandler(async () => Promise.reject(new Error('Test error')));

			void await asyncRequestHandler(request, response, jest.fn());

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(response.status).toHaveBeenCalledWith(500);
			expect(response.send).toHaveBeenCalledWith({ error: 'Test error' });
		});

		it('should return asynchronous request handler that responds with error and custom status code', async () => {
			const asyncRequestHandler = createAsyncRequestHandler(async () => Promise.reject(new HttpError(444, 'Test error')));

			void await asyncRequestHandler(request, response, jest.fn());

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(response.status).toHaveBeenCalledWith(444);
			expect(response.send).toHaveBeenCalledWith({ error: 'Test error' });
		});
	});
});
