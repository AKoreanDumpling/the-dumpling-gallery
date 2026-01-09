import Head from "next/head";
import Bridge from "../components/Icons/Bridge";
import Footer from "./_footer";


function Custom503() {
	return (
		<>
			<Head>
				<title>Geoblock | The Dumpling Gallery</title>
			</Head>

			<main className="mx-auto max-w-[1960px] p-4">

				<div className="display-grid place-items-center">

					<div className="after:content relative h-[629px] sm:max-w-full max-w-1/3 mb-5 flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
						<div className="absolute w-1000px inset-0 flex items-center justify-center opacity-20">
							<span className="flex max-h-full max-w-full items-center justify-center">
								<Bridge />
							</span>
							<span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
						</div>
						<h1 className="mt-8 mb-4 text-base font-bold uppercase tracking-widest">
							Geoblock
						</h1>

						<p className="max-w-[60ch] text-white/75 sm:max-w-[40ch] mt-0 mb-0">
							Thank you for visiting! Although your interest is appreciated, The Dumpling Gallery will only be available within Canada in order to minimize resource consumption. If you have a question or concern, please feel free to reach out.<br /><br /><em>This request should not be repeated.</em>
						</p>
						<h2 className="mt-0 mb-0 text-base font-bold uppercase tracking-wide">
							Region not supported
						</h2>
					</div>
				</div>
			</main >
			< Footer />
		</>
	);
};


export default Custom503;