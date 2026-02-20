import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import GalleryCarousel from "../../components/GalleryCarousel";
import getResults from "../../utils/cachedImages";
import cloudinary from "../../utils/cloudinary";
import type { ImageProps } from "../../utils/types";
import { addBlurDataUrl, mapResourcesToImages } from "../../utils/prepareGalleryImages";

const Home: NextPage = ({ currentPhoto }: { currentPhoto: ImageProps }) => {
	const router = useRouter();
	const { photoId } = router.query;
	let index = Number(photoId);

	return (
		<>
			<Head>
				<title>{index} | The Dumpling Gallery</title>
			</Head>
			<main className="mx-auto max-w-[1960px] p-4">
				<GalleryCarousel
					currentPhoto={currentPhoto}
					index={index}
					storageKey="lastViewedPhoto"
				/>
			</main>
		</>
	);
};

export default Home;

export const getStaticProps: GetStaticProps = async (context) => {
	const results = await getResults();

	const reducedResults = mapResourcesToImages(results.resources);

	const currentPhoto = reducedResults.find(
		(img) => img.id === Number(context.params.photoId),
	);

	if (!currentPhoto) {
		return {
			notFound: true,
		};
	}

	const currentPhotoWithBlur = await addBlurDataUrl(currentPhoto);

	return {
		props: {
			currentPhoto: currentPhotoWithBlur,
		},
	};
};

export async function getStaticPaths() {
	const results = await cloudinary.v2.search
		.expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
		.sort_by("public_id", "desc")
		.max_results(400)
		.execute();

	let fullPaths = [];
	for (let i = 0; i < results.resources.length; i++) {
		fullPaths.push({ params: { photoId: i.toString() } });
	}

	return {
		paths: fullPaths,
		fallback: false,
	};
}
