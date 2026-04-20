import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	disable: process.env.NODE_ENV === "development",
	register: true,
	workboxOptions: {
		runtimeCaching: [
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
