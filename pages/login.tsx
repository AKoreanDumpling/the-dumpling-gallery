import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
			staggerChildren: 0.1,
			delayChildren: 0.2
		}
	}
};

const shakeAnimation = {
	shake: {
		x: [0, -10, 10, -10, 10, 0],
		transition: { duration: 0.5 }
	}
};

const Login: NextPage = () => {
	const router = useRouter();
	const { redirect } = router.query;
	const [accessCode, setAccessCode] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [shouldShake, setShouldShake] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/auth", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "same-origin",
				body: JSON.stringify({ accessCode }),
			});

			if (response.ok) {
				const redirectTo = typeof redirect === "string" ? redirect : "/private";
				window.location.href = redirectTo;
			} else {
				const data = await response.json();
				setError(data.message || "Invalid access code");
				setShouldShake(true);
				setTimeout(() => setShouldShake(false), 500);
			}
		} catch (err) {
			setError("An error occurred. Please try again.");
			setShouldShake(true);
			setTimeout(() => setShouldShake(false), 500);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Head>
				<title>Login | The Dumpling Gallery (Private)</title>
			</Head>

			<main className="mx-auto max-w-[1960px] p-4">
				<div className="flex min-h-[80vh] items-center justify-center px-4">
					<motion.div
						className="after:content relative w-full max-w-md h-auto mb-5 flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-8 sm:pb-16 pt-32 sm:pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
						initial="hidden"
						animate="visible"
						variants={staggerContainer}
					>
						<motion.div
							className="absolute inset-0 flex items-center justify-center opacity-20"
							initial={{ opacity: 0, scale: 1.1 }}
							animate={{ opacity: 0.2, scale: 1 }}
							transition={{ duration: 1.2, ease: "easeOut" }}
						>
							<span className="flex max-h-full max-w-full items-center justify-center">
								<Bridge />
							</span>
							<span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
						</motion.div>

						<motion.h1
							className="z-10 mt-8 mb-4 text-base font-bold uppercase tracking-widest"
							variants={fadeInUp}
						>
							The Dumpling Gallery (Private)
						</motion.h1>

						<motion.p
							className="z-10 max-w-[40ch] text-white/75 sm:max-w-[32ch] mb-6"
							variants={fadeInUp}
						>
							Please enter your access code to continue.
						</motion.p>

						<motion.form
							onSubmit={handleSubmit}
							className="z-10 w-full max-w-xs flex flex-col gap-4"
							variants={fadeInUp}
							animate={shouldShake ? "shake" : "visible"}
						>
							<motion.input
								type="password"
								value={accessCode}
								onChange={(e) => setAccessCode(e.target.value)}
								placeholder="Enter access code"
								className="w-full rounded-lg border border-white/30 bg-black/50 px-4 py-3 text-center text-white placeholder-white/50 focus:border-white focus:outline-none transition-all duration-300"
								disabled={isLoading}
								whileFocus={{ scale: 1.02, borderColor: "rgba(255,255,255,0.8)" }}
								animate={shouldShake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
								transition={shouldShake ? { duration: 0.5 } : {}}
							/>

							<AnimatePresence mode="wait">
								{error && (
									<motion.p
										className="text-red-400 text-sm"
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.2 }}
									>
										{error}
									</motion.p>
								)}
							</AnimatePresence>

							<motion.button
								type="submit"
								disabled={isLoading}
								className="pointer rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition-colors transition-shadow hover:bg-white/10 hover:text-white disabled:opacity-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								{isLoading ? (
									<motion.span
										className="inline-flex items-center gap-2"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
									>
										<motion.span
											className="inline-block h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
											animate={{ rotate: 1800 }}
											transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
										/>
										Verifying...
									</motion.span>
								) : (
									"Let me in!"
								)}
							</motion.button>
						</motion.form>

						<motion.a
							href="/"
							className="z-10 mt-4 text-sm text-white/75 hover:text-white transition-colors"
							variants={fadeInUp}
							whileHover={{ x: -5 }}
							transition={{ type: "spring", stiffness: 300 }}
						>
							← Return to Main Page
						</motion.a>
					</motion.div>
				</div>
			</main>

			<Footer />
		</>
	);
};

export default Login;