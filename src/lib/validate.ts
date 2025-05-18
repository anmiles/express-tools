import type { z } from 'zod';

export function validate<T>(data: unknown, schema: z.ZodType<T, any, unknown>): T {
	const parsed = schema.safeParse(data);

	if (!parsed.success) {
		throw new Error(`Validation failed: ${parsed.error.issues.map((i) => `${i.path.join('.')} (${i.message})`).join(', ')}`);
	}

	return parsed.data;
}
