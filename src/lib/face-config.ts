export const faceStorageKey = 'face-maker:current-face';
export const faceCookieName = 'face-maker-face';
export const exportFormatStorageKey = 'face-maker:export-format';
export const exportFormatCookieName = 'face-maker-export-format';
export type ExportFormat = 'png' | 'svg';

export const shapeOptions = [
	{ id: 'soft', label: 'Soft' }, { id: 'round', label: 'Round' },
	{ id: 'tall', label: 'Tall' }, { id: 'square', label: 'Square' },
	{ id: 'wide', label: 'Wide' }, { id: 'oval', label: 'Oval' },
	{ id: 'arch', label: 'Arch' }, { id: 'bean', label: 'Bean' }
] as const;

export const eyeOptions = [
	{ id: 'pebble', label: 'Pebble' }, { id: 'dot', label: 'Dot' },
	{ id: 'sleepy', label: 'Slant' }, { id: 'block', label: 'Block' },
	{ id: 'pill', label: 'Pill' }, { id: 'diamond', label: 'Diamond' },
	{ id: 'dash', label: 'Dash' }, { id: 'drop', label: 'Drop' },
	{ id: 'alien', label: 'Alien' }, { id: 'gem', label: 'Gem' },
	{ id: 'star', label: 'Star' }, { id: 'heart', label: 'Heart' },
	{ id: 'x', label: 'Crossed' }
] as const;

export const moodOptions = [
	{ id: 'happy', label: 'Happy' }, { id: 'curious', label: 'Curious' },
	{ id: 'calm', label: 'Calm' }, { id: 'mischief', label: 'Mischief' },
	{ id: 'surprised', label: 'Surprised' }, { id: 'stern', label: 'Stern' },
	{ id: 'worried', label: 'Worried' }, { id: 'dreamy', label: 'Dreamy' }
] as const;

export const mouthOptions = [
	{ id: 'none', label: 'None' }, { id: 'smile', label: 'Smile' },
	{ id: 'grin', label: 'Grin' }, { id: 'open', label: 'Open' },
	{ id: 'flat', label: 'Flat' }, { id: 'pout', label: 'Pout' },
	{ id: 'ooh', label: 'Ooh' }, { id: 'smirk', label: 'Smirk' }
] as const;

export const paletteOptions = [
	{ id: 'grape', label: 'Grape soda', background: '#d9c5ff', skin: '#f5efff', ink: '#4b238f', randomizable: true },
	{ id: 'tomato', label: 'Tomato cream', background: '#f8cfbb', skin: '#fff1e9', ink: '#70331f', randomizable: true },
	{ id: 'mint', label: 'Mint chip', background: '#bfe8d4', skin: '#eefbf5', ink: '#1b4d42', randomizable: true },
	{ id: 'lemon', label: 'Lemon ink', background: '#f8df72', skin: '#fff9db', ink: '#5b4a00', randomizable: true },
	{ id: 'sky', label: 'Blue hour', background: '#b9ddff', skin: '#eef7ff', ink: '#2251a3', randomizable: true },
	{ id: 'bubblegum', label: 'Bubblegum', background: '#f7c2e1', skin: '#fff0f8', ink: '#7f2358', randomizable: true },
	{ id: 'tangerine', label: 'Tangerine', background: '#ffc18f', skin: '#fff0e4', ink: '#713014', randomizable: true },
	{ id: 'lagoon', label: 'Lagoon', background: '#9fe4df', skin: '#e9fbfa', ink: '#0d5957', randomizable: true },
	{ id: 'pistachio', label: 'Pistachio', background: '#d5e99d', skin: '#f5f9e8', ink: '#3f5118', randomizable: true },
	{ id: 'midnight', label: 'Periwinkle', background: '#cbd3f2', skin: '#f1f3fb', ink: '#29345c', randomizable: true },
	{ id: 'cocoa', label: 'Cocoa cream', background: '#d8b79a', skin: '#f7eee6', ink: '#603f32', randomizable: true },
	{ id: 'mono', label: 'Black & white', background: '#ffffff', skin: '#ffffff', ink: '#111111', randomizable: false }
] as const;

export type FaceShape = (typeof shapeOptions)[number]['id'];
export type EyeStyle = (typeof eyeOptions)[number]['id'];
export type Mood = (typeof moodOptions)[number]['id'];
export type MouthStyle = (typeof mouthOptions)[number]['id'];
export type Palette = (typeof paletteOptions)[number];
export type PaletteId = Palette['id'];
export type FaceConfig = { shape: FaceShape; eyes: EyeStyle; mood: Mood; mouth: MouthStyle; palette: PaletteId };
export type TraitKey = keyof FaceConfig;
export type LockedTraits = Record<TraitKey, boolean>;

export const traitKeys = ['shape', 'eyes', 'mood', 'mouth', 'palette'] as const satisfies readonly TraitKey[];

export const initialFaceConfig: FaceConfig = {
	shape: 'round',
	eyes: 'pebble',
	mood: 'happy',
	mouth: 'none',
	palette: 'grape'
};

export const initialLockedTraits: LockedTraits = {
	shape: false,
	eyes: false,
	mood: false,
	mouth: false,
	palette: false
};

type OptionIds = { [K in TraitKey]: readonly FaceConfig[K][] };

const faceOptionIds: OptionIds = {
	shape: shapeOptions.map(({ id }) => id),
	eyes: eyeOptions.map(({ id }) => id),
	mood: moodOptions.map(({ id }) => id),
	mouth: mouthOptions.map(({ id }) => id),
	palette: paletteOptions.map(({ id }) => id)
};

const randomizableOptionIds: OptionIds = {
	...faceOptionIds,
	palette: paletteOptions.filter(({ randomizable }) => randomizable).map(({ id }) => id)
};

export function getPalette(id: PaletteId): Palette {
	const palette = paletteOptions.find((option) => option.id === id);
	if (!palette) throw new Error(`Unknown palette: ${id}`);
	return palette;
}

function includes<T extends string>(items: readonly T[], value: unknown): value is T {
	return typeof value === 'string' && items.some((item) => item === value);
}

function pick<T>(items: readonly T[], random: () => number): T {
	return items[Math.floor(random() * items.length)];
}

function pickDifferent<K extends TraitKey>(trait: K, current: FaceConfig[K], random: () => number): FaceConfig[K] {
	return pick(randomizableOptionIds[trait].filter((option) => option !== current), random);
}

export function randomizeFace(config: FaceConfig, lockedTraits: LockedTraits, random = Math.random): FaceConfig {
	const hasLocks = traitKeys.some((trait) => lockedTraits[trait]);
	const keptTrait = hasLocks
		? null
		: pick(config.palette === 'mono' ? traitKeys.filter((trait) => trait !== 'palette') : traitKeys, random);
	const next = <K extends TraitKey>(trait: K) =>
		lockedTraits[trait] || trait === keptTrait
			? config[trait]
			: pickDifferent(trait, config[trait], random);

	return {
		shape: next('shape'),
		eyes: next('eyes'),
		mood: next('mood'),
		mouth: next('mouth'),
		palette: next('palette')
	};
}

export function parseExportFormat(value: unknown): ExportFormat | null {
	return value === 'png' || value === 'svg' ? value : null;
}

export function parseFaceConfig(value: unknown): FaceConfig | null {
	if (!value || typeof value !== 'object') return null;
	const config = value as Record<string, unknown>;
	if (
		!includes(faceOptionIds.shape, config.shape) ||
		!includes(faceOptionIds.eyes, config.eyes) ||
		!includes(faceOptionIds.mood, config.mood) ||
		!includes(faceOptionIds.mouth, config.mouth) ||
		!includes(faceOptionIds.palette, config.palette)
	) return null;

	return {
		shape: config.shape,
		eyes: config.eyes,
		mood: config.mood,
		mouth: config.mouth,
		palette: config.palette
	};
}

export function serializeFacePath(config: FaceConfig) {
	return `/${config.shape}-${config.eyes}-${config.mood}-${config.mouth}-${config.palette}`;
}

export function parseFacePath(value: string | undefined) {
	if (!value) return null;
	const [shape, eyes, mood, mouth, palette, extra] = value.split('-');
	if (extra !== undefined) return null;
	return parseFaceConfig({ shape, eyes, mood, mouth, palette });
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
