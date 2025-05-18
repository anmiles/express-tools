import '@anmiles/prototypes';
import type { Request, RequestHandler } from 'express';

import { HttpError } from './httpError';

type StatusCode = number;

export function createRequestHandler<TResponseData extends unknown>(
	getResult: (request: Request)=> {
		result: TResponseData;
		status?: StatusCode;
	},
): RequestHandler {
	return (request, response) => {
		try {
			const { result, status } = getResult(request);

			response
				.status(status ?? 200)
				.send(result);
		} catch (ex) {
			const error  = Error.parse(ex);
			const status = error instanceof HttpError ? error.code : 500;

			response
				.status(status)
				.send({
					error: Error.parse(ex).message,
				});
		}
	};
}

export function createAsyncRequestHandler<TResponseData extends unknown>(
	getResultAsync: (request: Request)=> Promise<{
		result: TResponseData;
		status?: StatusCode;
	}>,
): RequestHandler {
	return async (request, response) => {
		try {
			const { result, status } = await getResultAsync(request);

			response
				.status(status ?? 200)
				.send(result);
		} catch (ex) {
			const error  = Error.parse(ex);
			const status = error instanceof HttpError ? error.code : 500;

			response
				.status(status)
				.send({
					error: Error.parse(ex).message,
				});
		}
	};
}
