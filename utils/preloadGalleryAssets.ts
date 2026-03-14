import type { ImageProps } from "./types";
import { getFullUrl, getThumbnailUrl, isVideo } from "./mediaHelpers";

function preloadImage(src: string): Promise<void> {
    return new Promise((resolve) => {
        const image = new window.Image();
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = src;

        if (image.complete) {
            resolve();
        }
    });
}

export async function preloadGalleryAssets(images: ImageProps[]): Promise<void> {
    if (typeof window === "undefined" || images.length === 0) {
        return;
    }

    const urls = new Set<string>();

    for (const image of images) {
        urls.add(getThumbnailUrl(image, 32));
        urls.add(getThumbnailUrl(image, 180));
        urls.add(getThumbnailUrl(image, 720));
        urls.add(getThumbnailUrl(image, Number(image.width) || 1920));
        urls.add(getThumbnailUrl(image, 1920));
        if (!isVideo(image)) {
            urls.add(getFullUrl(image));
        }
    }

    await Promise.allSettled(Array.from(urls).map((src) => preloadImage(src)));
}