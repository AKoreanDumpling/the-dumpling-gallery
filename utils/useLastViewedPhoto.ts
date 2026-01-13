import { useEffect, useState } from "react";

const STORAGE_KEY = "lastViewedPhoto";

export const useLastViewedPhoto = (): [number | null, (id: number | null) => void] => {
	const [photoId, setPhotoId] = useState<number | null>(null);

	useEffect(() => {
		// Load from localStorage on mount
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored !== null) {
			setPhotoId(Number(stored));
		}
	}, []);

	const setLastViewedPhoto = (id: number | null) => {
		setPhotoId(id);
		if (id !== null) {
			localStorage.setItem(STORAGE_KEY, String(id));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	};

	return [photoId, setLastViewedPhoto];
};
