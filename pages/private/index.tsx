import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Bridge from "../../components/Icons/Bridge";
import PrivateModal from "../../components/PrivateModal";
import cloudinary from "../../utils/cloudinary";
import getBase64ImageUrl from "../../utils/generateBlurPlaceholder";
import type { ImageProps } from "../../utils/types";
import { usePrivateLastViewedPhoto } from "../../utils/usePrivateLastViewedPhoto";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "../_footer";

const PrivateHome: NextPage = ({ images }: { images: ImageProps[] }) => {
	const router = useRouter();
	const { photoId } = router.query;
	const [lastViewedPhoto, setLastViewedPhoto] = usePrivateLastViewedPhoto();
	const [loadedCount, setLoadedCount] = useState(0);

	const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);

	const handleImageLoad = () => {
		setLoadedCount((prev) => prev + 1);
	};

	const allImagesLoaded = images.length === 0 || loadedCount >= images.length;

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


			{/* Loading Overlay */}
			<AnimatePresence>
				{!allImagesLoaded && (
					<motion.div
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
					>
						<div className="flex flex-col items-center gap-4">
							<div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
							<p className="text-white/75 text-sm">
								Preparing The Dumpling Gallery (Private)... ({loadedCount}/{images.length})<br />(this may take a while the first time you visit!)
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<main className="mx-auto max-w-[1960px] p-4">
				<AnimatePresence mode="wait">
					{photoId && (
						<PrivateModal
							images={images}
							onClose={() => {
								setLastViewedPhoto(photoId);
							}}
						/>
					)}
				</AnimatePresence>

				<div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
					<div className="after:content relative mb-5 flex max-w-full h-[629px] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-gradient-to-br from-purple-900/50 to-pink-900/50 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0 border border-purple-500/30">
						<div className="absolute inset-0 flex items-center justify-center opacity-20">
							<span className="flex max-h-full max-w-full items-center justify-center">
								<Bridge />
							</span>
							<span className="absolute left-0 right-0 bottom-0 h-[300px] bg-gradient-to-b from-black/0 via-black to-black"></span>
						</div>
						<div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold">
							<span>🔒</span> Logged In
						</div>

						<h1 className="mt-8 mb-2 text-base font-bold uppercase tracking-widest">
							The Dumpling Gallery (Private):<br />True Love
						</h1>

						<p className="max-w-[40ch] text-white/75 sm:max-w-[32ch]">
							View and download full resolution photos! Images are typically removed after 72 hours - save the ones you like!
						</p>
						<a
							className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
							href="#credits"
							rel="noreferrer"
						>
							Go to Photo Credits
						</a>
						<button
							onClick={handleLogout}
							className="pointer z-10 mt-0 rounded-lg border border-red-400 bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
						>
							Log Out
						</button>

					</div>

					{images.map(({ id, public_id, format, blurDataUrl }) => (
						<Link
							key={id}
							href={`/private?photoId=${id}`}
							as={`/private/p/${id}`}
							ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
							shallow
							className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
						>
							<Image
								alt="Private Photo"
								className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
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
								onLoadingComplete={handleImageLoad}
							/>
						</Link>
					))}
				</div>
			</main>

			<Footer />
		</>
	);
};

export default PrivateHome;

export const getServerSideProps: GetServerSideProps = async (context) => {
	// Check authentication on server side
	const authCookie = context.req.cookies.private_auth;

	if (!authCookie || authCookie !== "authenticated") {
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