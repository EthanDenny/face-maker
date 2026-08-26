export const faceStorageKey = 'face-maker:current-face';
export const faceCookieName = 'face-maker-face';
export const exportFormatStorageKey = 'face-maker:export-format';
export const exportFormatCookieName = 'face-maker-export-format';
export type ExportFormat = 'png' | 'svg';

const faceOptions = {
	shape: ['soft', 'round', 'tall', 'square', 'wide', 'oval', 'arch', 'bean'],
	eyes: ['pebble', 'dot', 'sleepy', 'block', 'pill', 'diamond', 'dash', 'drop', 'alien', 'gem', 'star', 'x'],
	mood: ['happy', 'curious', 'calm', 'mischief', 'surprised', 'stern', 'worried', 'dreamy'],
	mouth: ['none', 'smile', 'grin', 'open', 'flat', 'pout', 'ooh', 'smirk'],
	palette: ['grape', 'tomato', 'mint', 'lemon', 'sky', 'bubblegum', 'tangerine', 'lagoon', 'pistachio', 'midnight', 'cocoa', 'mono']
} as const;

export type FaceShape = (typeof faceOptions.shape)[number];
export type EyeStyle = (typeof faceOptions.eyes)[number];
export type Mood = (typeof faceOptions.mood)[number];
export type MouthStyle = (typeof faceOptions.mouth)[number];
export type FaceConfig = { shape: FaceShape; eyes: EyeStyle; mood: Mood; mouth: MouthStyle; palette: string };

export const initialFaceConfig: FaceConfig = {
	shape: 'round',
	eyes: 'pebble',
	mood: 'happy',
	mouth: 'none',
	palette: 'grape'
};

export function parseExportFormat(value: unknown): ExportFormat | null {
	return value === 'png' || value === 'svg' ? value : null;
}

function includes<T extends string>(items: readonly T[], value: unknown): value is T {
	return typeof value === 'string' && items.includes(value as T);
}

export function parseFaceConfig(value: unknown): FaceConfig | null {
	if (!value || typeof value !== 'object') return null;
	const config = value as Record<string, unknown>;
	if (
		!includes(faceOptions.shape, config.shape) ||
		!includes(faceOptions.eyes, config.eyes) ||
		!includes(faceOptions.mood, config.mood) ||
		!includes(faceOptions.mouth, config.mouth) ||
		!includes(faceOptions.palette, config.palette)
	) return null;

	return {
		shape: config.shape,
		eyes: config.eyes,
		mood: config.mood,
		mouth: config.mouth,
		palette: config.palette
	};
}

export function serializeFaceCookie(config: FaceConfig) {
	return [config.shape, config.eyes, config.mood, config.mouth, config.palette].join('.');
}

export function parseFaceCookie(value: string | undefined) {
	if (!value) return null;
	const [shape, eyes, mood, mouth, palette, extra] = value.split('.');
	if (extra !== undefined) return null;
	return parseFaceConfig({ shape, eyes, mood, mouth, palette });
}
