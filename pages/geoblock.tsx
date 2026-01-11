import Head from "next/head";
import Bridge from "../components/Icons/Bridge";
import Footer from "./_footer";

function Geoblock() {
	return (
		<>
			<Head>
				<title>Geoblock | The Dumpling Gallery</title>
			</Head>

			<main className="mx-auto max-w-[1960px] p-4">

				<div className="display-grid place-items-center">

					<div className="after:content relative h-[629px] sm:max-w-full max-w-1/3 mb-5 flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0 animate-fade-in">
						<div className="absolute w-1000px inset-0 flex items-center justify-center opacity-20 ">
							<span className="flex max-h-full max-w-full items-center justify-center">
								<Bridge />
							</span>
							<span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
						</div>
						<h1 className="mt-8 mb-4 text-base font-bold uppercase tracking-widest animate-pulse">
							Geoblock
						</h1>
						<p className="max-w-[60ch] text-white/75 sm:max-w-[40ch] mt-0 mb-0 animate-slide-up animation-delay-100">
							It looks like you're outside of Canada! Unfortunately, The Dumpling Gallery is only available within Canada, in order to minimize resource consumption, and continue to operate sustainably. If you are within Canada and feel this is a mistake, please reach out. Otherwise, thank you for visiting!<br /><br /><em>Your interest is greatly appreciated.</em>
						</p>
						<h2 className="mt-0 mb-0 text-base font-bold uppercase tracking-wide animate-slide-up animation-delay-200">
							Service Unavailable
						</h2>
					</div>
			</main >
			< Footer />
		</>
	);
};


export default Geoblock;