const PrivateBanner = () => {
	return (
		<div className="fixed top-0 left-0 right-0 z-50 animated-gradient-banner py-2 px-4 text-center text-white text-sm font-semibold shadow-lg">
			<span
				className="m-2 content-between items-center justify-center bg-yellow-800 rounded-full font-semibold px-3 py-1"
			>
				🔒 Private
			</span>
		</div>
	);
};

export default PrivateBanner;