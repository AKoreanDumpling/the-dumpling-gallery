import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import GalleryHero from "../../components/GalleryHero";
import GalleryModal from "../../components/GalleryModal";
import PrivateBanner from "../../components/PrivateBanner";
import Changelog from "../../components/Changelog";
import type { ImageProps } from "../../utils/types";
import { isVideo, getThumbnailUrl } from "../../utils/mediaHelpers";
import { usePrivateLastViewedPhoto } from "../../utils/usePrivateLastViewedPhoto";
import { useChangelog } from "../../utils/useChangelog";
import { AnimatePresence, motion } from "framer-motion";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "../../components/Footer";
import { isAuthenticated } from "../api/auth";
import { PlayIcon } from "@heroicons/react/24/solid";
import Admonition from '@yozora/react-admonition';
import { imageCardVariants } from "../../utils/galleryPageAnimations";
import getPrivateResults from "../../utils/cachedPrivateImages";
import { addBlurDataUrls, mapResourcesToImages } from "../../utils/prepareGalleryImages";

const PrivateHome: NextPage = ({ images }: { images: ImageProps[] }) => {
	const router = useRouter();
	const { photoId } = router.query;
	const [lastViewedPhoto, setLastViewedPhoto] = usePrivateLastViewedPhoto();
	const {
		isOpen: isChangelogOpen,
		openChangelog,
		closeChangelog,
		hasUnseenVersion,
	} = useChangelog();

	const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);

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

			<Changelog
				isOpen={isChangelogOpen}
				onClose={closeChangelog}
				shouldCelebrate={hasUnseenVersion}
			/>

			{/* Loading Overlay */}


			<main className="mx-auto max-w-[1960px] p-4 pt-14">
				<AnimatePresence mode="wait">
					{photoId && (
						<GalleryModal
							images={images}
							basePath="/private"
							onClose={() => {
								setLastViewedPhoto(Number(photoId));
							}}
						/>
					)}
				</AnimatePresence>

				<div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
					<GalleryHero
						title={
							<>
								The Dumpling Gallery:<br />Interact Bubble Tea Sale
							</>
						}
						dateText="Febuary 12, 2026"
						showGithub={true}
						showChangelog={true}
						onOpenChangelog={openChangelog}
						onLogout={handleLogout}
					/>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.5 }}
					>
						<Admonition
							keyword="info"
							title={<span className="uppercase"><strong>Please Note</strong></span>}
						>
							Photos will typically stay up for 1 week before being removed to manage storage.
						</Admonition>
					</motion.div>


					{images.map((image, index) => (
						<motion.div
							key={image.id}
							initial="hidden"
							animate="visible"
							whileHover="hover"
							variants={imageCardVariants}
							transition={{ delay: Math.min(index * 0.05, 0.5) }}
							className="mb-5"
						>
							<Link
								href={`/private?photoId=${image.id}`}
								as={`/private/p/${image.id}`}
								ref={image.id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
								shallow
								className="after:content group relative block w-full cursor-hand after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
							>
								<Image
									alt={isVideo(image) ? "Video thumbnail" : "Private Photo"}
									className="transform rounded-lg brightness-90 transition-all duration-300 will-change-auto group-hover:brightness-110 group-hover:shadow-xl"
									style={{ transform: "translate3d(0, 0, 0)" }}
									placeholder="blur"
									blurDataURL={image.blurDataUrl}
									src={getThumbnailUrl(image, 720)}
									width={720}
									height={480}
									sizes="(max-width: 640px) 100vw,
					  (max-width: 1280px) 50vw,
					  (max-width: 1536px) 33vw,
					  25vw"
								/>
								{isVideo(image) && (
									<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
										<div className="rounded-full bg-black/60 p-3 backdrop-blur-sm">
											<PlayIcon className="h-8 w-8 text-white" />
										</div>
									</div>
								)}
							</Link>
						</motion.div>
					))}
				</div>
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
	const imagesWithBlurDataUrls = await addBlurDataUrls(reducedResults);

	return {
		props: {
			images: imagesWithBlurDataUrls,
		},
	};
};