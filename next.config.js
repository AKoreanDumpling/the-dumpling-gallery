module.exports = {
	images: {
		loader: 'custom',
		loaderFile: './my/loader.js',
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				port: "",
				pathname: "/the-dumpling-cloud/**",
				search: "",
			},
		],
	},
};
