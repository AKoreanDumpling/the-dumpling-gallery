import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import useKeypress from "react-use-keypress";
import type { ImageProps } from "../utils/types";
import { getThumbnailUrl } from "../utils/mediaHelpers";
import SharedModal from "./SharedModal";

type GalleryModalProps = {
    images: ImageProps[];
    onClose?: () => void;
    basePath?: string;
};

export default function GalleryModal({
    images,
    onClose,
    basePath = "",
}: GalleryModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { photoId } = router.query;
    const initialIndex = Number(photoId);

    const [direction, setDirection] = useState(0);
    const [curIndex, setCurIndex] = useState(initialIndex);

    const currentImage = images[curIndex];
    const listPath = basePath || "/";
    const queryPath = basePath === "" ? "/" : basePath;

    function handleClose() {
        router.push(listPath, undefined, { shallow: true });
        onClose?.();
    }

    function changePhotoId(newVal: number) {
        if (newVal === curIndex) {
            return;
        }
        if (newVal > curIndex) {
            setDirection(1);
        } else {
            setDirection(-1);
        }
        setCurIndex(newVal);
        router.push(
            `${queryPath}?photoId=${newVal}`,
            `${basePath}/p/${newVal}`,
            { shallow: true },
        );
    }

    useKeypress("ArrowRight", () => {
        if (curIndex + 1 < images.length) {
            changePhotoId(curIndex + 1);
        }
    });

    useKeypress("ArrowLeft", () => {
        if (curIndex > 0) {
            changePhotoId(curIndex - 1);
        }
    });

    useKeypress("Escape", () => {
        handleClose();
    });

    return (
        <Dialog
            static
            open={true}
            onClose={handleClose}
            initialFocus={overlayRef}
            className="fixed inset-0 z-10 flex items-center justify-center"
        >
            <motion.div
                ref={overlayRef}
                key="backdrop"
                className="fixed inset-0 z-30 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
                    <AnimatePresence mode="sync">
                        {currentImage && (
                            <motion.div
                                key={currentImage.public_id}
                                className="absolute inset-[-10%]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Image
                                    src={getThumbnailUrl(currentImage, 32)}
                                    alt=""
                                    fill
                                    className="object-cover blur-3xl scale-125 brightness-50"
                                    priority
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="absolute inset-0 bg-black/40 -z-10" />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-50 flex h-full w-full items-center justify-center pointer-events-none"
                    onClick={(e) => e.stopPropagation()}
                >
                    <SharedModal
                        index={curIndex}
                        direction={direction}
                        images={images}
                        changePhotoId={changePhotoId}
                        closeModal={handleClose}
                        navigation={true}
                        basePath={basePath}
                    />
                </motion.div>
            </motion.div>
        </Dialog>
    );
}
