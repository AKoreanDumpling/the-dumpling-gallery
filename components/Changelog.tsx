import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

interface ChangelogEntry {
	version: string;
	date: string;
	changes: string[];
}

const changelogData: ChangelogEntry[] = [
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
			"NEW - Finally finished private gallery!"
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
		date: "2025-01-10",
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
export const CURRENT_VERSION = "1.5";

export default function Changelog({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
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
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black/70 backdrop-blur-sm"
						aria-hidden="true"
					/>

					<Dialog.Panel
						as={motion.div}
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ duration: 0.2 }}
						className="relative z-[201] w-full max-w-lg max-h-[80vh] overflow-hidden rounded-xl bg-black border border-white/20 shadow-2xl"
					>
						{/* Header */}
						<div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
							<Dialog.Title className="text-xl font-semibold text-white">
								What's New
							</Dialog.Title>

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
								Got it!
							</button>
						</div>
					</Dialog.Panel>
				</Dialog>
			)}
		</AnimatePresence>
	);
}