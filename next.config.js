module.exports = {
	images: {
		loader: 'custom',
		loaderFile: './my/loader.js',
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ik.imagekit.io",
				port: "",
				pathname: "/**",
				search: "",
			},
		],
	},
};
