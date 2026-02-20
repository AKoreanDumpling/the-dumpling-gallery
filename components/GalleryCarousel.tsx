import Image from "next/image";
import useKeypress from "react-use-keypress";
import type { ImageProps } from "../utils/types";
import { useStoredLastViewedPhoto } from "../utils/useStoredLastViewedPhoto";
import SharedModal from "./SharedModal";

type GalleryCarouselProps = {
    index: number;
    currentPhoto: ImageProps;
    basePath?: string;
    storageKey: string;
};

export default function GalleryCarousel({
    index,
    currentPhoto,
    basePath = "",
    storageKey,
}: GalleryCarouselProps) {
    const [, setLastViewedPhoto] = useStoredLastViewedPhoto(storageKey);
    const listPath = basePath || "/";

    function closeModal() {
        setLastViewedPhoto(currentPhoto.id);
        window.location.href = listPath;
    }

    function changePhotoId(newVal: number) {
        return newVal;
    }

    useKeypress("Escape", () => {
        closeModal();
    });

    return (
        <div className="fixed inset-0 flex items-center justify-center">
            <button
                className="absolute inset-0 z-30 cursor-default bg-black backdrop-blur-2xl"
                onClick={closeModal}
            >
                <Image
                    src={currentPhoto.blurDataUrl}
                    className="pointer-events-none h-full w-full"
                    alt="blurred background"
                    fill
                    priority={true}
                />
            </button>
            <SharedModal
                index={index}
                changePhotoId={changePhotoId}
                currentPhoto={currentPhoto}
                closeModal={closeModal}
                navigation={false}
                basePath={basePath}
            />
        </div>
    );
}
