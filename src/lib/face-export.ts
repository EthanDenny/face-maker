import type { ExportFormat } from './face-config';

const exportSize = 1000;

export function serializeFaceSvg(source: SVGSVGElement) {
	const svg = source.cloneNode(true) as SVGSVGElement;
	svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	svg.setAttribute('width', String(exportSize));
	svg.setAttribute('height', String(exportSize));
	return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(svg)}`;
}

export function createFaceSvgBlob(source: SVGSVGElement) {
	return new Blob([serializeFaceSvg(source)], { type: 'image/svg+xml;charset=utf-8' });
}

export async function createFacePngBlob(source: SVGSVGElement) {
	const url = URL.createObjectURL(createFaceSvgBlob(source));
	try {
		const image = new Image();
		image.decoding = 'async';
		image.src = url;
		await image.decode();

		const canvas = document.createElement('canvas');
		canvas.width = exportSize * 2;
		canvas.height = exportSize * 2;
		const context = canvas.getContext('2d');
		if (!context) throw new Error('Canvas is unavailable');
		context.drawImage(image, 0, 0, canvas.width, canvas.height);

		return await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG encoding failed')), 'image/png');
		});
	} finally {
		URL.revokeObjectURL(url);
	}
}

export async function exportFace(source: SVGSVGElement, format: ExportFormat, filename: string) {
	const blob = format === 'svg' ? createFaceSvgBlob(source) : await createFacePngBlob(source);
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.download = filename;
	link.href = url;
	document.body.append(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url));
}
