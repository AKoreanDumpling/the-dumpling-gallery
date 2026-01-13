import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "privateLastViewedPhoto";

function getSnapshot(): number | null {
	if (typeof window === "undefined") return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored !== null ? Number(stored) : null;
}

function getServerSnapshot(): number | null {
	return null;
}

function subscribe(callback: () => void): () => void {
	window.addEventListener("storage", callback);
	return () => window.removeEventListener("storage", callback);
}

export const usePrivateLastViewedPhoto = (): [number | null, (id: number | null) => void] => {
	const photoId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	const setLastViewedPhoto = useCallback((id: number | null) => {
		if (id !== null) {
			localStorage.setItem(STORAGE_KEY, String(id));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
		// Trigger a re-render by dispatching a storage event
		window.dispatchEvent(new Event("storage"));
	}, []);

	return [photoId, setLastViewedPhoto];
};