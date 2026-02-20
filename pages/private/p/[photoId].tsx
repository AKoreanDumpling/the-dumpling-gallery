import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import GalleryCarousel from "../../../components/GalleryCarousel";
import PrivateBanner from "../../../components/PrivateBanner";
import { getThumbnailUrl } from "../../../utils/mediaHelpers";
import type { ImageProps } from "../../../utils/types";
import { isAuthenticated } from "../../api/auth";
import getPrivateResults from "../../../utils/cachedPrivateImages";
import { addBlurDataUrl, mapResourcesToImages } from "../../../utils/prepareGalleryImages";

const PrivatePhoto: NextPage = ({
	currentPhoto,
}: {
	currentPhoto: ImageProps;
}) => {
	const router = useRouter();
	const { photoId } = router.query;
	let index = Number(photoId);

	const currentPhotoUrl = getThumbnailUrl(currentPhoto, 2560);

	return (
		<>
			<Head>
				<title>Private Photo | The Dumpling Gallery</title>
				<meta property="og:image" content={currentPhotoUrl} />
				<meta name="twitter:image" content={currentPhotoUrl} />
			</Head>
			<PrivateBanner />
			<main className="mx-auto max-w-[1960px] p-4 pt-14">
				<GalleryCarousel
					currentPhoto={currentPhoto}
					index={index}
					basePath="/private"
					storageKey="privateLastViewedPhoto"
				/>
			</main>
		</>
	);
};

export default PrivatePhoto;

export const getServerSideProps: GetServerSideProps = async (context) => {
	const authCookie = context.req.cookies.private_auth;

	if (!isAuthenticated(authCookie)) {
		return {
			redirect: {
				destination: `/login?redirect=/private/p/${context.params?.photoId}`,
				permanent: false,
			},
		};
	}

	const results = await getPrivateResults();
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