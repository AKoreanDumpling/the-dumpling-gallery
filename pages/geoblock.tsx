import Head from "next/head";
import { motion } from "framer-motion";
import Bridge from "../components/Icons/Bridge";
import Footer from "./_footer";

// Animation variants
const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.2
		}
	}
};

function Geoblock() {
	return (
		<>
			<Head>
				<title>Geoblock | The Dumpling Gallery</title>
			</Head>

			<main className="mx-auto max-w-[1960px] p-4">

				<div className="display-grid place-items-center">

					<motion.div
						className="after:content relative h-[629px] sm:max-w-full max-w-1/3 mb-5 flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0"
						initial="hidden"
						animate="visible"
						variants={staggerContainer}
					>
						<motion.div
							className="absolute w-1000px inset-0 flex items-center justify-center opacity-20"
							initial={{ opacity: 0, scale: 1.1 }}
							animate={{ opacity: 0.2, scale: 1 }}
							transition={{ duration: 1.2, ease: "easeOut" }}
						>
							<span className="flex max-h-full max-w-full items-center justify-center">
								<Bridge />
							</span>
							<span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
						</motion.div>

						<motion.div
							className="z-10"
							variants={fadeInUp}
						>
							<motion.div
								className="mb-4 text-6xl"
								animate={{
									rotateY: [0, 360]
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									repeatDelay: 2,
									ease: "easeInOut"
								}}
							>
								🌍
							</motion.div>
						</motion.div>

						<motion.h1
							className="mt-8 mb-4 text-base font-bold uppercase tracking-widest"
							variants={fadeInUp}
						>
							Geoblock
						</motion.h1>

						<motion.p
							className="max-w-[60ch] text-white/75 sm:max-w-[40ch] mt-0 mb-0"
							variants={fadeInUp}
						>
							It looks like you're outside of Canada! Unfortunately, The Dumpling Gallery is only available within Canada, in order to minimize resource consumption, and continue to operate sustainably. If you are within Canada and feel this is a mistake, please reach out. Otherwise, thank you for visiting!<br /><br /><em>Your interest is greatly appreciated.</em>
						</motion.p>

						<motion.h2
							className="mt-0 mb-0 text-base font-bold uppercase tracking-wide"
							variants={fadeInUp}
							animate={{
								scale: [1, 1.02, 1]
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: "easeInOut"
							}}
						>
							Service Unavailable
						</motion.h2>

						<motion.div
							className="flex items-center gap-2 mt-4"
							variants={fadeInUp}
						>
							<motion.span
								className="text-2xl"
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
							>
								🍁
							</motion.span>
							<span className="text-white/50 text-sm">Canada only</span>
							<motion.span
								className="text-2xl"
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5, delay: 0.25 }}
							>
								🍁
							</motion.span>
						</motion.div>
					</motion.div>
				</div>
			</main >
			< Footer />
		</>
	);
};


export default Geoblock;