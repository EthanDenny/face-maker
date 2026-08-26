import { exportFormatCookieName, faceCookieName, initialFaceConfig, parseExportFormat, parseFaceCookie } from '$lib/face-config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => ({
	config: parseFaceCookie(cookies.get(faceCookieName)) ?? initialFaceConfig,
	exportFormat: parseExportFormat(cookies.get(exportFormatCookieName)) ?? 'png'
});
