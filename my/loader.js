'use client'

export default function myImageLoader({ src, width, quality }) {
	const url = new URL(src.startsWith("http") ? src : `https:${src}`);

	if (url.hostname === "wsrv.nl") {
		url.searchParams.set("w", width.toString());
		url.searchParams.set("q", (quality || 100).toString());
		url.searchParams.set("output", "webp");
		return url.href;
	}

	const wsrvUrl = new URL("https://wsrv.nl/");
	wsrvUrl.searchParams.set("url", src);
	wsrvUrl.searchParams.set("w", width.toString());
	wsrvUrl.searchParams.set("q", (quality || 100).toString());
	wsrvUrl.searchParams.set("output", "webp");

	return wsrvUrl.href;
}