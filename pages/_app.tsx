import "../styles/index.css";
import type { AppProps } from "next/app";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";

const WIPE_DURATION = 500;
const MIN_HOLD_TIME = 1000;

// Routes that should skip the wipe transition
const shouldSkipWipe = (fromPath: string, toPath: string) => {
	const isPhotoRoute = (path: string) => path.includes("/p/");
	const isIndexRoute = (path: string) => path === "/" || path === "/private";
	const fromIsPhoto = isPhotoRoute(fromPath);
	const toIsPhoto = isPhotoRoute(toPath);
	const fromIsIndex = isIndexRoute(fromPath);
	const toIsIndex = isIndexRoute(toPath);

	return (fromIsPhoto && toIsIndex) || (fromIsIndex && toIsPhoto) || (fromIsPhoto && toIsPhoto);
};

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const [wipeState, setWipeState] = useState<"idle" | "entering" | "covering" | "exiting">("covering"); // Start with covering for initial load
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [displayedComponent, setDisplayedComponent] = useState<{ Component: AppProps["Component"]; pageProps: AppProps["pageProps"] }>({ Component, pageProps });
	const transitionStartTime = useRef<number>(0);
	const pendingUpdate = useRef<{ Component: AppProps["Component"]; pageProps: AppProps["pageProps"] } | null>(null);
	const skipWipeRef = useRef(false);

	// Handle initial load transition
	useEffect(() => {
		if (isInitialLoad) {
			// Wait for the page to be ready, then exit the wipe
			const timer = setTimeout(() => {
				setWipeState("exiting");
				setTimeout(() => {
					setWipeState("idle");
					setIsInitialLoad(false);
				}, WIPE_DURATION);
			}, MIN_HOLD_TIME);

			return () => clearTimeout(timer);
		}
	}, [isInitialLoad]);

	useEffect(() => {
		const handleStart = (url: string) => {
			if (url !== router.asPath) {
				// Check if we should skip the wipe for this navigation
				if (shouldSkipWipe(router.asPath, url)) {
					skipWipeRef.current = true;
					return;
				}

				skipWipeRef.current = false;
				transitionStartTime.current = Date.now();
				setWipeState("entering");
			}
		};

		const handleComplete = () => {
			// If skipping wipe, update content immediately
			if (skipWipeRef.current) {
				setDisplayedComponent({ Component, pageProps });
				skipWipeRef.current = false;
				return;
			}

			// Store the new component/props to be displayed after wipe covers
			pendingUpdate.current = { Component, pageProps };

			const elapsed = Date.now() - transitionStartTime.current;
			const minTotalTime = WIPE_DURATION + MIN_HOLD_TIME;
			const remainingTime = Math.max(0, minTotalTime - elapsed);

			// Wait for wipe to fully cover, then update content and exit
			setTimeout(() => {
				if (pendingUpdate.current) {
					setDisplayedComponent(pendingUpdate.current);
					pendingUpdate.current = null;
				}
				setWipeState("exiting");
				// Reset to idle after exit animation completes
				setTimeout(() => {
					setWipeState("idle");
				}, WIPE_DURATION);
			}, remainingTime);
		};

		router.events.on("routeChangeStart", handleStart);
		router.events.on("routeChangeComplete", handleComplete);
		router.events.on("routeChangeError", handleComplete);

		return () => {
			router.events.off("routeChangeStart", handleStart);
			router.events.off("routeChangeComplete", handleComplete);
			router.events.off("routeChangeError", handleComplete);
		};
	}, [router, Component, pageProps]);

	const getWipeX = () => {
		switch (wipeState) {
			case "idle":
				return "-100%"; // Off-screen left, ready for next transition
			case "entering":
			case "covering":
				return "0%";    // Covering the screen
			case "exiting":
				return "100%";  // Sliding off to the right
		}
	};

	// Render the stored component, not the current one from props
	const { Component: DisplayedComponent, pageProps: displayedPageProps } = displayedComponent;

	const showLoader = wipeState === "covering" || wipeState === "entering";

	return (
		<>
			{/* Black sliding wipe overlay */}
			<motion.div
				className="fixed inset-0 z-100 bg-[#1A1A1A] pointer-events-none flex items-center justify-center"
				animate={{ x: getWipeX() }}
				transition={{
					duration: wipeState === "idle" ? 0 : WIPE_DURATION / 1000,
					ease: [0.76, 0, 0.24, 1],
				}}
			>
				{/* Centered loader */}
				{showLoader && (
					<motion.div
						className="flex flex-col bg-white/10 aspect-square rounded-xl items-center gap-4"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.2 }}
					>
						<motion.div
							className="h-12 w-12 rounded-full border-4 m-5 border-white/20 border-t-white"
							animate={{ rotate: 1800 }}
							transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
						/>
					</motion.div>
				)}
			</motion.div>
			<DisplayedComponent {...displayedPageProps} />
		</>
	);
}

export default MyApp;
