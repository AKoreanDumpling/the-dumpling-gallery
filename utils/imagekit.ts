import crypto from "crypto";
import type { ImageProps } from "./types";

type ImageKitFile = {
    filePath?: string;
    name?: string;
    fileType?: string;
    width?: number;
    height?: number;
    mime?: string;
};
export type { ImageKitFile };

type SignedUrlOptions = {
    expiresInSeconds?: number;
};

const DEFAULT_THUMBNAIL_WIDTHS = [8, 32, 180, 720, 1920, 2560];
const DEFAULT_THUMBNAIL_QUALITY = 90;

function getImageKitPrivateKey(): string {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("Missing IMAGEKIT_PRIVATE_KEY environment variable.");
    }
    return privateKey;
}

function getImageKitUrlEndpoint(): string {
    const endpoint =
        process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT;
    if (!endpoint) {
        throw new Error("Missing IMAGEKIT_URL_ENDPOINT or NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT environment variable.");
    }
    return endpoint.replace(/\/$/, "");
}

function normalizePublicId(publicId: string): string {
    return publicId.startsWith("/") ? publicId.slice(1) : publicId;
}

function buildImageKitUrl(
    media: Pick<ImageProps, "public_id" | "format">,
    transforms: string[] = [],
): string {
    const publicId = normalizePublicId(media.public_id);
    const assetPath = media.format ? `${publicId}.${media.format}` : publicId;
    const baseUrl = `${getImageKitUrlEndpoint()}/${assetPath}`;

    if (transforms.length === 0) {
        return baseUrl;
    }

    const url = new URL(baseUrl);
    url.searchParams.set("tr", transforms.join(","));
    return url.href;
}

function signImageKitUrl(url: string, options?: SignedUrlOptions): string {
    const urlObj = new URL(url);
    const expiryTimestamp = options?.expiresInSeconds
        ? Math.floor(Date.now() / 1000) + options.expiresInSeconds
        : undefined;
    const path = urlObj.pathname.startsWith("/")
        ? urlObj.pathname.slice(1)
        : urlObj.pathname;
    let signatureInput = `${path}${urlObj.search}`;

    if (expiryTimestamp) {
        signatureInput += expiryTimestamp.toString();
    }

    const signature = crypto
        .createHmac("sha1", getImageKitPrivateKey())
        .update(signatureInput)
        .digest("hex");

    if (expiryTimestamp) {
        urlObj.searchParams.set("ik-t", expiryTimestamp.toString());
    }
    // Signature must be lowercase per ImageKit docs.
    urlObj.searchParams.set("ik-s", signature.toLowerCase());
    return urlObj.href;
}

export function addSignedImageUrls(
    images: ImageProps[],
    options?: SignedUrlOptions,
): ImageProps[] {
    return images.map((image) => {
        const signedUrl = signImageKitUrl(buildImageKitUrl(image), options);
        const signedPosterUrl = image.resource_type === "video"
            ? signImageKitUrl(buildImageKitUrl(image, ["f-jpg", "so-0"]), options)
            : undefined;

        return {
            ...image,
            signedUrl,
            ...(signedPosterUrl ? { signedPosterUrl } : {}),
        };
    });
}

export function addSignedImageVariants(
    images: ImageProps[],
    widths: number[] = DEFAULT_THUMBNAIL_WIDTHS,
    options?: SignedUrlOptions,
): ImageProps[] {
    const normalizedWidths = widths.filter((width) => Number.isFinite(width) && width > 0);

    return images.map((image) => {
        const signedUrl = signImageKitUrl(buildImageKitUrl(image), options);
        const signedPosterUrl = image.resource_type === "video"
            ? signImageKitUrl(buildImageKitUrl(image, ["f-jpg", "so-0"]), options)
            : undefined;
        const signedThumbnailUrls = image.resource_type === "video"
            ? undefined
            : Object.fromEntries(
                normalizedWidths.map((width) => [
                    width.toString(),
                    signImageKitUrl(
                        buildImageKitUrl(image, [
                            `w-${width}`,
                            `q-${DEFAULT_THUMBNAIL_QUALITY}`,
                            "f-webp",
                        ]),
                        options,
                    ),
                ]),
            );
        const signedPosterThumbnailUrls = image.resource_type === "video"
            ? Object.fromEntries(
                normalizedWidths.map((width) => [
                    width.toString(),
                    signImageKitUrl(
                        buildImageKitUrl(image, [
                            "f-jpg",
                            "so-0",
                            `w-${width}`,
                            `q-${DEFAULT_THUMBNAIL_QUALITY}`,
                        ]),
                        options,
                    ),
                ]),
            )
            : undefined;

        return {
            ...image,
            signedUrl,
            ...(signedPosterUrl ? { signedPosterUrl } : {}),
            ...(signedThumbnailUrls ? { signedThumbnailUrls } : {}),
            ...(signedPosterThumbnailUrls ? { signedPosterThumbnailUrls } : {}),
        };
    });
}

export function addSignedImageUrl(
    image: ImageProps,
    options?: SignedUrlOptions,
): ImageProps {
    return addSignedImageUrls([image], options)[0];
}

function getImageKitAuthHeader(): string {
    const privateKey = getImageKitPrivateKey();
    const credentials = Buffer.from(`${privateKey}:`).toString("base64");
    return `Basic ${credentials}`;
}

async function fetchImageKitFiles(params: {
    path: string;
    limit: number;
    skip: number;
}): Promise<ImageKitFile[]> {
    const url = new URL("https://api.imagekit.io/v1/files");
    url.searchParams.set("path", params.path);
    url.searchParams.set("limit", params.limit.toString());
    url.searchParams.set("skip", params.skip.toString());

    const response = await fetch(url.href, {
        headers: {
            Authorization: getImageKitAuthHeader(),
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ImageKit listFiles failed: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as ImageKitFile[];
    return data ?? [];
}

export async function listImageKitFiles(
    path: string,
    limit = 400,
): Promise<ImageKitFile[]> {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const pageSize = Math.min(100, Math.max(limit, 1));
    let files: ImageKitFile[] = [];
    let skip = 0;

    while (files.length < limit) {
        const remaining = limit - files.length;
        const batchSize = Math.min(pageSize, remaining);
        const batchFiles = await fetchImageKitFiles({
            path: normalizedPath,
            limit: batchSize,
            skip,
        });

        files = files.concat(batchFiles);
        if (batchFiles.length < batchSize) {
            break;
        }
        skip += batchSize;
    }

    return files.filter((file) => file.fileType !== "folder");
}
