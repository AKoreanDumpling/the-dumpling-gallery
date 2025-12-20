import cloudinary from "./cloudinary";

let cachedResults: any;

export default async function getPrivateResults() {
	if (!cachedResults) {
		const fetchedResults = await cloudinary.v2.search
			.expression(`folder:${process.env.PRIVATE_CLOUDINARY_FOLDER}/*`)
			.sort_by("public_id", "desc")
			.max_results(400)
			.execute();

		cachedResults = fetchedResults;
	}

	return cachedResults;
}