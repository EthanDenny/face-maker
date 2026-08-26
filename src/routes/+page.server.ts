import { faceCookieName, initialFaceConfig, parseFaceCookie } from '$lib/face-config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => ({
	config: parseFaceCookie(cookies.get(faceCookieName)) ?? initialFaceConfig
});
