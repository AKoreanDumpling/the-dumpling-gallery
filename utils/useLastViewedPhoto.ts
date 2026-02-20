import { useStoredLastViewedPhoto } from "./useStoredLastViewedPhoto";

const STORAGE_KEY = "lastViewedPhoto";

export const useLastViewedPhoto = (): [number | null, (id: number | null) => void] => {
	return useStoredLastViewedPhoto(STORAGE_KEY);
};
