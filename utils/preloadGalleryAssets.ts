import type { ImageProps } from "./types";
import { getThumbnailUrl } from "./mediaHelpers";

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

type PreloadProgress = {
    loaded: number;
    total: number;
};

export async function preloadGalleryAssets(
    images: ImageProps[],
    onProgress?: (progress: PreloadProgress) => void,
): Promise<void> {
    if (typeof window === "undefined" || images.length === 0) {
        onProgress?.({ loaded: 0, total: images.length });
        return;
    }

    const total = images.length;
    let loaded = 0;

    onProgress?.({ loaded, total });

    const preloadTasks = images.map(async (image) => {
        const urls = [
            getThumbnailUrl(image, 32),
            getThumbnailUrl(image, 180),
            getThumbnailUrl(image, 720),
            getThumbnailUrl(image, 1920),
        ];

        await Promise.allSettled(urls.map((src) => preloadImage(src)));

        loaded += 1;
        onProgress?.({ loaded, total });
    });

    await Promise.allSettled(preloadTasks);
}