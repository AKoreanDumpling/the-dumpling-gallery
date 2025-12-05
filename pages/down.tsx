import type { NextPage } from "next";
import Head from "next/head";
import Bridge from "../components/Icons/Bridge";


const Down: NextPage = () => {
	return (
		<>
			<Head>
				<title>The Dumpling Gallery</title>
			</Head>

			<main className="mx-auto max-w-[1960px] p-4">

				<div className="display-grid place-items-center">

					<div className="after:content relative h-[629px] w-1/4 mb-5 flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
						<div className="absolute inset-0 flex items-center justify-center opacity-20">
							<span className="flex max-h-full max-w-full items-center justify-center">
								<Bridge />
							</span>
							<span className="absolute left-0 right-0 bottom-0 h-[250px] bg-gradient-to-b from-black/0 via-black to-black"></span>
						</div>
						<h1 className="mt-8 mb-2 text-base font-bold uppercase tracking-widest">
							The Dumpling Gallery<br />is down for Maintenance
						</h1>

						<p className="max-w-[40ch] text-white/75 sm:max-w-[32ch]">
							We will be back online shortly with new photos, thank you for your patience!
						</p>
					</div>
				</div>
			</main >


			<footer className="p-6 text-center text-white/80 sm:p-12">
				<hr /><br />

				<a
					href="https://twitter.com/@AKoreanDumpling"
					target="_blank"
					className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
					rel="noreferrer"
				>
					Nathan Mah
				</a>
				<br /> <br />
				<a
					href="#"
					className="font-semibold hover:text-white"
					rel="noreferrer"
				>
					Back to top
				</a>
				{" | "}
				<a
					href="https://github.com/AKoreanDumpling/the-dumpling-gallery/blob/main/LICENSE"
					target="_blank"
					className="font-semibold hover:text-white"
					rel="noreferrer"
				>
					View license
				</a>
			</footer>
		</>
	);
};

export default Down;