import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import GalleryHero from "../../components/GalleryHero";
import GalleryModal from "../../components/GalleryModal";
import PrivateBanner from "../../components/PrivateBanner";
import type { ImageProps } from "../../utils/types";
import { isVideo, getThumbnailUrl } from "../../utils/mediaHelpers";
import { usePrivateLastViewedPhoto } from "../../utils/usePrivateLastViewedPhoto";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "../../components/Footer";
import { isAuthenticated } from "../api/auth";
import { PlayIcon } from "@heroicons/react/24/solid";
import getPrivateResults from "../../utils/cachedPrivateImages";
import { addBlurDataUrls, mapResourcesToImages } from "../../utils/prepareGalleryImages";
import { preloadGalleryAssets } from "../../utils/preloadGalleryAssets";
import { LayoutGroup, motion } from "framer-motion";
import { addSignedImageUrls } from "../../utils/imagekit";

const PrivateHome: NextPage = ({ images }: { images: ImageProps[] }) => {
	const router = useRouter();
	const { photoId } = router.query;
	const [lastViewedPhoto, setLastViewedPhoto] = usePrivateLastViewedPhoto();

	const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);
	const photoMotionRefs = useRef<Record<number, HTMLDivElement | null>>({});
	const previousPhotoIdRef = useRef<string | null>(null);
	const skipReturnScrollRef = useRef(false);
	const [isLoadingAssets, setIsLoadingAssets] = useState(true);
	const [isModalReady, setIsModalReady] = useState(false);

	const normalizedPhotoId = typeof photoId === "string" ? photoId : null;

	useEffect(() => {
		let isCancelled = false;

		setIsLoadingAssets(true);
		preloadGalleryAssets(images).finally(() => {
			if (!isCancelled) {
				setIsLoadingAssets(false);
			}
		});

		return () => {
			isCancelled = true;
		};
	}, [images]);

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
			if (!skipReturnScrollRef.current) {
				lastViewedPhotoRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
			} else {
				skipReturnScrollRef.current = false;
			}
			setLastViewedPhoto(null);
		}
	}, [photoId, lastViewedPhoto, setLastViewedPhoto]);

	useEffect(() => {
		const previousPhotoId = previousPhotoIdRef.current;
		const isOpeningModal = !previousPhotoId && !!normalizedPhotoId;

		if (!normalizedPhotoId) {
			setIsModalReady(false);
		} else if (isOpeningModal) {
			setIsModalReady(false);
			requestAnimationFrame(() => {
				setIsModalReady(true);
			});
		} else {
			setIsModalReady(true);
		}

		previousPhotoIdRef.current = normalizedPhotoId;
	}, [normalizedPhotoId]);

	if (isLoadingAssets) {
		return (
			<>
				<Head>
					<title>The Dumpling Gallery (Private)</title>
				</Head>
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
					<div className="flex max-w-md flex-col bg-white/10 rounded-xl items-center gap-3 px-6 py-5 text-center text-white">
						<div className="h-12 w-12 rounded-full border-4 m-5 border-white/20 border-t-white animate-spin" />
						<p className="text-sm leading-relaxed text-white/90">
							Preparing The Dumpling Gallery! This will take longer the first time you load.
						</p>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Head>
				<title>The Dumpling Gallery (Private)</title>
			</Head>
			<PrivateBanner />

			<main className="mx-auto max-w-[1960px] p-4 pt-14">
				<LayoutGroup id="private-gallery">
					<GalleryHero
						title={
							<>
								The Dumpling Gallery:<br />Interact Bubble Tea Sale
							</>
						}
						dateText="Febuary 12, 2026"
						onLogout={handleLogout}
						className="mb-4"
					/>

					{normalizedPhotoId && isModalReady && (
						<GalleryModal
							images={images}
							basePath="/private"
							onClose={() => {
								skipReturnScrollRef.current = true;
								setLastViewedPhoto(Number(normalizedPhotoId));
							}}
						/>
					)}

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
						{images.map((image) => (
							<div
								key={image.id}
							>
								<Link
									href={`/private?photoId=${image.id}`}
									as={`/private/p/${image.id}`}
									ref={image.id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
									shallow
									scroll={false}
									data-photo-id={image.id}
									className="after:content relative block w-full cursor-hand after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
								>
									<motion.div
										ref={(element) => {
											photoMotionRefs.current[image.id] = element;
										}}
										layoutId={`gallery-photo-${image.id}`}
										onLayoutAnimationStart={() => {
											const element = photoMotionRefs.current[image.id];
											if (element) {
												element.style.zIndex = "90";
											}
										}}
										onLayoutAnimationComplete={() => {
											const element = photoMotionRefs.current[image.id];
											if (element) {
												element.style.zIndex = "0";
											}
										}}
										className="relative z-0 w-full overflow-hidden rounded-lg"
										style={{
											aspectRatio: `${Number(image.width) || 3} / ${Number(image.height) || 2}`,
										}}
									>
										<Image
											alt={isVideo(image) ? "Video thumbnail" : "Private Photo"}
											className="h-full w-full rounded-lg object-cover brightness-90"
											placeholder="blur"
											blurDataURL={image.blurDataUrl}
											src={getThumbnailUrl(image, 720)}
											unoptimized={Boolean(image.signedUrl || image.signedThumbnailUrls || image.signedPosterUrl)}
											width={Number(image.width) || 720}
											height={Number(image.height) || 480}
											sizes="(max-width: 640px) 100vw,
					  (max-width: 1280px) 50vw,
					  (max-width: 1536px) 33vw,
					  25vw"
										/>
									</motion.div>
									{isVideo(image) && (
										<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
											<div className="rounded-full bg-black/60 p-3 backdrop-blur-sm">
												<PlayIcon className="h-8 w-8 text-white" />
											</div>
										</div>
									)}
								</Link>
							</div>
						))}
					</div>

				</LayoutGroup>
				<Analytics />
				<SpeedInsights />
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

	const results = await getPrivateResults();
	const reducedResults = mapResourcesToImages(results.resources);
	const signedResults = addSignedImageUrls(reducedResults);
	const imagesWithBlurDataUrls = await addBlurDataUrls(signedResults);

	return {
		props: {
			images: imagesWithBlurDataUrls,
		},
	};
};