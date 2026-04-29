'use client'

const IMAGEKIT_HOSTNAME = "ik.imagekit.io";

function hasSignedParams(url) {
	return url.searchParams.has("ik-s") || url.searchParams.has("ik-t");
}

export default function myImageLoader({ src, width, quality }) {
	if (src.startsWith("/")) {
		return src;
	}

	const url = new URL(src.startsWith("http") ? src : `https:${src}`);
	if (url.hostname !== IMAGEKIT_HOSTNAME) {
		return url.href;
	}

	if (hasSignedParams(url) || url.searchParams.has("tr")) {
		return url.href;
	}

	const transforms = [];
	if (width) {
		transforms.push(`w-${width}`);
	}
	transforms.push(`q-${quality || 90}`);
	transforms.push("f-webp");
	url.searchParams.set("tr", transforms.join(","));

	return url.href;
}