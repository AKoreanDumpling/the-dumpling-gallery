import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import PrivateCarousel from "../../../components/PrivateCarousel";
import PrivateBanner from "../../../components/PrivateBanner";
import cloudinary from "../../../utils/cloudinary";
import getBase64ImageUrl from "../../../utils/generateBlurPlaceholder";
import { getThumbnailUrl } from "../../../utils/mediaHelpers";
import type { ImageProps } from "../../../utils/types";
import { isAuthenticated } from "../../api/auth";

const PrivatePhoto: NextPage = ({
	currentPhoto,
	images,
}: {
	currentPhoto: ImageProps;
	images: ImageProps[];
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
				<PrivateCarousel currentPhoto={currentPhoto} index={index} images={images} />
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
			resource_type: result.resource_type,
		});
		i++;
	}

	const currentPhoto = reducedResults.find(
		(img) => img.id === Number(context.params.photoId),
	);

	if (!currentPhoto) {
		return {
			notFound: true,
		};
	}

	currentPhoto.blurDataUrl = await getBase64ImageUrl(currentPhoto);

	return {
		props: {
			currentPhoto: currentPhoto,
			images: reducedResults,
		},
	};
};