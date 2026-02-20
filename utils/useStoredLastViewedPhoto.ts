import { useCallback, useSyncExternalStore } from "react";

function getSnapshot(storageKey: string): number | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? Number(stored) : null;
}

function getServerSnapshot(): number | null {
    return null;
}

function subscribe(callback: () => void): () => void {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

export const useStoredLastViewedPhoto = (
    storageKey: string,
): [number | null, (id: number | null) => void] => {
    const photoId = useSyncExternalStore(
        (callback) => subscribe(callback),
        () => getSnapshot(storageKey),
        getServerSnapshot,
    );

    const setLastViewedPhoto = useCallback((id: number | null) => {
        if (id !== null) {
            localStorage.setItem(storageKey, String(id));
        } else {
            localStorage.removeItem(storageKey);
        }
        window.dispatchEvent(new Event("storage"));
    }, [storageKey]);

    return [photoId, setLastViewedPhoto];
};
