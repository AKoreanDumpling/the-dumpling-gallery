import getBase64ImageUrl from "./generateBlurPlaceholder";
import type { ImageProps } from "./types";

type ImageKitResource = {
    filePath?: string;
    name?: string;
    fileType?: string;
    width?: number;
    height?: number;
};

function splitFilePath(filePath: string) {
    const normalized = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    const lastDotIndex = normalized.lastIndexOf(".");

    if (lastDotIndex <= 0) {
        return { publicId: normalized, format: "" };
    }

    return {
        publicId: normalized.slice(0, lastDotIndex),
        format: normalized.slice(lastDotIndex + 1),
    };
}

export function mapResourcesToImages(resources: ImageKitResource[]): ImageProps[] {
    return resources.map((resource, index) => {
        const path = resource.filePath ?? resource.name ?? "";
        const { publicId, format } = splitFilePath(path);

        return {
            id: index + 1,
            height: String(resource.height ?? 0),
            width: String(resource.width ?? 0),
            public_id: publicId,
            format,
            resource_type: resource.fileType === "video" ? "video" : "image",
        };
    });
}

export async function addBlurDataUrls(images: ImageProps[]): Promise<ImageProps[]> {
    const blurImagePromises = images.map((image) => getBase64ImageUrl(image));
    const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

    return images.map((image, index) => ({
        ...image,
        blurDataUrl: imagesWithBlurDataUrls[index],
    }));
}

export async function addBlurDataUrl(image: ImageProps): Promise<ImageProps> {
    return {
        ...image,
        blurDataUrl: await getBase64ImageUrl(image),
    };
}
