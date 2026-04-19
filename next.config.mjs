import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	disable: process.env.NODE_ENV === "development",
	register: true,
	workboxOptions: {
		runtimeCaching: [
			{
				urlPattern: /^https:\/\/images\.unsplash\.com\/.*$/i,
				handler: "StaleWhileRevalidate",
				options: {
					cacheName: "unsplash-images",
					expiration: {
						maxEntries: 32,
						maxAgeSeconds: 60 * 60 * 24 * 7,
					},
				},
			},
			{
				urlPattern: /\/api\/reports$/i,
				handler: "NetworkOnly",
			},
		],
	},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
};

export default withPWA(nextConfig);
