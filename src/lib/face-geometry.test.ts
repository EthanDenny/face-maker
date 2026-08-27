import { describe, expect, it } from 'vitest';
import { createFaceGeometry } from './face-geometry';
import { eyeOptions, moodOptions, mouthOptions, shapeOptions } from './face-config';

describe('createFaceGeometry', () => {
	it('produces valid native SVG paths for every face combination', () => {
		for (const shape of shapeOptions) {
			for (const eyes of eyeOptions) {
				for (const mood of moodOptions) {
					for (const mouth of mouthOptions) {
						const geometry = createFaceGeometry(shape.id, eyes.id, mood.id, mouth.id);
						const paths = [geometry.head, ...geometry.eyes, ...geometry.brows, ...geometry.mouth];
						expect(paths.every(({ d }) => d.length > 0 && !/NaN|undefined/.test(d))).toBe(true);
					}
				}
			}
		}
	});

	it('renders each heart as one normalized path', () => {
		const geometry = createFaceGeometry('wide', 'heart', 'happy', 'none');
		expect(geometry.eyes).toHaveLength(2);
		expect(geometry.eyes.every(({ transform }) => transform === undefined)).toBe(true);
	});
});
