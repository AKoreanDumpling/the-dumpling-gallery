import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Bridge from "../../components/Icons/Bridge";
import PrivateModal from "../../components/PrivateModal";
import PrivateBanner from "../../components/PrivateBanner";
import ImageSkeleton from "../../components/ImageSkeleton";
import cloudinary from "../../utils/cloudinary";
import getBase64ImageUrl from "../../utils/generateBlurPlaceholder";
import type { ImageProps } from "../../utils/types";
import { usePrivateLastViewedPhoto } from "../../utils/usePrivateLastViewedPhoto";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "../_footer";
import { isAuthenticated } from "../api/auth";

// Animation variants
const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2
		}
	}
};

const buttonVariants = {
	initial: { scale: 1 },
	hover: {
		scale: 1.05,
		transition: { type: "spring", stiffness: 400, damping: 10 }
	},
	tap: { scale: 0.95 }
};

const imageCardVariants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" }
	},
	hover: {
		y: -8,
		transition: { type: "spring", stiffness: 300, damping: 20 }
	}
};

const PrivateHome: NextPage = ({ images }: { images: ImageProps[] }) => {
	const router = useRouter();
	const { photoId } = router.query;
	const [lastViewedPhoto, setLastViewedPhoto] = usePrivateLastViewedPhoto();
	const [loadedCount, setLoadedCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);

	const handleImageLoad = () => {
		setLoadedCount((prev) => prev + 1);
	};

	const allImagesLoaded = images.length === 0 || loadedCount >= images.length;

	useEffect(() => {
		// Hide skeleton after a short delay or when enough images load
		if (loadedCount >= Math.min(4, images.length) || images.length === 0) {
			setIsLoading(false);
		}
		const timer = setTimeout(() => setIsLoading(false), 1000);
		return () => clearTimeout(timer);
	}, [loadedCount, images.length]);

	const handleLogout = async () => {
		try {
			await fetch("/api/logout", { method: "POST" });
			router.push("/");
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	useEffect(() => {
		if (lastViewedPhoto && !photoId) {
			lastViewedPhotoRef.current?.scrollIntoView({ block: "center" });
			setLastViewedPhoto(null);
		}
	}, [photoId, lastViewedPhoto, setLastViewedPhoto]);

	return (
		<>
			<Head>
				<title>The Dumpling Gallery (Private)</title>
			</Head>
			<PrivateBanner />

			{/* Loading Overlay */}


			<main className="mx-auto max-w-[1960px] p-4 pt-14">
				<AnimatePresence mode="wait">
					{photoId && (
						<PrivateModal
							images={images}
							onClose={() => {
								setLastViewedPhoto(Number(photoId));
							}}
						/>
					)}
				</AnimatePresence>

				<div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
					<motion.div
						className="after:content relative mb-5 flex max-w-full h-[629px] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-gradient-to-br from-purple-900/50 to-pink-900/50 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0 border border-purple-500/30"
						initial="hidden"
						animate="visible"
						variants={staggerContainer}
					>
						<motion.div
							className="absolute inset-0 flex items-center justify-center opacity-20"
							initial={{ opacity: 0, scale: 1.1 }}
							animate={{ opacity: 0.2, scale: 1 }}
							transition={{ duration: 1.2, ease: "easeOut" }}
						>
							<span className="flex max-h-full max-w-full items-center justify-center">
								<Bridge />
							</span>
							<span className="absolute left-0 right-0 bottom-0 h-[300px] bg-gradient-to-b from-black/0 via-black to-black"></span>
						</motion.div>

						<motion.h1
							className="mt-8 mb-2 text-base font-bold uppercase tracking-widest"
							variants={fadeInUp}
						>
							The Dumpling Gallery:<br />[TITLE PLACEHOLDER]
						</motion.h1>

						<motion.p
							className="max-w-[40ch] text-white/75 sm:max-w-[32ch]"
							variants={fadeInUp}
						>
							View and download full resolution photos! Images are typically removed after 72 hours - save the ones you like!
						</motion.p>

						<motion.a
							className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition-colors md:mt-4 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
							href="#credits"
							rel="noreferrer"
							variants={fadeInUp}
							whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255,255,255,0.4)" }}
							whileTap={{ scale: 0.95 }}
						>
							Go to Photo Credits
						</motion.a>

						<motion.button
							onClick={handleLogout}
							className="pointer z-10 mt-0 rounded-lg border border-red-400 bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
							variants={fadeInUp}
							whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(239,68,68,0.5)" }}
							whileTap={{ scale: 0.95 }}
						>
							Log Out
						</motion.button>

					</motion.div>

					{/* Loading skeleton */}
					{isLoading && <ImageSkeleton count={8} variant="gallery" />}

					{images.map(({ id, public_id, format, blurDataUrl }, index) => (
						<motion.div
							key={id}
							initial="hidden"
							animate="visible"
							whileHover="hover"
							variants={imageCardVariants}
							transition={{ delay: Math.min(index * 0.05, 0.5) }}
							className="mb-5"
						>
							<Link
								href={`/private?photoId=${id}`}
								as={`/private/p/${id}`}
								ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
								shallow
								className="after:content group relative block w-full cursor-hand after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
							>
								<Image
									alt="Private Photo"
									className="transform rounded-lg brightness-90 transition-all duration-300 will-change-auto group-hover:brightness-110 group-hover:shadow-xl"
									style={{ transform: "translate3d(0, 0, 0)" }}
									placeholder="blur"
									blurDataURL={blurDataUrl}
									src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`}
									width={720}
									height={480}
									loading="eager"
									sizes="(max-width: 640px) 100vw,
					  (max-width: 1280px) 50vw,
					  (max-width: 1536px) 33vw,
					  25vw"
									onLoad={handleImageLoad}
								/>
							</Link>
						</motion.div>
					))}
				</div>
			</main>

			<Footer />
		</>
	);
};

export default PrivateHome;

export const getServerSideProps: GetServerSideProps = async (context) => {
	const authCookie = context.req.cookies.private_auth;

	if (!isAuthenticated(authCookie)) {
		return {
			redirect: {
				destination: "/login?redirect=/private",
				permanent: false,
			},
		};
	}

	const results = await cloudinary.v2.search
		.expression(`folder:${process.env.PRIVATE_CLOUDINARY_FOLDER}/*`)
		.sort_by("public_id", "desc")
		.max_results(400)
		.execute();

	let reducedResults: ImageProps[] = [];

	let i = 0;
	for (let result of results.resources) {
		reducedResults.push({
			id: i,
			height: result.height,
			width: result.width,
			public_id: result.public_id,
			format: result.format,
		});
		i++;
	}

	const blurImagePromises = results.resources.map((image: ImageProps) => {
		return getBase64ImageUrl(image);
	});
	const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

	for (let i = 0; i < reducedResults.length; i++) {
		reducedResults[i].blurDataUrl = imagesWithBlurDataUrls[i];
	}

	return {
		props: {
			images: reducedResults,
		},
	};
};