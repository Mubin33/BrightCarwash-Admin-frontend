import type { NextConfig } from 'next';
import { getSecurityHeaders, getImageRemotePatterns, sanitizeHostOrOrigin } from './src/lib/security-headers';

// Derive allowed origins for local dev / mobile / tunnels from env var
const devOrigins = process.env.ALLOWED_DEV_ORIGINS
	? process.env.ALLOWED_DEV_ORIGINS.split(',')
			.map(sanitizeHostOrOrigin)
			.filter(Boolean)
	: [];

const nextConfig: NextConfig = {
	poweredByHeader: false,
	reactStrictMode: true,
	...(devOrigins.length > 0 ? { allowedDevOrigins: devOrigins } : {}),
	images: {
		unoptimized: true,
		remotePatterns: getImageRemotePatterns(),
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
	async headers() {
		return [
			{
				source: '/:path*',
				headers: getSecurityHeaders(),
			},
		];
	},
};

export default nextConfig;
