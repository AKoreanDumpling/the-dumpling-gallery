import type { ImageProps } from "./types";

export function isVideo(media: Pick<ImageProps, "resource_type"> | undefined): boolean {
	return media?.resource_type === "video";
}

export function getThumbnailUrl(media: Pick<ImageProps, "public_id" | "format" | "resource_type">, width: number): string {
	const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	if (isVideo(media)) {
		return `https://res.cloudinary.com/${cloud}/video/upload/so_0,c_scale,w_${width}/${media.public_id}.jpg`;
	}
	return `https://res.cloudinary.com/${cloud}/image/upload/c_scale,w_${width}/${media.public_id}.${media.format}`;
}

export function getFullUrl(media: Pick<ImageProps, "public_id" | "format" | "resource_type">): string {
	const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	const type = isVideo(media) ? "video" : "image";
	return `https://res.cloudinary.com/${cloud}/${type}/upload/${media.public_id}.${media.format}`;
} 