import { redirect } from '@sveltejs/kit';
import {
	exportFormatCookieName,
	faceCookieName,
	initialFaceConfig,
	parseExportFormat,
	parseFaceCookie,
	parseFacePath,
	serializeFacePath
} from '$lib/face-config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies, params }) => {
	const config = parseFacePath(params.face);
	if (!config) {
		const fallback = parseFaceCookie(cookies.get(faceCookieName)) ?? initialFaceConfig;
		redirect(307, serializeFacePath(fallback));
	}

	return {
		config,
		exportFormat: parseExportFormat(cookies.get(exportFormatCookieName)) ?? 'png'
	};
};
