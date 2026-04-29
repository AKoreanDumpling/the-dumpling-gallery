import type { ImageProps } from "./types";

const IMAGEKIT_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

export function isVideo(media: Pick<ImageProps, "resource_type"> | undefined): boolean {
	return media?.resource_type === "video";
}

function getImageKitEndpoint(): string {
	if (!IMAGEKIT_ENDPOINT) {
		throw new Error("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT is not set.");
	}
	return IMAGEKIT_ENDPOINT.replace(/\/$/, "");
}

function getImageKitAssetPath(
	media: Pick<ImageProps, "public_id" | "format">,
): string {
	if (!media.format) {
		return media.public_id;
	}
	return `${media.public_id}.${media.format}`;
}

function getImageKitUrl(
	media: Pick<ImageProps, "public_id" | "format">,
	transforms: string[] = [],
): string {
	const baseUrl = `${getImageKitEndpoint()}/${getImageKitAssetPath(media)}`;
	if (transforms.length === 0) {
		return baseUrl;
	}

	const url = new URL(baseUrl);
	url.searchParams.set("tr", transforms.join(","));
	return url.href;
}

type MediaWithSignedUrls = Pick<
	ImageProps,
	"public_id" | "format" | "resource_type" | "signedUrl" | "signedPosterUrl" | "signedThumbnailUrls" | "signedPosterThumbnailUrls"
>;

export function getThumbnailUrl(media: MediaWithSignedUrls, width: number): string {
	const widthKey = width.toString();
	const signedVariant = isVideo(media)
		? media.signedPosterThumbnailUrls?.[widthKey] ?? media.signedPosterUrl
		: media.signedThumbnailUrls?.[widthKey];
	if (signedVariant) {
		return signedVariant;
	}

	const signedFallback = isVideo(media) ? media.signedPosterUrl : media.signedUrl;
	if (signedFallback) {
		return signedFallback;
	}

	const transforms = isVideo(media)
		? ["f-jpg", "so-0", `w-${width}`, "q-90"]
		: [`w-${width}`, "q-90", "f-webp"];
	return getImageKitUrl(media, transforms);
}

export function getFullUrl(media: MediaWithSignedUrls): string {
	return media.signedUrl ?? getImageKitUrl(media);
}