import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
	render() {
		return (
			<Html lang="en">
				<Head>
					<link rel="icon" href="/favicon.ico" />
					<meta
						name="description"
						content="See pictures from The Dumpling Gallery"
					/>
					<meta property="og:site_name" content="thedumplinggallery.me" />
					<meta
						property="og:description"
						content="See pictures from The Dumpling Gallery."
					/>
					<meta property="og:title" content="The Dumpling Gallery" />
					<meta name="twitter:card" content="summary_large_image" />
					<meta name="twitter:title" content="The Dumpling Gallery" />
					<meta
						name="twitter:description"
						content="See pictures from The Dumpling Gallery."
					/>
				</Head>
				<body className="bg-black antialiased">
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
