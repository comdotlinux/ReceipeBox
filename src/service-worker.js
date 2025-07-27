import { build, files, version } from '$service-worker';

const CACHE_NAME = `myrecipebox-${version}`;
const ASSETS = [...build, ...files];

// Cache names
const STATIC_CACHE = `static-${version}`;
const RUNTIME_CACHE = `runtime-${version}`;
const API_CACHE = `api-${version}`;

self.addEventListener('install', (event) => {
	console.log('Service Worker installing');
	
	event.waitUntil(
		Promise.all([
			// Cache static assets
			caches.open(STATIC_CACHE).then((cache) => {
				console.log('Caching static assets');
				return cache.addAll(ASSETS);
			}),
			
			// Pre-cache critical pages
			caches.open(RUNTIME_CACHE).then((cache) => {
				console.log('Pre-caching critical pages');
				return cache.addAll([
					'/',
					'/auth/login',
					'/search'
				]);
			})
		]).then(() => {
			console.log('Service Worker installed successfully');
			self.skipWaiting();
		})
	);
});

self.addEventListener('activate', (event) => {
	console.log('Service Worker activating');
	
	event.waitUntil(
		Promise.all([
			// Clean up old caches
			caches.keys().then((cacheNames) => {
				return Promise.all(
					cacheNames
						.filter((cacheName) => 
							cacheName.startsWith('myrecipebox-') && 
							cacheName !== STATIC_CACHE &&
							cacheName !== RUNTIME_CACHE &&
							cacheName !== API_CACHE
						)
						.map((cacheName) => {
							console.log('Deleting old cache:', cacheName);
							return caches.delete(cacheName);
						})
				);
			}),
			
			// Take control of all clients
			self.clients.claim()
		]).then(() => {
			console.log('Service Worker activated successfully');
		})
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') return;

	// Skip external requests
	if (!url.origin.includes(self.location.origin) && !url.pathname.startsWith('/api/')) {
		return;
	}

	// Handle API requests with network-first strategy
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(handleApiRequest(request));
		return;
	}

	// Handle static assets with cache-first strategy
	if (ASSETS.includes(url.pathname)) {
		event.respondWith(handleStaticAsset(request));
		return;
	}

	// Handle pages with network-first strategy
	event.respondWith(handlePageRequest(request));
});

async function handleApiRequest(request) {
	const cache = await caches.open(API_CACHE);
	
	try {
		// Try network first
		const response = await fetch(request);
		
		// Cache successful responses (except authentication endpoints)
		if (response.ok && !request.url.includes('/auth/')) {
			cache.put(request, response.clone());
		}
		
		return response;
	} catch (error) {
		console.log('Network failed for API request, checking cache:', request.url);
		
		// Fall back to cache
		const cachedResponse = await cache.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}
		
		// Return offline response for critical endpoints
		if (request.url.includes('/api/collections/recipes/records')) {
			return new Response(JSON.stringify({
				page: 1,
				perPage: 30,
				totalItems: 0,
				totalPages: 1,
				items: []
			}), {
				status: 200,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
		
		throw error;
	}
}

async function handleStaticAsset(request) {
	const cache = await caches.open(STATIC_CACHE);
	const cachedResponse = await cache.match(request);
	
	if (cachedResponse) {
		return cachedResponse;
	}
	
	// If not in cache, try network
	try {
		const response = await fetch(request);
		cache.put(request, response.clone());
		return response;
	} catch (error) {
		console.log('Failed to fetch static asset:', request.url);
		throw error;
	}
}

async function handlePageRequest(request) {
	const cache = await caches.open(RUNTIME_CACHE);
	
	try {
		// Try network first
		const response = await fetch(request);
		
		// Cache successful responses
		if (response.ok) {
			cache.put(request, response.clone());
		}
		
		return response;
	} catch (error) {
		console.log('Network failed for page request, checking cache:', request.url);
		
		// Fall back to cache
		const cachedResponse = await cache.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}
		
		// Return offline page for navigation requests
		if (request.headers.get('accept')?.includes('text/html')) {
			const offlineResponse = await cache.match('/');
			if (offlineResponse) {
				return offlineResponse;
			}
		}
		
		throw error;
	}
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
	console.log('Background sync triggered:', event.tag);
	
	if (event.tag === 'sync-recipes') {
		event.waitUntil(syncRecipes());
	}
});

async function syncRecipes() {
	try {
		// This would trigger a sync with the main app
		// The main app will handle the actual synchronization logic
		const clients = await self.clients.matchAll();
		clients.forEach(client => {
			client.postMessage({
				type: 'SYNC_RECIPES'
			});
		});
	} catch (error) {
		console.error('Failed to sync recipes:', error);
	}
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
	console.log('Service Worker received message:', event.data);
	
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
	
	if (event.data && event.data.type === 'GET_VERSION') {
		event.ports[0].postMessage({ version });
	}
});