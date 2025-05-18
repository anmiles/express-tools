import z from 'zod';

import { validate } from '../validate';

const schema = z.object({
	id  : z.number(),
	text: z.string(),
	flag: z.boolean().optional(),
});

describe('src/lib/validate', () => {
	describe('validate', () => {
		it('should return data if validation passed', () => {
			const data = {
				id  : 1,
				text: 'value',
				flag: true,
			};

			const result = validate(data, schema);

			expect(result).toEqual(data);
		});

		it('should throw an error if validation failed', () => {
			const data = {
				id: 'wrong',
			};

			expect(() => validate(data, schema)).toThrow('Validation failed: id (Expected number, received string), text (Required)');
		});
	});
});
