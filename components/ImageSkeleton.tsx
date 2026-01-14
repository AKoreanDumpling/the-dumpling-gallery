import { motion } from "framer-motion";

interface ImageSkeletonProps {
	count?: number;
	variant?: "gallery" | "modal" | "thumbnail";
}

const shimmer = {
	initial: { x: "-100%" },
	animate: {
		x: "100%",
		transition: {
			repeat: Infinity,
			duration: 1.5,
			ease: "easeInOut",
		},
	},
};

const ImageSkeleton = ({ count = 1, variant = "gallery" }: ImageSkeletonProps) => {
	// Generate varied heights to mimic masonry layout
	const heights = [300, 400, 350, 450, 380, 320, 420, 360];

	return (
		<>
			{Array.from({ length: count }).map((_, index) => (
				<motion.div
					key={index}
					className="relative mb-5 overflow-hidden rounded-lg bg-white/10"
					style={{ height: heights[index % heights.length] }}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.05, duration: 0.3 }}
				>
					{/* Shimmer effect */}
					<motion.div
						className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
						variants={shimmer}
						initial="initial"
						animate="animate"
					/>
					{/* Placeholder content */}
					<div className="absolute bottom-4 left-4 right-4 space-y-2">
						<div className="h-3 w-3/4 rounded bg-white/10" />
						<div className="h-3 w-1/2 rounded bg-white/10" />
					</div>
				</motion.div>
			))}
		</>
	);
};

export default ImageSkeleton;