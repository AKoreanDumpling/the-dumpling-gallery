import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import useKeypress from "react-use-keypress";
import type { ImageProps } from "../utils/types";
import { getThumbnailUrl } from "../utils/mediaHelpers";
import SharedModal from "../components/SharedModal";

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

    const [curIndex, setCurIndex] = useState(initialIndex);
    const [isUiVisible, setIsUiVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [useSharedLayout, setUseSharedLayout] = useState(false);
    const [openAnimation, setOpenAnimation] = useState<{
        src: { top: number; left: number; width: number; height: number };
        dest: { top: number; left: number; width: number; height: number };
        image: ImageProps;
    } | null>(null);
    const [closeAnimation, setCloseAnimation] = useState<{
        src: { top: number; left: number; width: number; height: number };
        dest: { top: number; left: number; width: number; height: number };
        image: ImageProps;
    } | null>(null);
    const closingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeMediaElementRef = useRef<HTMLElement | null>(null);
    const openAnimationPlayedRef = useRef(false);
    const closeFrameRef = useRef<number | null>(null);

    const currentImage = images[curIndex - 1];
    const listPath = basePath || "/";
    const queryPath = basePath === "" ? "/" : basePath;

    function scrollPhotoIntoView(photoIndex: number) {
        const photoElement = document.querySelector<HTMLElement>(`[data-photo-id="${photoIndex}"]`);
        photoElement?.scrollIntoView({ block: "center", behavior: "auto" });
    }

    function handleClose() {
        if (isClosing) {
            return;
        }

        setUseSharedLayout(false);
        setIsClosing(true);
        setIsUiVisible(false);
        scrollPhotoIntoView(curIndex);

        closeFrameRef.current = requestAnimationFrame(() => {
            const sourceRect = activeMediaElementRef.current?.getBoundingClientRect();
            const targetRect = document.querySelector<HTMLElement>(`[data-photo-id="${curIndex}"]`)?.getBoundingClientRect();

            if (currentImage && sourceRect && targetRect) {
                setCloseAnimation({
                    src: {
                        top: sourceRect.top,
                        left: sourceRect.left,
                        width: sourceRect.width,
                        height: sourceRect.height,
                    },
                    dest: {
                        top: targetRect.top,
                        left: targetRect.left,
                        width: targetRect.width,
                        height: targetRect.height,
                    },
                    image: currentImage,
                });
            }

            closingTimeoutRef.current = setTimeout(() => {
                router.push(listPath, undefined, { shallow: true, scroll: false });
                onClose?.();
            }, sourceRect && targetRect ? 280 : 180);
        });
    }

    function changePhotoId(newVal: number) {
        if (newVal === curIndex) {
            return;
        }

        if (useSharedLayout) {
            setUseSharedLayout(false);
        }

        setCurIndex(newVal);
        router.push(
            `${queryPath}?photoId=${newVal}`,
            `${basePath}/p/${newVal}`,
            { shallow: true, scroll: false },
        );
    }

    useKeypress("ArrowRight", () => {
        if (curIndex < images.length) {
            changePhotoId(curIndex + 1);
        }
    });

    useKeypress("ArrowLeft", () => {
        if (curIndex > 1) {
            changePhotoId(curIndex - 1);
        }
    });

    useKeypress("Escape", () => {
        handleClose();
    });

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setIsUiVisible(true);
        });

        return () => {
            cancelAnimationFrame(frame);
            if (closeFrameRef.current) {
                cancelAnimationFrame(closeFrameRef.current);
            }
            if (closingTimeoutRef.current) {
                clearTimeout(closingTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isClosing) {
            scrollPhotoIntoView(curIndex);
        }
    }, [curIndex, isClosing]);

    return (
        <Dialog
            static
            open={true}
            onClose={handleClose}
            initialFocus={overlayRef}
            className="fixed inset-0 z-10 flex items-center justify-center"
        >
            <div
                ref={overlayRef}
                key="backdrop"
                className="fixed inset-0 z-30 flex items-center justify-center"
            >
                <motion.div
                    className="absolute inset-0 -z-10 overflow-hidden bg-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isClosing ? 0 : 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    <AnimatePresence mode="sync" initial={false}>
                        {currentImage && (
                            <motion.div
                                key={currentImage.public_id}
                                className="absolute inset-[-10%]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                            >
                                <Image
                                    src={getThumbnailUrl(currentImage, 32)}
                                    alt=""
                                    fill
                                    unoptimized
                                    className="object-cover blur-3xl scale-125 brightness-50"
                                    priority
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                <motion.div
                    className="absolute inset-0 -z-10 bg-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isClosing ? 0 : 0.4 }}
                    transition={{ duration: isClosing ? 0 : 0.25, ease: "easeOut" }}
                />

                <div
                    className="relative z-50 flex h-full w-full items-center justify-center pointer-events-none"
                    onClick={(e) => e.stopPropagation()}
                >
                    <SharedModal
                        index={curIndex}
                        images={images}
                        changePhotoId={changePhotoId}
                        closeModal={handleClose}
                        navigation={true}
                        uiVisible={isUiVisible}
                        useSharedLayout={useSharedLayout}
                        hideActiveMedia={Boolean(openAnimation) || Boolean(closeAnimation)}
                        onMediaElementChange={(element) => {
                            activeMediaElementRef.current = element;

                            if (!openAnimationPlayedRef.current && !isClosing && element && currentImage) {
                                const sourceRect = document.querySelector<HTMLElement>(`[data-photo-id="${curIndex}"]`)?.getBoundingClientRect();
                                const destRect = element.getBoundingClientRect();

                                if (sourceRect && sourceRect.width > 0 && sourceRect.height > 0 && destRect.width > 0 && destRect.height > 0) {
                                    openAnimationPlayedRef.current = true;
                                    setOpenAnimation({
                                        src: {
                                            top: sourceRect.top,
                                            left: sourceRect.left,
                                            width: sourceRect.width,
                                            height: sourceRect.height,
                                        },
                                        dest: {
                                            top: destRect.top,
                                            left: destRect.left,
                                            width: destRect.width,
                                            height: destRect.height,
                                        },
                                        image: currentImage,
                                    });
                                }
                            }
                        }}
                        basePath={basePath}
                    />
                </div>

                {openAnimation && (
                    <motion.div
                        className="pointer-events-none fixed z-[70] overflow-hidden rounded-lg"
                        initial={{
                            top: openAnimation.src.top,
                            left: openAnimation.src.left,
                            width: openAnimation.src.width,
                            height: openAnimation.src.height,
                            opacity: 1,
                        }}
                        animate={{
                            top: openAnimation.dest.top,
                            left: openAnimation.dest.left,
                            width: openAnimation.dest.width,
                            height: openAnimation.dest.height,
                            opacity: 1,
                        }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        onAnimationComplete={() => {
                            setOpenAnimation(null);
                        }}
                    >
                        <div
                            className="relative h-full w-full"
                            style={{
                                aspectRatio: `${Number(openAnimation.image.width) || 3} / ${Number(openAnimation.image.height) || 2}`,
                            }}
                        >
                            <Image
                                src={getThumbnailUrl(openAnimation.image, 1920)}
                                alt=""
                                fill
                                unoptimized
                                placeholder="blur"
                                blurDataURL={openAnimation.image.blurDataUrl}
                                sizes="100vw"
                                className="object-contain"
                            />
                        </div>
                    </motion.div>
                )}

                <AnimatePresence>
                    {closeAnimation && (
                        <motion.div
                            className="pointer-events-none fixed z-[70] overflow-hidden rounded-lg"
                            initial={{
                                top: closeAnimation.src.top,
                                left: closeAnimation.src.left,
                                width: closeAnimation.src.width,
                                height: closeAnimation.src.height,
                                opacity: 1,
                            }}
                            animate={{
                                top: closeAnimation.dest.top,
                                left: closeAnimation.dest.left,
                                width: closeAnimation.dest.width,
                                height: closeAnimation.dest.height,
                                opacity: 1,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div
                                className="relative h-full w-full"
                                style={{
                                    aspectRatio: `${Number(closeAnimation.image.width) || 3} / ${Number(closeAnimation.image.height) || 2}`,
                                }}
                            >
                                <Image
                                    src={getThumbnailUrl(closeAnimation.image, 1920)}
                                    alt=""
                                    fill
                                    unoptimized
                                    placeholder="blur"
                                    blurDataURL={closeAnimation.image.blurDataUrl}
                                    sizes="100vw"
                                    className="object-contain"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Dialog>
    );
}
