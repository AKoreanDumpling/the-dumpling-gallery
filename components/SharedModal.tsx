import {
    ArrowDownTrayIcon,
    ArrowTopRightOnSquareIcon,
    ArrowUturnLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import downloadPhoto from "../utils/downloadPhoto";
import { getFullUrl, getThumbnailUrl, isVideo } from "../utils/mediaHelpers";
import { range } from "../utils/range";
import type { ImageProps, SharedModalProps } from "../utils/types";

const mediaVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 56 : direction < 0 ? -56 : 0,
        opacity: direction === 0 ? 1 : 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -56 : direction < 0 ? 56 : 0,
        opacity: direction === 0 ? 1 : 0,
    }),
};

export default function SharedModal({
    index,
    images,
    changePhotoId,
    closeModal,
    navigation,
    uiVisible = true,
    useSharedLayout = true,
    hideActiveMedia = false,
    onMediaElementChange,
    currentPhoto,
    basePath = "",
}: SharedModalProps) {
    const [thumbnailsLoaded, setThumbnailsLoaded] = useState<Set<number>>(new Set());
    const [transitionDirection, setTransitionDirection] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const animatedPhotoRef = useRef<HTMLDivElement>(null);
    const preloadStartedRef = useRef(false);
    const previousIndexRef = useRef(index);
    const activeThumbnailRef = useRef<HTMLButtonElement>(null);
    const thumbnailRailRef = useRef<HTMLDivElement>(null);
    const thumbnailScrollFrameRef = useRef<number | null>(null);

    const filteredImages: ImageProps[] | undefined = images?.filter((img: ImageProps) =>
        range(index - 15, index + 15).includes(img.id),
    );

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if (index < (images?.length ?? 0) - 1) {
                changePhotoId(index + 1);
            }
        },
        onSwipedRight: () => {
            if (index > 0) {
                changePhotoId(index - 1);
            }
        },
        trackMouse: true,
    });

    const currentImage = images ? images[index] : currentPhoto;
    const imagesLength = images?.length ?? 0;
    const effectiveDirection =
        index === previousIndexRef.current
            ? transitionDirection
            : index > previousIndexRef.current
                ? 1
                : -1;

    const handleThumbnailLoad = (id: number) => {
        setThumbnailsLoaded((prev) => new Set(prev).add(id));
    };

    const scrollThumbnailRail = (direction: "left" | "right") => {
        const rail = thumbnailRailRef.current;
        if (!rail) {
            return;
        }
        const scrollAmount = Math.max(rail.clientWidth * 0.6, 180);
        rail.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const animateThumbnailRailToActive = () => {
        const rail = thumbnailRailRef.current;
        const activeThumbnail = activeThumbnailRef.current;

        if (!rail || !activeThumbnail) {
            return;
        }

        if (thumbnailScrollFrameRef.current) {
            cancelAnimationFrame(thumbnailScrollFrameRef.current);
            thumbnailScrollFrameRef.current = null;
        }

        const start = rail.scrollLeft;
        const railRect = rail.getBoundingClientRect();
        const thumbRect = activeThumbnail.getBoundingClientRect();
        const railCenterX = railRect.left + railRect.width / 2;
        const thumbCenterX = thumbRect.left + thumbRect.width / 2;
        const targetCenter = start + (thumbCenterX - railCenterX);
        const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
        const target = Math.min(Math.max(targetCenter, 0), Math.max(maxScrollLeft, 0));
        const delta = target - start;

        if (Math.abs(delta) < 1) {
            rail.scrollLeft = target;
            return;
        }

        const duration = 260;
        const startTime = performance.now();
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const step = (timestamp: number) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);

            rail.scrollLeft = start + delta * easedProgress;

            if (progress < 1) {
                thumbnailScrollFrameRef.current = requestAnimationFrame(step);
            } else {
                thumbnailScrollFrameRef.current = null;
            }
        };

        thumbnailScrollFrameRef.current = requestAnimationFrame(step);
    };

    useEffect(() => {
        if (!images?.length || preloadStartedRef.current) {
            return;
        }
        preloadStartedRef.current = true;

        images.forEach((image) => {
            const fullUrl = getFullUrl(image);
            if (isVideo(image)) {
                const video = document.createElement("video");
                video.src = fullUrl;
                video.preload = "metadata";
            } else {
                const img = new window.Image();
                img.src = fullUrl;
            }

            const thumbnailSrc = getThumbnailUrl(image, 1920);
            const thumbnailImg = new window.Image();
            thumbnailImg.src = thumbnailSrc;
        });
    }, [navigation, images]);

    useEffect(() => {
        if (index > previousIndexRef.current) {
            setTransitionDirection(1);
        } else if (index < previousIndexRef.current) {
            setTransitionDirection(-1);
        } else {
            setTransitionDirection(0);
        }

        previousIndexRef.current = index;
    }, [index]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            animateThumbnailRailToActive();
        });

        return () => {
            cancelAnimationFrame(frame);
        };
    }, [index, filteredImages, uiVisible]);

    useEffect(() => {
        return () => {
            if (thumbnailScrollFrameRef.current) {
                cancelAnimationFrame(thumbnailScrollFrameRef.current);
            }
        };
    }, []);

    const setActiveMediaElement = (element: HTMLElement | null) => {
        onMediaElementChange?.(element);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col pointer-events-auto" {...handlers}>
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: uiVisible ? 1 : 0, y: uiVisible ? 0 : -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ pointerEvents: uiVisible ? "auto" : "none" }}
                className={`flex-shrink-0 z-50 flex items-center justify-between p-3 ${basePath === "/private" ? "pt-12" : ""}`}
            >
                <button
                    onClick={closeModal}
                    className="cursor-pointer rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg"
                >
                    {navigation ? (
                        <XMarkIcon className="h-5 w-5" />
                    ) : (
                        <ArrowUturnLeftIcon className="h-5 w-5" />
                    )}
                </button>
                <div className="flex items-center gap-2">
                    {navigation && (
                        <a
                            href={`${basePath}/p/${index}`}
                            className="cursor-pointer rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg"
                            title="Open"
                            rel="noreferrer"
                        >
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                        </a>
                    )}
                    <button
                        onClick={() =>
                            downloadPhoto(
                                getFullUrl(currentImage),
                                `${index}.${isVideo(currentImage) ? currentImage?.format || "mp4" : "jpg"}`,
                            )
                        }
                        className="cursor-pointer rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg"
                        title="Download"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                </div>
            </motion.div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-3">
                {navigation && index > 0 ? (
                    <motion.button
                        className="mr-2 z-50 flex-shrink-0 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg"
                        onClick={() => changePhotoId(index - 1)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: uiVisible ? 1 : 0, scale: uiVisible ? 1 : 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ pointerEvents: uiVisible ? "auto" : "none" }}
                    >
                        <ChevronLeftIcon className="h-6 w-6" />
                    </motion.button>
                ) : (
                    navigation && <div className="mr-2 w-14 flex-shrink-0" />
                )}

                <div className="relative flex h-full min-h-0 min-w-0 flex-1 items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AnimatePresence initial={false} mode="wait" custom={effectiveDirection}>
                            {currentImage && (
                                <motion.div
                                    key={currentImage.public_id}
                                    custom={effectiveDirection}
                                    variants={mediaVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: effectiveDirection === 0 ? 0 : 0.2, ease: "easeOut" }}
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{
                                        visibility: hideActiveMedia ? "hidden" : "visible",
                                    }}
                                >
                                    {isVideo(currentImage) ? (
                                        <video
                                            ref={(element) => {
                                                videoRef.current = element;
                                                setActiveMediaElement(element);
                                            }}
                                            src={getFullUrl(currentImage)}
                                            poster={getThumbnailUrl(currentImage, 1920)}
                                            controls
                                            playsInline
                                            preload="metadata"
                                            className="h-auto max-h-full w-auto max-w-full rounded-lg object-contain"
                                        />
                                    ) : (
                                        <motion.div
                                            ref={(element) => {
                                                animatedPhotoRef.current = element;
                                                setActiveMediaElement(element);
                                            }}
                                            layoutId={useSharedLayout && effectiveDirection === 0 ? `gallery-photo-${currentImage.id}` : undefined}
                                            transition={{ type: "spring", stiffness: 260, damping: 30 }}
                                            onLayoutAnimationStart={() => {
                                                if (animatedPhotoRef.current) {
                                                    animatedPhotoRef.current.style.zIndex = "100";
                                                }
                                            }}
                                            onLayoutAnimationComplete={() => {
                                                if (animatedPhotoRef.current) {
                                                    animatedPhotoRef.current.style.zIndex = "0";
                                                }
                                            }}
                                            className="relative z-0 h-full max-w-full overflow-hidden rounded-lg"
                                            style={{
                                                aspectRatio: `${Number(currentImage.width) || 3} / ${Number(currentImage.height) || 2}`,
                                            }}
                                        >
                                            <Image
                                                src={getThumbnailUrl(currentImage, 1920)}
                                                fill
                                                priority
                                                unoptimized
                                                alt="Image"
                                                placeholder="blur"
                                                blurDataURL={currentImage.blurDataUrl}
                                                sizes="100vw"
                                                className="object-contain"
                                            />
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {navigation && index + 1 < imagesLength ? (
                    <motion.button
                        className="ml-2 z-50 flex-shrink-0 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg"
                        onClick={() => changePhotoId(index + 1)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: uiVisible ? 1 : 0, scale: uiVisible ? 1 : 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ pointerEvents: uiVisible ? "auto" : "none" }}
                    >
                        <ChevronRightIcon className="h-6 w-6" />
                    </motion.button>
                ) : (
                    navigation && <div className="ml-2 w-14 flex-shrink-0" />
                )}
            </div>

            {navigation && filteredImages && (
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: uiVisible ? 1 : 0, y: uiVisible ? 0 : 14 }}
                    transition={{ duration: 0.2, ease: "easeOut", delay: uiVisible ? 0.04 : 0 }}
                    style={{ pointerEvents: uiVisible ? "auto" : "none" }}
                    className="z-40 flex-shrink-0 overflow-hidden bg-gradient-to-b from-black/0 to-black/60"
                >
                    <div className="mx-auto mb-6 mt-6 flex w-full max-w-3xl items-center gap-2 px-2">
                        <button
                            type="button"
                            onClick={() => scrollThumbnailRail("left")}
                            className="cursor-pointer flex-shrink-0 rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg"
                            aria-label="Scroll thumbnails left"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <div
                            ref={thumbnailRailRef}
                            onWheel={(event) => {
                                if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                                    event.currentTarget.scrollBy({
                                        left: event.deltaY,
                                        behavior: "auto",
                                    });
                                }
                            }}
                            className="scrollbar-hide flex h-14 min-w-0 flex-1 gap-1 overflow-x-auto"
                        >
                            {filteredImages.map((image: ImageProps) => (
                                <button
                                    onClick={() => changePhotoId(image.id)}
                                    key={image.id}
                                    ref={image.id === index ? activeThumbnailRef : null}
                                    className={`${image.id === index ? "z-20 shadow shadow-black/50" : "z-10"} relative h-14 w-[84px] shrink-0 overflow-hidden rounded-md cursor-pointer focus:outline-none`}
                                >
                                    <Image
                                        alt="small photos on the bottom"
                                        width={180}
                                        height={120}
                                        unoptimized
                                        className={`${image.id === index ? "brightness-110" : "brightness-50 contrast-125"} h-full object-cover`}
                                        src={getThumbnailUrl(image, 180)}
                                        onLoad={() => handleThumbnailLoad(image.id)}
                                    />
                                    {isVideo(image) && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <PlayIcon className="h-4 w-4 text-white drop-shadow-lg" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => scrollThumbnailRail("right")}
                            className="cursor-pointer flex-shrink-0 rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg"
                            aria-label="Scroll thumbnails right"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
