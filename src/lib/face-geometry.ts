import type { EyeStyle, FaceShape, Mood, MouthStyle } from './face-config';

type Paint = 'ink' | 'skin' | 'none';
type StrokeStyle = 'outline' | 'brow' | 'mouth';

export type SvgPath = {
	d: string;
	fill: Paint;
	stroke?: Paint;
	strokeStyle?: StrokeStyle;
	transform?: string;
};

export type FaceGeometry = {
	head: SvgPath;
	transform?: string;
	eyes: SvgPath[];
	brows: SvgPath[];
	mouth: SvgPath[];
};

type Radii = readonly [number, number, number, number];
type HeadMetrics = { x: number; y: number; width: number; height: number; rotation: number; radiiX: Radii; radiiY: Radii };

const outlineWidth = 15;
const browWidth = 18.75;
const mouthLineWidth = 16.875;

const headShapes: Record<FaceShape, Omit<HeadMetrics, 'x' | 'y'>> = {
	soft: { width: 570, height: 640, rotation: -1, radiiX: [46, 54, 48, 52], radiiY: [41, 43, 57, 59] },
	round: { width: 610, height: 610, rotation: 0, radiiX: [50, 50, 50, 50], radiiY: [50, 50, 50, 50] },
	tall: { width: 500, height: 690, rotation: 0, radiiX: [44, 44, 50, 50], radiiY: [38, 38, 62, 62] },
	square: { width: 600, height: 590, rotation: 0, radiiX: [24, 20, 27, 22], radiiY: [24, 20, 27, 22] },
	wide: { width: 700, height: 520, rotation: 0, radiiX: [48, 52, 45, 55], radiiY: [52, 48, 52, 48] },
	oval: { width: 530, height: 720, rotation: 0, radiiX: [50, 50, 50, 50], radiiY: [50, 50, 50, 50] },
	arch: { width: 600, height: 660, rotation: 0, radiiX: [50, 50, 24, 24], radiiY: [44, 44, 22, 22] },
	bean: { width: 650, height: 580, rotation: 2, radiiX: [58, 42, 55, 45], radiiY: [43, 55, 45, 57] }
};

function number(value: number) {
	return Number(value.toFixed(2));
}

function roundedRectPath(x: number, y: number, width: number, height: number, radiiX: Radii, radiiY: Radii = radiiX) {
	const rx = radiiX.map((radius) => width * radius / 100);
	const ry = radiiY.map((radius) => height * radius / 100);
	const scale = Math.min(
		1,
		width / Math.max(rx[0] + rx[1], rx[3] + rx[2]),
		height / Math.max(ry[0] + ry[3], ry[1] + ry[2])
	);
	const [tlx, trx, brx, blx] = rx.map((radius) => number(radius * scale));
	const [tly, try_, bry, bly] = ry.map((radius) => number(radius * scale));
	const right = number(x + width);
	const bottom = number(y + height);

	return [
		`M ${number(x + tlx)} ${number(y)}`,
		`H ${number(right - trx)}`,
		`A ${trx} ${try_} 0 0 1 ${right} ${number(y + try_)}`,
		`V ${number(bottom - bry)}`,
		`A ${brx} ${bry} 0 0 1 ${number(right - brx)} ${bottom}`,
		`H ${number(x + blx)}`,
		`A ${blx} ${bly} 0 0 1 ${number(x)} ${number(bottom - bly)}`,
		`V ${number(y + tly)}`,
		`A ${tlx} ${tly} 0 0 1 ${number(x + tlx)} ${number(y)}`,
		'Z'
	].join(' ');
}

function polygonPath(x: number, y: number, width: number, height: number, points: readonly (readonly [number, number])[]) {
	return `${points.map(([px, py], index) => `${index ? 'L' : 'M'} ${number(x + width * px / 100)} ${number(y + height * py / 100)}`).join(' ')} Z`;
}

function ellipsePath(x: number, y: number, width: number, height: number) {
	return roundedRectPath(x, y, width, height, [50, 50, 50, 50]);
}

function heartPath(x: number, y: number, width: number, height: number) {
	const point = (px: number, py: number) => `${number(x + width * px / 100)} ${number(y + height * py / 100)}`;
	return [
		`M ${point(50, 100)}`,
		`C ${point(44, 91)} ${point(4, 66)} ${point(4, 36)}`,
		`C ${point(4, 14)} ${point(19, 2)} ${point(36, 2)}`,
		`C ${point(44, 2)} ${point(48, 7)} ${point(50, 14)}`,
		`C ${point(52, 7)} ${point(56, 2)} ${point(64, 2)}`,
		`C ${point(81, 2)} ${point(96, 14)} ${point(96, 36)}`,
		`C ${point(96, 66)} ${point(56, 91)} ${point(50, 100)}`,
		'Z'
	].join(' ');
}

function transformAround(angle: number, x: number, y: number, width: number, height: number) {
	return `rotate(${angle} ${number(x + width / 2)} ${number(y + height / 2)})`;
}

function pair(containerX: number, containerWidth: number, itemWidth: number) {
	return [containerX, containerX + containerWidth - itemWidth] as const;
}

function eyePaths(style: EyeStyle, head: HeadMetrics): SvgPath[] {
	let x = head.x + head.width * 0.39;
	let y = head.y + head.height * 0.33;
	let width = head.width * 0.49;
	let height = head.height * 0.28;

	if (style === 'dot') {
		x = head.x + head.width * 0.44;
		width = head.width * 0.42;
	}
	if (style === 'alien') {
		x = head.x + head.width * 0.36;
		y = head.y + head.height * 0.35;
		width = head.width * 0.53;
		height = head.height * 0.27;
	}

	const solid = (d: string, transform?: string): SvgPath => ({ d, fill: 'ink', transform });
	const roundedPair = (widthRatio: number, heightRatio: number, radiiX: Radii, radiiY: Radii = radiiX, angle = 0) => {
		const itemWidth = width * widthRatio;
		const itemHeight = height * heightRatio;
		const itemY = y + (height - itemHeight) / 2;
		return pair(x, width, itemWidth).map((itemX) => solid(
			roundedRectPath(itemX, itemY, itemWidth, itemHeight, radiiX, radiiY),
			angle ? transformAround(angle, itemX, itemY, itemWidth, itemHeight) : undefined
		));
	};
	const squarePair = (widthRatio: number, path: (itemX: number, itemY: number, size: number) => string, angle = 0) => {
		const size = width * widthRatio;
		const itemY = y + (height - size) / 2;
		return pair(x, width, size).map((itemX) => solid(
			path(itemX, itemY, size),
			angle ? transformAround(angle, itemX, itemY, size, size) : undefined
		));
	};

	switch (style) {
		case 'pebble': return roundedPair(0.34, 0.96, [50, 50, 50, 50]);
		case 'dot': return squarePair(0.31, (itemX, itemY, size) => ellipsePath(itemX, itemY, size, size));
		case 'sleepy': return roundedPair(0.32, 0.76, [50, 50, 50, 50], undefined, -34);
		case 'block': return squarePair(0.33, (itemX, itemY, size) => roundedRectPath(itemX, itemY, size, size, [14, 14, 14, 14]));
		case 'pill': return roundedPair(0.31, 0.94, [50, 50, 50, 50]);
		case 'diamond': return squarePair(0.29, (itemX, itemY, size) => roundedRectPath(itemX, itemY, size, size, [8, 8, 8, 8]), 45);
		case 'dash': return roundedPair(0.36, 0.25, [50, 50, 50, 50]);
		case 'drop': return roundedPair(0.31, 0.91, [58, 42, 58, 42], undefined, -22);
		case 'gem': return squarePair(0.35, (itemX, itemY, size) => polygonPath(itemX, itemY, size, size, [[22, 0], [78, 0], [100, 30], [50, 100], [0, 30]]));
		case 'star': return squarePair(0.36, (itemX, itemY, size) => polygonPath(itemX, itemY, size, size, [[50, 0], [61, 34], [98, 35], [68, 56], [79, 94], [50, 72], [21, 94], [32, 56], [2, 35], [39, 34]]));
		case 'x': return squarePair(0.34, (itemX, itemY, size) => polygonPath(itemX, itemY, size, size, [[0, 18], [18, 0], [50, 32], [82, 0], [100, 18], [68, 50], [100, 82], [82, 100], [50, 68], [18, 100], [0, 82], [32, 50]]));
		case 'heart': return squarePair(0.36, (itemX, itemY, size) => heartPath(itemX, itemY, size, size));
		case 'alien': {
			const itemWidth = width * 0.43;
			const itemHeight = height;
			const [leftX, rightX] = pair(x, width, itemWidth);
			return [
				solid(
					roundedRectPath(leftX, y, itemWidth, itemHeight, [10, 82, 0, 78], [12, 76, 0, 72]),
					transformAround(4, leftX, y, itemWidth, itemHeight)
				),
				solid(
					roundedRectPath(rightX, y, itemWidth, itemHeight, [82, 10, 78, 0], [76, 12, 72, 0]),
					transformAround(-4, rightX, y, itemWidth, itemHeight)
				)
			];
		}
	}
}

function browPaths(mood: Mood, head: HeadMetrics): SvgPath[] {
	if (mood === 'calm') return [];

	const containerX = head.x + head.width * 0.4;
	const containerWidth = head.width * 0.47;
	const width = containerWidth * 0.29;
	const y = head.y + head.height * 0.27 + browWidth / 2;
	const [leftX, rightX] = pair(containerX, containerWidth, width);
	const line = (x: number, lineY: number, angle = 0, scale = 1): SvgPath => {
		const visualWidth = width * scale;
		const inset = (width - visualWidth) / 2 + browWidth / 2;
		return {
			d: `M ${number(x + inset)} ${number(lineY)} L ${number(x + width - inset)} ${number(lineY)}`,
			fill: 'none',
			stroke: 'ink',
			strokeStyle: 'brow',
			transform: angle ? `rotate(${angle} ${number(x + width / 2)} ${number(lineY)})` : undefined
		};
	};

	if (mood === 'happy') {
		return [leftX, rightX].map((x) => ({
			d: `M ${number(x + browWidth / 2)} ${number(y - 1)} Q ${number(x + width / 2)} ${number(y - 12)} ${number(x + width - browWidth / 2)} ${number(y - 1)}`,
			fill: 'none',
			stroke: 'ink',
			strokeStyle: 'brow'
		}));
	}
	if (mood === 'curious') return [line(leftX, y - 11.25, -12), line(rightX, y, 8)];
	if (mood === 'mischief') return [line(leftX, y, 13), line(rightX, y, -13)];
	if (mood === 'surprised') return [line(leftX, y - 16.875, 0, 0.82), line(rightX, y - 16.875, 0, 0.82)];
	if (mood === 'stern') return [line(leftX, y + 9.375), line(rightX, y + 9.375)];
	if (mood === 'worried') return [line(leftX, y, -13), line(rightX, y, 13)];
	return [line(leftX, y - 9.375, -8)];
}

function mouthPaths(style: MouthStyle, head: HeadMetrics): SvgPath[] {
	if (style === 'none') return [];

	const solid = (d: string, fill: Paint = 'ink', transform?: string): SvgPath => ({ d, fill, transform });
	const defaultX = head.x + head.width * 0.61;
	const defaultY = head.y + head.height * 0.68;
	const defaultWidth = head.width * 0.23;

	switch (style) {
		case 'smile': {
			const y = head.y + head.height * 0.69;
			return [solid(roundedRectPath(defaultX, y, defaultWidth, head.height * 0.11, [12, 12, 55, 55], [16, 16, 100, 100]))];
		}
		case 'grin': {
			const inset = outlineWidth / 2;
			return [{
				d: roundedRectPath(defaultX + inset, defaultY + inset, defaultWidth - inset * 2, head.height * 0.13 - inset * 2, [35, 35, 55, 55]),
				fill: 'skin',
				stroke: 'ink',
				strokeStyle: 'outline'
			}];
		}
		case 'open': {
			const x = head.x + head.width * 0.67;
			return [solid(ellipsePath(x, defaultY, head.width * 0.11, head.height * 0.15))];
		}
		case 'flat': {
			const y = head.y + head.height * 0.72;
			return [{ d: `M ${number(defaultX + mouthLineWidth / 2)} ${number(y + mouthLineWidth / 2)} L ${number(defaultX + defaultWidth - mouthLineWidth / 2)} ${number(y + mouthLineWidth / 2)}`, fill: 'none', stroke: 'ink', strokeStyle: 'mouth' }];
		}
		case 'pout': {
			const y = head.y + head.height * 0.72;
			return [solid(roundedRectPath(defaultX, y, defaultWidth, head.height * 0.11, [55, 55, 12, 12], [100, 100, 16, 16]))];
		}
		case 'ooh': {
			const x = head.x + head.width * 0.67;
			const size = head.width * 0.11;
			const inset = outlineWidth / 2;
			return [{ d: ellipsePath(x + inset, defaultY + inset, size - inset * 2, size - inset * 2), fill: 'skin', stroke: 'ink', strokeStyle: 'outline' }];
		}
		case 'smirk': {
			const x = head.x + head.width * 0.64;
			const y = head.y + head.height * 0.71;
			const width = head.width * 0.18;
			return [{
				d: `M ${number(x + mouthLineWidth / 2)} ${number(y + mouthLineWidth / 2)} L ${number(x + width - mouthLineWidth / 2)} ${number(y + mouthLineWidth / 2)}`,
				fill: 'none',
				stroke: 'ink',
				strokeStyle: 'mouth',
				transform: transformAround(-14, x, y, width, mouthLineWidth)
			}];
		}
	}
}

export function createFaceGeometry(shape: FaceShape, eyes: EyeStyle, mood: Mood, mouth: MouthStyle): FaceGeometry {
	const spec = headShapes[shape];
	const head: HeadMetrics = {
		...spec,
		x: 500 - spec.width / 2,
		y: 530 - spec.height / 2
	};
	const content: HeadMetrics = {
		...head,
		x: head.x + outlineWidth,
		y: head.y + outlineWidth,
		width: head.width - outlineWidth * 2,
		height: head.height - outlineWidth * 2
	};
	const pathInset = outlineWidth / 2;

	return {
		head: {
			d: roundedRectPath(head.x + pathInset, head.y + pathInset, head.width - outlineWidth, head.height - outlineWidth, head.radiiX, head.radiiY),
			fill: 'skin',
			stroke: 'ink',
			strokeStyle: 'outline'
		},
		transform: head.rotation ? `rotate(${head.rotation} 500 530)` : undefined,
		eyes: eyePaths(eyes, content),
		brows: browPaths(mood, content),
		mouth: mouthPaths(mouth, content)
	};
}
