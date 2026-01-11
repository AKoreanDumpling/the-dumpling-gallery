/** @type {import('tailwindcss').Config} */
module.exports = {
	future: {
		hoverOnlyWhenSupported: true,
	},
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			animation: {
				"fade-in": "fadeIn 0.6s ease-out forwards",
				"slide-up": "slideUp 0.5s ease-out forwards",
				"pulse": "pulse 1.8s ease-out infinite",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { opacity: "0", transform: "translateY(20px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
			},
			boxShadow: {
				highlight: "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
			},
			screens: {
				narrow: { raw: "(max-aspect-ratio: 3 / 2)" },
				wide: { raw: "(min-aspect-ratio: 3 / 2)" },
				"taller-than-854": { raw: "(min-height: 854px)" },
			},
		},
	},
	plugins: [],
};
