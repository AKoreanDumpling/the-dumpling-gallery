import Head from "next/head";
import Bridge from "../components/Icons/Bridge";
import Footer from "./_footer";


function Custom404() {
	return (
		<>
			<Head>
				<title>Error 404 | The Dumpling Gallery</title>
			</Head>

			<main className="mx-auto max-w-[1960px] p-4">

				<div className="flex min-h-[80vh] items-center justify-center px-4">

					<div className="after:content relative w-full max-w-md h-auto mb-5 flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-8 sm:pb-16 pt-32 sm:pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight">
						<div className="absolute w-1000px inset-0 flex items-center justify-center opacity-20 ">
							<span className="flex max-h-full max-w-full items-center justify-center">
								<Bridge />
							</span>
							<span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
						</div>
						<h1 className="mt-8 mb-4 text-base font-bold uppercase tracking-widest">
							Client Error 404
						</h1>
						<p className="max-w-[60ch] text-white/75 sm:max-w-[40ch] mt-0 mb-0">
							The requested resource could not be found on the server.<br /><br /><em>Please check the link you received or return to the Main Page.</em>
						</p>
						<h2 className="mt-0 mb-0 text-base font-bold uppercase tracking-wide">
							Not found
						</h2>

						<a
							href="/"
							className="pointer z-10 mt-0 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white hover:scale-105"
							rel="noreferrer"
						>
							Return to Main Page
						</a>
					</div>

				</div>

			</main >
			< Footer />
		</>
	);
};


export default Custom404;