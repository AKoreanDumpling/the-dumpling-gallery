import type { ImageProps } from "./types";
import { getThumbnailUrl } from "./mediaHelpers";

const cache = new Map<ImageProps, string>();

export default async function getBase64ImageUrl(
	image: ImageProps,
): Promise<string> {
	let url = cache.get(image);
	if (url) {
		return url;
	}

	if (image.resource_type === "video") {
		url = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjYiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiMxYTFhMWEiLz48L3N2Zz4=";
		cache.set(image, url);
		return url;
	}

	const thumbnailUrl = getThumbnailUrl(image, 8);
	const response = await fetch(thumbnailUrl);
	const buffer = await response.arrayBuffer();

	url = `data:image/webp;base64,${Buffer.from(buffer).toString("base64")}`;
	cache.set(image, url);
	return url;
}
