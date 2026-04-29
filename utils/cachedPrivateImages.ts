import type { ImageKitFile } from "./imagekit";
import { listImageKitFiles } from "./imagekit";

let cachedResults: { resources: ImageKitFile[] } | null = null;

function getImageKitFolder(): string {
	const folder = process.env.IMAGEKIT_PRIVATE_FOLDER;
	if (!folder) {
		throw new Error("Missing IMAGEKIT_PRIVATE_FOLDER environment variable.");
	}
	return folder;
}

function normalizeFilePath(file: ImageKitFile): string {
	const path = file.filePath ?? file.name ?? "";
	return path.startsWith("/") ? path.slice(1) : path;
}

export default async function getPrivateResults() {
	if (!cachedResults) {
		const fetchedResults = await listImageKitFiles(getImageKitFolder(), 400);
		const sortedResults = [...fetchedResults].sort((a, b) =>
			normalizeFilePath(b).localeCompare(normalizeFilePath(a)),
		);

		cachedResults = { resources: sortedResults };
	}

	return cachedResults;
}