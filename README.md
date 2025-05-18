# @anmiles/express-tools

Collection of utility functions for Express server

----

## Installation

`npm install @anmiles/express-tools`

## Usage example

```ts
import { startServer, stopServer, createRequestHandler, createAsyncRequestHandler } from '@anmiles/express-tools';
import express from 'express';

async function main() {
	try {
		const app = express();

		const readHandler = createAsyncRequestHandler(async () => ({ result: await getData() }));

		const writeHandler = createRequestHandler((request) => {
			writeData(request.body);
			return { result: 'OK' };
		})

		app.get('/read', readHandler);
		app.get('/write', writeHandler);

		await startServer(app, { port: Number(process.env['PORT']) || 0, open: true });
		// or await startServer(app) to use any free port and do not open the page in the browser automatically
	} catch (ex) {
		logger.error(ex);
		await stopServer();
	}
}
```
