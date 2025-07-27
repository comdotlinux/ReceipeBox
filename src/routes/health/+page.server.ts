import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		status: 'healthy',
		timestamp: new Date().toISOString(),
		service: 'MyRecipeBox Frontend'
	};
};