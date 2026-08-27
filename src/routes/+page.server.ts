import { redirect } from '@sveltejs/kit';
import { faceCookieName, initialFaceConfig, parseFaceCookie, serializeFacePath } from '$lib/face-config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	const config = parseFaceCookie(cookies.get(faceCookieName)) ?? initialFaceConfig;
	redirect(307, serializeFacePath(config));
};
