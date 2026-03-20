import type { ImageProps } from "./types";

export function isVideo(media: Pick<ImageProps, "resource_type"> | undefined): boolean {
	return media?.resource_type === "video";
}

function getCloudinaryCdnUrl(
	media: Pick<ImageProps, "public_id" | "format" | "resource_type">,
	formatOverride?: string,
): string {
	const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	const type = isVideo(media) ? "video" : "image";
	const format = formatOverride ?? media.format;
	return `https://res.cloudinary.com/${cloud}/${type}/upload/${media.public_id}.${format}`;
}

function getWsrvUrl(src: string, width: number): string {
	const wsrvUrl = new URL("https://wsrv.nl/");
	wsrvUrl.searchParams.set("url", src);
	wsrvUrl.searchParams.set("w", width.toString());
	wsrvUrl.searchParams.set("q", "90");
	wsrvUrl.searchParams.set("output", "webp");
	return wsrvUrl.href;
}

export function getThumbnailUrl(media: Pick<ImageProps, "public_id" | "format" | "resource_type">, width: number): string {
	const source = getCloudinaryCdnUrl(media, isVideo(media) ? "jpg" : undefined);
	return getWsrvUrl(source, width);
}

export function getFullUrl(media: Pick<ImageProps, "public_id" | "format" | "resource_type">): string {
	return getCloudinaryCdnUrl(media);
} 