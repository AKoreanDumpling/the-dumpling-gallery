import "../styles/index.css";
import type { AppProps } from "next/app";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	display: "swap",
});

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<div className={openSans.className}>
			<Component {...pageProps} />
		</div>
	);
}

export default MyApp;
