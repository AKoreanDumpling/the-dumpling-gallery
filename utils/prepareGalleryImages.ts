import getBase64ImageUrl from "./generateBlurPlaceholder";
import type { ImageProps } from "./types";

type CloudinaryResource = {
    height: string | number;
    width: string | number;
    public_id: string;
    format: string;
    resource_type?: string;
};

export function mapResourcesToImages(resources: CloudinaryResource[]): ImageProps[] {
    return resources.map((resource, index) => ({
        id: index,
        height: String(resource.height),
        width: String(resource.width),
        public_id: resource.public_id,
        format: resource.format,
        resource_type: resource.resource_type,
    }));
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
