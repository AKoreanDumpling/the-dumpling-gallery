'use client'

export default function myImageLoader({ src, width, quality }) {
	const url = new URL('https://wsrv.nl/');
	url.searchParams.set('url', src);
	url.searchParams.set('w', width.toString());
	url.searchParams.set('q', (quality || 75).toString());
	url.searchParams.set('output', 'webp');

	return url.href;
}