import "../styles/index.css";
import type { AppProps } from "next/app";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={router.route}
				initial="initialState"
				animate="animateState"
				exit="exitState"
				transition={{
					duration: 0.75,
				}}
				variants={{
					initialState: {
						opacity: 0,
					},
					animateState: {
						opacity: 1,
					},
					exitState: {
						opacity: 0,
					},
				}}
			>
				<Component {...pageProps} />
			</motion.div>
		</AnimatePresence>
	);
}

export default MyApp;
