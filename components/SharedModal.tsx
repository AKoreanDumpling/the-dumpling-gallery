import {
	ArrowDownTrayIcon,
	ArrowTopRightOnSquareIcon,
	ArrowUturnLeftIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { variants } from "../utils/animationVariants";
import downloadPhoto from "../utils/downloadPhoto";
import { range } from "../utils/range";
import type { ImageProps, SharedModalProps } from "../utils/types";

export default function SharedModal({
	index,
	images,
	changePhotoId,
	closeModal,
	navigation,
	currentPhoto,
	direction,
}: SharedModalProps) {
	const [loaded, setLoaded] = useState(false);
	const [thumbnailsLoaded, setThumbnailsLoaded] = useState<Set<number>>(new Set());
	const [isClosing, setIsClosing] = useState(false);

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

	const handleThumbnailLoad = (id: number) => {
		setThumbnailsLoaded((prev) => new Set(prev).add(id));
	};

	const allThumbnailsLoaded = !navigation ||
		(filteredImages && filteredImages.every((img) => thumbnailsLoaded.has(img.id)));

	const isFullyLoaded = loaded && allThumbnailsLoaded;

	const imagesLength = images?.length ?? 0;

	const handleClose = () => {
		setIsClosing(true);
		closeModal();
	};

	return (
		<MotionConfig
			transition={
				isClosing
					? { duration: 0 }
					: {
						x: { type: "spring", stiffness: 300, damping: 30 },
						opacity: { duration: 0.2 },
					}
			}
		>

			{/* Full screen container */}
			<div className="fixed inset-0 z-50 flex flex-col pointer-events-auto" {...handlers}>
				{/* Top bar with buttons */}
				<div className="flex-shrink-0 flex items-center justify-between p-3 z-50">
					<button
						onClick={handleClose}
						className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
					>
						{navigation ? (
							<XMarkIcon className="h-5 w-5" />
						) : (
							<ArrowUturnLeftIcon className="h-5 w-5" />
						)}
					</button>
					<div className="flex items-center gap-2">
						<a
							href={`/p/${index}`}
							className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
							title="Open fullsize version"
							rel="noreferrer"
						>
							<ArrowTopRightOnSquareIcon className="h-5 w-5" />
						</a>
						<button
							onClick={() =>
								downloadPhoto(
									`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${currentImage?.public_id}.${currentImage?.format}`,
									`${index}.jpg`,
								)
							}
							className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
							title="Download"
						>
							<ArrowDownTrayIcon className="h-5 w-5" />
						</button>
					</div>
				</div>

				{/* Main content area with image and side buttons */}
				<div className="flex-1 flex items-center justify-center relative min-h-0 px-3">
					{/* Left navigation button */}
					{navigation && index > 0 && (
						<button
							className="flex-shrink-0 z-50 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none mr-2"
							onClick={() => changePhotoId(index - 1)}
						>
							<ChevronLeftIcon className="h-6 w-6" />
						</button>
					)}
					{/* Spacer when no left button */}
					{navigation && index === 0 && <div className="flex-shrink-0 w-14 mr-2" />}

					{/* Image container */}
					<div className="flex-1 relative flex items-center justify-center min-w-0 min-h-0 h-full">
						<AnimatePresence initial={false} custom={direction}>
							<motion.div
								key={index}
								custom={direction}
								variants={variants}
								initial="enter"
								animate="center"
								exit="exit"
								className="absolute inset-0 flex items-center justify-center"
							>
								{currentImage && (
									<Image
										src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
											}/image/upload/c_scale,w_1920/${currentImage.public_id
											}.${currentImage.format}`}
										width={Number(currentImage.width) || 1920}
										height={Number(currentImage.height) || 1280}
										priority
										alt="Image"
										onLoad={() => setLoaded(true)}
										className="max-w-full max-h-full w-auto h-auto object-contain"
									/>
								)}
							</motion.div>
						</AnimatePresence>
					</div>

					{/* Right navigation button */}
					{navigation && index + 1 < imagesLength && (
						<button
							className="flex-shrink-0 z-50 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none ml-2"
							onClick={() => changePhotoId(index + 1)}
						>
							<ChevronRightIcon className="h-6 w-6" />
						</button>
					)}
					{/* Spacer when no right button */}
					{navigation && index + 1 >= imagesLength && <div className="flex-shrink-0 w-14 ml-2" />}
				</div>

				{/* Bottom Nav bar */}
				{navigation && filteredImages && (
					<div className="flex-shrink-0 z-40 overflow-hidden bg-gradient-to-b from-black/0 to-black/60">
						<motion.div
							initial={false}
							className="mx-auto mt-6 mb-6 flex aspect-[3/2] h-14"
						>
							<AnimatePresence initial={false}>
								{filteredImages.map((image: ImageProps) => (
									<motion.button
										initial={{
											width: "0%",
											x: `${Math.max((index - 1) * -100, 15 * -100)}%`,
										}}
										animate={{
											scale: image.id === index ? 1.25 : 1,
											width: "100%",
											x: `${Math.max(index * -100, 15 * -100)}%`,
										}}
										exit={{ width: "0%" }}
										onClick={() => changePhotoId(image.id)}
										key={image.id}
										className={`${image.id === index
											? "z-20 rounded-md shadow shadow-black/50"
											: "z-10"
											} ${image.id === 0 ? "rounded-l-md" : ""} ${image.id === imagesLength - 1 ? "rounded-r-md" : ""
											} relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}
									>
										<Image
											alt="small photos on the bottom"
											width={180}
											height={120}
											className={`${image.id === index
												? "brightness-110 hover:brightness-110"
												: "brightness-50 contrast-125 hover:brightness-75"
												} h-full transform object-cover transition`}
											src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_180/${image.public_id}.${image.format}`}
											onLoad={() => handleThumbnailLoad(image.id)}
										/>
									</motion.button>
								))}
							</AnimatePresence>
						</motion.div>
					</div>
				)}
			</div>
		</MotionConfig>
	);
}
