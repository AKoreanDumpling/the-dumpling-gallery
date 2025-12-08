function Footer() {
	return (
		<footer className="p-6 text-center text-white/80 sm:p-12">
			<hr />
			<h1 className="mt-6 mb-2 text-base font-bold uppercase tracking-widest" id="credits"> Credit:</h1>
			<div className="mt-4">
				<a
					href="https://twitter.com/@AKoreanDumpling"
					target="_blank"
					className="pointer mt-1 z-10 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white"
					rel="noreferrer"
				>
					Nathan Mah
				</a>
			</div>
			<div className="mt-4">
				<a
					href="#"
					className="font-semibold hover:text-white"
					rel="noreferrer"
				>
					Back to top
				</a>
				{" | "}
				<a
					href="/LICENSE"
					target="_blank"
					className="font-semibold hover:text-white"
					rel="noreferrer"
				>
					View license
				</a>
			</div>
		</footer >
	)
}
export default Footer;