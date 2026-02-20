import { useStoredLastViewedPhoto } from "./useStoredLastViewedPhoto";

const STORAGE_KEY = "privateLastViewedPhoto";

export const usePrivateLastViewedPhoto = (): [number | null, (id: number | null) => void] => {
	return useStoredLastViewedPhoto(STORAGE_KEY);
};