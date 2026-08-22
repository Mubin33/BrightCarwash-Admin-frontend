import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactStrictMode: true,
	allowedDevOrigins: [
		'10.10.33.10',
		'https://holiday-exposure-pocket-whilst.trycloudflare.com',
		'https://karma-usr-dealers-msg.trycloudflare.com',

	],
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "holiday-exposure-pocket-whilst.trycloudflare.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "holiday-exposure-pocket-whilst.trycloudflare.com",
				pathname: "/**",
			},
		],
	},
	transpilePackages: [
		'@tiptap/core',
		'@tiptap/pm',
		'@tiptap/extensions',
		'@tiptap/react',
		'@tiptap/starter-kit',
		'@tiptap/extension-placeholder',
		'@tiptap/extension-underline',
		'@tiptap/extension-link',
		'@tiptap/extension-image',
		'@tiptap/extension-table',
		'@tiptap/extension-table-cell',
		'@tiptap/extension-table-header',
		'@tiptap/extension-table-row',
		'@tiptap/extension-text-align',
		'@tiptap/extension-color',
		'@tiptap/extension-text-style',
	],
	reactCompiler: true,
};

export default nextConfig;