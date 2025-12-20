import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Bridge from "../components/Icons/Bridge";
import Footer from "./_footer";

const Login: NextPage = () => {
	const router = useRouter();
	const { redirect } = router.query;
	const [accessCode, setAccessCode] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

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
				body: JSON.stringify({ accessCode }),
			});

			if (response.ok) {
				// Redirect to the private gallery or the originally requested page
				const redirectTo = typeof redirect === "string" ? redirect : "/private";
				router.push(redirectTo);
			} else {
				const data = await response.json();
				setError(data.message || "Invalid access code");
			}
		} catch (err) {
			setError("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Head>
				<title>Login | The Dumpling Gallery</title>
			</Head>

			<main className="mx-auto max-w-[1960px] p-4">
				<div className="flex min-h-[80vh] items-center justify-center">
					<div className="after:content relative h-[629px] sm:max-w-full max-w-1/3 mb-5 flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
						<div className="absolute inset-0 flex items-center justify-center opacity-20">
							<span className="flex max-h-full max-w-full items-center justify-center">
								<Bridge />
							</span>
							<span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
						</div>

						<h1 className="z-10 mt-8 mb-4 text-base font-bold uppercase tracking-widest">
							The Dumpling Gallery (Private)
						</h1>

						<p className="z-10 max-w-[40ch] text-white/75 sm:max-w-[32ch] mb-6">
							Please enter your access code to continue.
						</p>

						<form onSubmit={handleSubmit} className="z-10 w-full max-w-xs flex flex-col gap-4">
							<input
								type="password"
								value={accessCode}
								onChange={(e) => setAccessCode(e.target.value)}
								placeholder="Enter access code"
								className="w-full rounded-lg border border-white/30 bg-black/50 px-4 py-3 text-center text-white placeholder-white/50 focus:border-white focus:outline-none"
								disabled={isLoading}
							/>

							{error && (
								<p className="text-red-400 text-sm">{error}</p>
							)}

							<button
								type="submit"
								disabled={isLoading}
								className="pointer rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white disabled:opacity-50"
							>
								{isLoading ? "Verifying..." : "Let me in!"}
							</button>
						</form>
						<a
							href="/"
							className="z-10 mt-4 text-sm text-white/75 hover:text-white transition"
						>
							← Return to Main Page
						</a>
					</div>
				</div>
			</main>

			<Footer />
		</>
	);
};

export default Login;