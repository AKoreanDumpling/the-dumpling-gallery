import type { ImageProps } from "./types";

const cache = new Map<ImageProps, string>();

export default async function getBase64ImageUrl(
	image: ImageProps,
): Promise<string> {
	let url = cache.get(image);
	if (url) {
		return url;
	}

	let cloudinaryUrl: string;
	if (image.resource_type === "video") {
		// Use Cloudinary video thumbnail (first frame) for blur placeholder
		cloudinaryUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${image.public_id}.jpg`;
	} else {
		// Original Cloudinary image URL
		cloudinaryUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${image.public_id}.${image.format}`;
	}

	// Use wsrv.nl loader for blur placeholder
	const wsrvUrl = new URL('https://wsrv.nl/');
	wsrvUrl.searchParams.set('url', cloudinaryUrl);
	wsrvUrl.searchParams.set('w', '8');
	wsrvUrl.searchParams.set('q', '70');
	wsrvUrl.searchParams.set('blur', '5');
	wsrvUrl.searchParams.set('output', 'webp');

	const response = await fetch(wsrvUrl.href);
	const buffer = await response.arrayBuffer();

	url = `data:image/webp;base64,${Buffer.from(buffer).toString("base64")}`;
	cache.set(image, url);
	return url;
}
