import { useEffect, useState } from "react";
import { CURRENT_VERSION } from "../components/Changelog";

const CHANGELOG_STORAGE_KEY = "changelog_last_seen_version";

export function useChangelog() {
	const [isOpen, setIsOpen] = useState(false);
	const [hasUnseenVersion, setHasUnseenVersion] = useState(false);

	useEffect(() => {
		const lastSeenVersion = localStorage.getItem(CHANGELOG_STORAGE_KEY);
		setHasUnseenVersion(lastSeenVersion !== CURRENT_VERSION);
	}, []);

	const closeChangelog = () => {
		localStorage.setItem(CHANGELOG_STORAGE_KEY, CURRENT_VERSION);
		setIsOpen(false);
		setHasUnseenVersion(false);
	};

	const openChangelog = () => {
		setIsOpen(true);
	};

	return {
		isOpen,
		hasUnseenVersion,
		openChangelog,
		closeChangelog,
	};
}