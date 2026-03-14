import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import GalleryHero from "../components/GalleryHero";
import GalleryModal from "../components/GalleryModal";
import cloudinary from "../utils/cloudinary";
import type { ImageProps } from "../utils/types";
import { isVideo, getThumbnailUrl } from "../utils/mediaHelpers";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Footer from "../components/Footer";
import Admonition from '@yozora/react-admonition';
import { PlayIcon } from "@heroicons/react/24/solid";
import { addBlurDataUrls, mapResourcesToImages } from "../utils/prepareGalleryImages";
import { LayoutGroup, motion } from "framer-motion";
import { preloadGalleryAssets } from "../utils/preloadGalleryAssets";

const Home: NextPage = ({ images }: { images: ImageProps[] }) => {
	const router = useRouter();
	const { photoId } = router.query;
	const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();

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

	useEffect(() => {
		// This effect keeps track of the last viewed photo in the modal to keep the index page in sync when the user navigates back
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
			const target = document.querySelector<HTMLElement>(`[data-photo-id="${normalizedPhotoId}"]`);
			target?.scrollIntoView({ block: "center", behavior: "auto" });
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
					<title>The Dumpling Gallery</title>
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
				<title>The Dumpling Gallery</title>
			</Head>

			<main className="mx-auto max-w-[1960px] p-4">
				<LayoutGroup id="public-gallery">

					{normalizedPhotoId && isModalReady && (
						<GalleryModal
							images={images}
							onClose={() => {
								skipReturnScrollRef.current = true;
								setLastViewedPhoto(Number(normalizedPhotoId));
							}}
						/>
					)}

					<div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
						<GalleryHero
							title={
								<>
									The Dumpling Gallery:<br />Pink Shirt Day
								</>
							}
							dateText="February 25, 2026"
							showGithub={true}
							showPrivateAccess={true}
						/>

						<div>
							<Admonition
								keyword="info"
								title={<span className="uppercase"><strong>Please Note</strong></span>}
							>
								Photos will typically stay up for 1 week before being removed to manage storage.
							</Admonition>
						</div>

						{images.map((image) => (
							<div
								key={image.id}
								className="mb-5"
							>
								<Link
									href={`/?photoId=${image.id}`}
									as={`/p/${image.id}`}
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
											alt={isVideo(image) ? "Video thumbnail" : "Photo"}
											className="h-full w-full rounded-lg object-cover brightness-90"
											placeholder="blur"
											blurDataURL={image.blurDataUrl}
											src={getThumbnailUrl(image, 720)}
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
			</main >

			<Footer />

		</>
	);
};

export default Home;

export async function getStaticProps() {
	const results = await cloudinary.v2.search
		.expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
		.sort_by("public_id", "desc")
		.max_results(400)
		.execute();
	const reducedResults = mapResourcesToImages(results.resources);
	const imagesWithBlurDataUrls = await addBlurDataUrls(reducedResults);

	return {
		props: {
			images: imagesWithBlurDataUrls,
		},
	};
}
