import { useState, useEffect } from "react";
import { CURRENT_VERSION } from "../components/Changelog";

const CHANGELOG_STORAGE_KEY = "changelog_last_seen_version";

export function useChangelog() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const lastSeenVersion = localStorage.getItem(CHANGELOG_STORAGE_KEY);

		// Show changelog if user hasn't seen this version yet
		if (lastSeenVersion !== CURRENT_VERSION) {
			setIsOpen(true);
		}
	}, []);

	const closeChangelog = () => {
		localStorage.setItem(CHANGELOG_STORAGE_KEY, CURRENT_VERSION);
		setIsOpen(false);
	};

	const openChangelog = () => {
		setIsOpen(true);
	};

	return {
		isOpen,
		openChangelog,
		closeChangelog,
	};
}