import { describe, expect, it } from 'vitest';
import {
	initialFaceConfig,
	initialLockedTraits,
	randomizeFace,
	traitKeys
} from './face-config';
import type { FaceConfig, LockedTraits } from './face-config';

function matchingTraits(first: FaceConfig, second: FaceConfig) {
	return traitKeys.filter((trait) => first[trait] === second[trait]);
}

describe('randomizeFace', () => {
	it('keeps exactly one trait when nothing is locked', () => {
		for (let step = 0; step < 100; step += 1) {
			const next = randomizeFace(initialFaceConfig, initialLockedTraits, () => step / 100);
			expect(matchingTraits(initialFaceConfig, next)).toHaveLength(1);
		}
	});

	it('keeps locked traits and changes every unlocked trait', () => {
		const locks: LockedTraits = {
			...initialLockedTraits,
			eyes: true,
			mouth: true
		};

		for (let step = 0; step < 100; step += 1) {
			const next = randomizeFace(initialFaceConfig, locks, () => step / 100);
			expect(matchingTraits(initialFaceConfig, next)).toEqual(['eyes', 'mouth']);
		}
	});

	it('never chooses the white palette', () => {
		const whiteFace: FaceConfig = { ...initialFaceConfig, palette: 'mono' };

		for (let step = 0; step < 100; step += 1) {
			const next = randomizeFace(whiteFace, initialLockedTraits, () => step / 100);
			expect(next.palette).not.toBe('mono');
		}
	});
});
