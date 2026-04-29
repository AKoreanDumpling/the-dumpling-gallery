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

type ZoomClipInset = {
    top: number;
    right: number;
    bottom: number;
    left: number;
    radius: number;
};

let hasShownTipsThisVisit = false;

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
    const ZOOM_SCALE = 2.2;
    const ZOOM_OVERSCROLL_RATIO = 0.08;
    const ZOOM_OVERSCROLL_MAX_PX = 120;
    const [thumbnailsLoaded, setThumbnailsLoaded] = useState<Set<number>>(new Set());
    const [transitionDirection, setTransitionDirection] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomOffset, setZoomOffset] = useState({ x: 0, y: 0 });
    const [isZoomDragging, setIsZoomDragging] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const animatedPhotoRef = useRef<HTMLDivElement>(null);
    const preloadStartedRef = useRef(false);
    const hasShownInitialTipsRef = useRef(false);
    const previousIndexRef = useRef(index);
    const activeThumbnailRef = useRef<HTMLButtonElement>(null);
    const thumbnailRailRef = useRef<HTMLDivElement>(null);
    const thumbnailScrollFrameRef = useRef<number | null>(null);
    const thumbnailCenterFrameRef = useRef<number | null>(null);
    const TipsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const zoomSurfaceRef = useRef<HTMLDivElement>(null);
    const zoomDragPointerIdRef = useRef<number | null>(null);
    const zoomDragStartPointRef = useRef({ x: 0, y: 0 });
    const zoomDragStartOffsetRef = useRef({ x: 0, y: 0 });
    const suppressZoomToggleRef = useRef(false);
    const [zoomClipInset, setZoomClipInset] = useState<ZoomClipInset | null>(null);
    const [showTips, setShowTips] = useState(false);
    const [thumbnailCanScrollLeft, setThumbnailCanScrollLeft] = useState(false);
    const [thumbnailCanScrollRight, setThumbnailCanScrollRight] = useState(false);

    const filteredImages: ImageProps[] = images ?? [];

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if (isZoomed) {
                return;
            }

            if (index < (images?.length ?? 0)) {
                changePhotoId(index + 1);
            }
        },
        onSwipedRight: () => {
            if (isZoomed) {
                return;
            }

            if (index > 1) {
                changePhotoId(index - 1);
            }
        },
        trackMouse: !isZoomed,
    });

    const currentImage = images
        ? images.find((image) => image.id === index) ?? images[index - 1]
        : currentPhoto;
    const showZoomTip = showTips && !isZoomed && Boolean(currentImage) && !isVideo(currentImage);
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

    const cancelThumbnailAutoCenter = () => {
        if (thumbnailCenterFrameRef.current) {
            cancelAnimationFrame(thumbnailCenterFrameRef.current);
            thumbnailCenterFrameRef.current = null;
        }

        if (thumbnailScrollFrameRef.current) {
            cancelAnimationFrame(thumbnailScrollFrameRef.current);
            thumbnailScrollFrameRef.current = null;
        }
    };

    const scrollThumbnailRail = (direction: "left" | "right") => {
        const rail = thumbnailRailRef.current;
        if (!rail) {
            return;
        }

        cancelThumbnailAutoCenter();

        const scrollAmount = Math.max(rail.clientWidth * 0.6, 180);
        rail.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const updateThumbnailScrollControls = () => {
        const rail = thumbnailRailRef.current;

        if (!rail) {
            setThumbnailCanScrollLeft(false);
            setThumbnailCanScrollRight(false);
            return;
        }

        const maxScrollLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0);
        const threshold = 2;

        setThumbnailCanScrollLeft(rail.scrollLeft > threshold);
        setThumbnailCanScrollRight(rail.scrollLeft < maxScrollLeft - threshold);
    };

    const animateThumbnailRailToActive = () => {
        const rail = thumbnailRailRef.current;
        const activeThumbnail = activeThumbnailRef.current;

        if (!rail || !activeThumbnail) {
            return;
        }

        cancelThumbnailAutoCenter();

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
            const smallThumbnailSrc = getThumbnailUrl(image, 180);
            const mediumThumbnailSrc = getThumbnailUrl(image, 720);
            const thumbnailSrc = getThumbnailUrl(image, 1920);

            const smallThumbnailImg = new window.Image();
            smallThumbnailImg.src = smallThumbnailSrc;

            const mediumThumbnailImg = new window.Image();
            mediumThumbnailImg.src = mediumThumbnailSrc;

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
        cancelThumbnailAutoCenter();

        thumbnailCenterFrameRef.current = requestAnimationFrame(() => {
            animateThumbnailRailToActive();
        });

        return () => {
            cancelThumbnailAutoCenter();
        };
    }, [index, uiVisible]);

    useEffect(() => {
        return () => {
            if (thumbnailScrollFrameRef.current) {
                cancelAnimationFrame(thumbnailScrollFrameRef.current);
            }

            if (thumbnailCenterFrameRef.current) {
                cancelAnimationFrame(thumbnailCenterFrameRef.current);
            }

            if (TipsTimeoutRef.current) {
                clearTimeout(TipsTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const rail = thumbnailRailRef.current;
        if (!rail) {
            setThumbnailCanScrollLeft(false);
            setThumbnailCanScrollRight(false);
            return;
        }

        const updateOnFrame = () => {
            requestAnimationFrame(() => {
                updateThumbnailScrollControls();
            });
        };

        updateOnFrame();
        rail.addEventListener("scroll", updateThumbnailScrollControls, { passive: true });
        window.addEventListener("resize", updateOnFrame);

        const resizeObserver = new ResizeObserver(() => {
            updateOnFrame();
        });
        resizeObserver.observe(rail);

        return () => {
            rail.removeEventListener("scroll", updateThumbnailScrollControls);
            window.removeEventListener("resize", updateOnFrame);
            resizeObserver.disconnect();
        };
    }, [filteredImages.length, index, uiVisible]);

    useEffect(() => {
        setShowTips(false);
    }, [index]);

    useEffect(() => {
        if (!uiVisible || hasShownInitialTipsRef.current || !currentImage || isVideo(currentImage)) {
            return;
        }

        if (hasShownTipsThisVisit) {
            hasShownInitialTipsRef.current = true;
            return;
        }

        hasShownInitialTipsRef.current = true;
        hasShownTipsThisVisit = true;
        setShowTips(true);

        if (TipsTimeoutRef.current) {
            clearTimeout(TipsTimeoutRef.current);
        }

        TipsTimeoutRef.current = setTimeout(() => {
            setShowTips(false);
            TipsTimeoutRef.current = null;
        }, 3200);
    }, [uiVisible, currentImage]);

    const setActiveMediaElement = (element: HTMLElement | null) => {
        onMediaElementChange?.(element);
    };

    const getZoomClipPath = (clipInset: ZoomClipInset | null) => {
        if (!clipInset) {
            return "inset(0px 0px 0px 0px round 0px)";
        }

        return `inset(${clipInset.top}px ${clipInset.right}px ${clipInset.bottom}px ${clipInset.left}px round ${clipInset.radius}px)`;
    };

    const getZoomBounds = () => {
        if (!currentImage || typeof window === "undefined") {
            return { maxX: 0, maxY: 0 };
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const imageWidth = Number(currentImage.width) || 3;
        const imageHeight = Number(currentImage.height) || 2;
        const imageAspect = imageWidth / imageHeight;
        const viewportAspect = viewportWidth / viewportHeight;

        let fittedWidth = viewportWidth;
        let fittedHeight = viewportHeight;

        if (viewportAspect > imageAspect) {
            fittedWidth = viewportHeight * imageAspect;
            fittedHeight = viewportHeight;
        } else {
            fittedWidth = viewportWidth;
            fittedHeight = viewportWidth / imageAspect;
        }

        return {
            maxX: Math.max((fittedWidth * ZOOM_SCALE - viewportWidth) / 2, 0),
            maxY: Math.max((fittedHeight * ZOOM_SCALE - viewportHeight) / 2, 0),
            overscrollX: Math.min(viewportWidth * ZOOM_OVERSCROLL_RATIO, ZOOM_OVERSCROLL_MAX_PX),
            overscrollY: Math.min(viewportHeight * ZOOM_OVERSCROLL_RATIO, ZOOM_OVERSCROLL_MAX_PX),
        };
    };

    const clampZoomOffset = (x: number, y: number) => {
        const bounds = getZoomBounds();

        return {
            x: Math.min(Math.max(x, -(bounds.maxX + bounds.overscrollX)), bounds.maxX + bounds.overscrollX),
            y: Math.min(Math.max(y, -(bounds.maxY + bounds.overscrollY)), bounds.maxY + bounds.overscrollY),
        };
    };

    const resetZoom = () => {
        setIsZoomed(false);
        setIsZoomDragging(false);
        setZoomOffset({ x: 0, y: 0 });
        zoomDragPointerIdRef.current = null;
    };

    const handleZoomToggle = () => {
        if (suppressZoomToggleRef.current) {
            suppressZoomToggleRef.current = false;
            return;
        }

        if (!currentImage || isVideo(currentImage)) {
            return;
        }

        if (isZoomed) {
            resetZoom();
            return;
        }

        if (typeof window !== "undefined") {
            const originRect = animatedPhotoRef.current?.getBoundingClientRect();

            if (originRect) {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                setZoomClipInset({
                    top: Math.max(originRect.top, 0),
                    right: Math.max(viewportWidth - originRect.right, 0),
                    bottom: Math.max(viewportHeight - originRect.bottom, 0),
                    left: Math.max(originRect.left, 0),
                    radius: navigation ? 8 : 0,
                });
            }
        }

        setIsZoomed(true);
        setZoomOffset({ x: 0, y: 0 });
    };

    const handleZoomPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isZoomed) {
            return;
        }

        zoomDragPointerIdRef.current = event.pointerId;
        zoomDragStartPointRef.current = { x: event.clientX, y: event.clientY };
        zoomDragStartOffsetRef.current = zoomOffset;
        setIsZoomDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleZoomPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isZoomed) {
            return;
        }

        if (!isZoomDragging || zoomDragPointerIdRef.current !== event.pointerId) {
            return;
        }

        const deltaX = event.clientX - zoomDragStartPointRef.current.x;
        const deltaY = event.clientY - zoomDragStartPointRef.current.y;

        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            suppressZoomToggleRef.current = true;
        }

        const clampedOffset = clampZoomOffset(
            zoomDragStartOffsetRef.current.x + deltaX,
            zoomDragStartOffsetRef.current.y + deltaY,
        );

        setZoomOffset(clampedOffset);
    };

    const handleZoomPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (zoomDragPointerIdRef.current !== event.pointerId) {
            return;
        }

        zoomDragPointerIdRef.current = null;
        setIsZoomDragging(false);

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const handleZoomSurfaceClick = () => {
        if (typeof window === "undefined") {
            return;
        }

        if (suppressZoomToggleRef.current) {
            suppressZoomToggleRef.current = false;
            return;
        }

        const isDesktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        if (!isDesktopPointer) {
            return;
        }

        resetZoom();
    };

    useEffect(() => {
        resetZoom();
    }, [index]);

    useEffect(() => {
        if (!isZoomed) {
            return;
        }

        const handleResize = () => {
            setZoomOffset((prev) => {
                const clampedOffset = clampZoomOffset(prev.x, prev.y);
                return clampedOffset;
            });
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [isZoomed, currentImage]);

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
                            className={`cursor-pointer rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg ${showTips ? "ring-2 ring-purple-300/90 ring-offset-2 ring-offset-black/80 animate-pulse" : ""}`}
                            title="Open"
                            target="_blank"
                            rel="_noreferrer"
                        >
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                        </a>
                    )}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowTips(false);
                                downloadPhoto(
                                    getFullUrl(currentImage),
                                    `${index}.${isVideo(currentImage) ? currentImage?.format || "mp4" : "jpg"}`,
                                );
                            }}
                            className={`cursor-pointer rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition-all ${showTips ? "ring-2 ring-green-300/90 ring-offset-2 ring-offset-black/80 animate-pulse" : ""}`}
                            title="Download"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                        <AnimatePresence>
                            {showTips && navigation && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                    transition={{ duration: 0.18, ease: "easeOut" }}
                                    className="pointer-events-none absolute right-22 top-1 z-50 mt-0 w-52 rounded-md border border-purple-300/40 bg-black/85 px-3 py-2 text-xs font-medium text-purple-100 shadow-lg"
                                >
                                    Open the image in full resolution
                                </motion.div>
                            )},
                            {showTips && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                    transition={{ duration: 0.18, ease: "easeOut" }}
                                    className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-52 rounded-md border border-green-300/40 bg-black/85 px-3 py-2 text-xs font-medium text-green-100 shadow-lg"
                                >
                                    Download in full resolution
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <div
                className={`relative flex min-h-0 flex-1 items-center justify-center ${navigation
                    ? "px-3"
                    : "px-[clamp(12px,4vw,64px)] py-[clamp(12px,3vh,48px)]"
                    }`}
            >
                {navigation && index > 1 ? (
                    <motion.button
                        className="mr-2 z-50 flex-shrink-0 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg"
                        onClick={() => changePhotoId(index - 1)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: uiVisible ? 1 : 0, scale: uiVisible ? 1 : 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ pointerEvents: uiVisible ? "auto" : "none" }}
                    >
                        <ChevronLeftIcon className="cursor-pointer h-6 w-6" />
                    </motion.button>
                ) : (
                    navigation && <div className="mr-2 w-14 flex-shrink-0" />
                )}

                <div className="relative flex h-full min-h-0 min-w-0 flex-1 items-center justify-center">
                    <AnimatePresence>
                        {showZoomTip && (
                            <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                                className="pointer-events-none absolute top-3 z-[60] rounded-md border border-cyan-300/40 bg-black/85 px-3 py-2 text-xs font-medium text-cyan-100 shadow-lg"
                            >
                                Click photo to zoom in
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <AnimatePresence initial={false} mode="wait" custom={effectiveDirection}>
                            {currentImage && (
                                <motion.div
                                    key={`${currentImage.public_id || "image"}-${currentImage.id}`}
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
                                            className={`h-auto max-h-full w-auto max-w-full object-contain ${navigation ? "rounded-lg" : "rounded-none"
                                                }`}
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
                                            className={`relative z-0 h-full max-w-full overflow-hidden ${navigation ? "rounded-lg" : "rounded-none"
                                                } ${showZoomTip ? "ring-2 ring-cyan-300/90 ring-offset-2 ring-offset-black/80 animate-pulse" : ""}`}
                                            style={{
                                                aspectRatio: `${Number(currentImage.width) || 3} / ${Number(currentImage.height) || 2}`,
                                            }}
                                        >
                                            <Image
                                                src={navigation ? getThumbnailUrl(currentImage, 1920) : getFullUrl(currentImage)}
                                                fill
                                                priority
                                                unoptimized
                                                alt="Image"
                                                placeholder="blur"
                                                blurDataURL={currentImage.blurDataUrl}
                                                sizes="100vw"
                                                onClick={handleZoomToggle}
                                                className="object-contain cursor-zoom-in pointer-events-auto"
                                            />
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {navigation && index < imagesLength ? (
                    <motion.button
                        className="ml-2 z-50 flex-shrink-0 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg"
                        onClick={() => changePhotoId(index + 1)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: uiVisible ? 1 : 0, scale: uiVisible ? 1 : 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ pointerEvents: uiVisible ? "auto" : "none" }}
                    >
                        <ChevronRightIcon className="cursor-pointer h-6 w-6" />
                    </motion.button>
                ) : (
                    navigation && <div className="ml-2 w-14 flex-shrink-0" />
                )}
            </div>

            {navigation && filteredImages.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: uiVisible ? 1 : 0, y: uiVisible ? 0 : 14 }}
                    transition={{ duration: 0.2, ease: "easeOut", delay: uiVisible ? 0.04 : 0 }}
                    style={{ pointerEvents: uiVisible ? "auto" : "none" }}
                    className="z-40 flex-shrink-0 overflow-hidden bg-gradient-to-b from-black/0 to-black/60"
                >
                    <div className="mx-auto mb-6 mt-6 flex w-full max-w-3xl items-center gap-2 px-2">
                        {thumbnailCanScrollLeft ? (
                            <button
                                type="button"
                                onClick={() => scrollThumbnailRail("left")}
                                className="cursor-pointer flex-shrink-0 rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg"
                                aria-label="Scroll thumbnails left"
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                        ) : (
                            <div className="h-9 w-9 flex-shrink-0" aria-hidden="true" />
                        )}
                        <div
                            ref={thumbnailRailRef}
                            onWheel={(event) => {
                                if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                                    cancelThumbnailAutoCenter();
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
                                    className={`${image.id === index ? "z-20 shadow shadow-black/50" : "z-10"} relative h-14 w-[84px] shrink-0 overflow-hidden rounded-md cursor-pointer focus:outline-none ${showZoomTip && image.id === index ? "ring-2 ring-cyan-300/90 ring-offset-2 ring-offset-black/80 animate-pulse" : ""}`}
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
                        {thumbnailCanScrollRight ? (
                            <button
                                type="button"
                                onClick={() => scrollThumbnailRail("right")}
                                className="cursor-pointer flex-shrink-0 rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg"
                                aria-label="Scroll thumbnails right"
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                        ) : (
                            <div className="h-9 w-9 flex-shrink-0" aria-hidden="true" />
                        )}
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {isZoomed && currentImage && !isVideo(currentImage) && (
                    <motion.div
                        ref={zoomSurfaceRef}
                        className={`fixed inset-0 z-[120] bg-black/95 touch-none ${isZoomDragging ? "cursor-move" : "cursor-zoom-out"}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        onClick={handleZoomSurfaceClick}
                        onPointerDown={handleZoomPointerDown}
                        onPointerMove={handleZoomPointerMove}
                        onPointerUp={handleZoomPointerUp}
                        onPointerCancel={handleZoomPointerUp}
                    >
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                resetZoom();
                            }}
                            onPointerDown={(event) => {
                                event.stopPropagation();
                            }}
                            onPointerUp={(event) => {
                                event.stopPropagation();
                            }}
                            className="absolute left-3 top-3 z-[130] cursor-pointer rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg"
                            aria-label="Close zoomed image"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>

                        <motion.div
                            className="absolute inset-0"
                            initial={{
                                clipPath: getZoomClipPath(zoomClipInset),
                            }}
                            animate={{
                                clipPath: "inset(0px 0px 0px 0px round 0px)",
                            }}
                            exit={{
                                clipPath: getZoomClipPath(zoomClipInset),
                            }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Image
                                src={getFullUrl(currentImage)}
                                fill
                                priority
                                unoptimized
                                alt="Zoomed image"
                                placeholder="blur"
                                blurDataURL={currentImage.blurDataUrl}
                                sizes="100vw"
                                draggable={false}
                                className="pointer-events-none select-none object-contain"
                                style={{
                                    transform: `translate3d(${zoomOffset.x}px, ${zoomOffset.y}px, 0) scale(${ZOOM_SCALE})`,
                                    transformOrigin: "center center",
                                    transition: isZoomDragging ? "none" : "transform 120ms ease-out",
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
