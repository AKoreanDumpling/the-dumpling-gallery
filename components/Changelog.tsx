import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ChangelogEntry {
	version: string;
	date: string;
	changes: string[];
}

const changelogData: ChangelogEntry[] = [
	{
		version: "2.0.1",
		date: "2026-2-13",
		changes: [
			"Emergency hotfix for mobile responsesiveness"
		],
	},
	{
		version: "2.0",
		date: "2026-1-11",
		changes: [
			"Updated changelog",
			"Completely redesigned animations website wide",
			"Added new loader",
			"Migrated from middleware to proxy",
			"Updated error page designs",
			"Fixed vertical image bug"
		],
	},
	{
		version: "1.6",
		date: "2026-1-3",
		changes: [
			"Got rid of thumbnails"
		],
	},
	{
		version: "1.5",
		date: "2025-12-20",
		changes: [
			"Finally finished private gallery!"
		],
	},
	{
		version: "1.2.1",
		date: "2025-12-11",
		changes: [
			"Emergency hotfix for loader hang"
		],
	},
	{
		version: "1.2.0",
		date: "2025-12-9",
		changes: [
			"Added loading overlay for gallery and modal",
			"Improved image loading performance",
			"Added changelog popup",
		],
	},
	{
		version: "1.1.0",
		date: "2025-12-7",
		changes: [
			"Added download button for full resolution images",
			"Added Twitter share functionality",
			"Improved mobile swipe navigation",
		],
	},
	{
		version: "0.5.0",
		date: "2025-12-01",
		changes: [
			"Initial release",
			"Photo gallery with modal view",
			"Keyboard navigation support",
			"First photos uploaded"
		],
	},
];

// Update with ver. num
export const CURRENT_VERSION = "2.0.1";

const fireConfetti = () => {
	const duration = 800;
	const end = Date.now() + duration;

	(function frame() {
		// Left side confetti
		confetti({
			particleCount: 1,
			angle: 60,
			spread: 55,
			origin: { x: 0, y: 0.6 },
			colors: ["#7c3aed"],
			zIndex: 9999,
		});

		// Right side confetti
		confetti({
			particleCount: 1,
			angle: 120,
			spread: 55,
			origin: { x: 1, y: 0.6 },
			colors: ["#ec4899"],
			zIndex: 9999,
		});

		if (Date.now() < end) {
			requestAnimationFrame(frame);
		}
	})();
};

export default function Changelog({
	isOpen,
	onClose,
	shouldCelebrate,
}: {
	isOpen: boolean;
	onClose: () => void;
	shouldCelebrate: boolean;
}) {
	useEffect(() => {
		if (isOpen && shouldCelebrate) {
			fireConfetti();
		}
	}, [isOpen, shouldCelebrate]);

	return (
		<AnimatePresence>
			{isOpen && (
				<Dialog
					static
					open={isOpen}
					onClose={onClose}
					className="fixed inset-0 z-[200] flex items-center justify-center p-4"
				>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 } as any}
						className="fixed inset-0 bg-black/70 backdrop-blur-sm"
						aria-hidden="true"
					/>
					<motion.div
						role="dialog"
						aria-modal="true"
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ duration: 0.2 } as any}
						className="relative z-[201] w-full max-w-lg max-h-[80vh] overflow-hidden rounded-xl bg-black border border-white/20 shadow-2xl"
					>
						{/* Header */}
						<div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
							<h2 className="text-xl font-semibold text-white">
								What's New
							</h2>

						</div>

						{/* Content */}
						<div className="overflow-y-auto px-6 py-4 max-h-[60vh]">
							{changelogData.map((entry, index) => (
								<div
									key={entry.version}
									className={`${index !== 0 ? "mt-6 pt-6 border-t border-white/10" : ""
										}`}
								>
									<div className="flex items-center gap-3 mb-3">
										<span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
											v{entry.version}
										</span>
										<span className="text-sm text-white/50">{entry.date}</span>
									</div>
									<ul className="space-y-2">
										{entry.changes.map((change, changeIndex) => (
											<li
												key={changeIndex}
												className="flex items-start gap-2 text-white/75"
											>
												<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
												<span>{change}</span>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>

						{/* Footer */}
						<div className="border-t border-white/10 px-6 py-4">
							<button
								onClick={onClose}
								className="w-full rounded-lg bg-white px-4 py-2 font-semibold text-black transition hover:bg-white/90"
							>
								Close
							</button>
						</div>
					</motion.div>
				</Dialog>
			)}
		</AnimatePresence>
	);
}