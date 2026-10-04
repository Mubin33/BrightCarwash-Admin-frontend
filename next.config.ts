import type { NextConfig } from 'next';

// Sanitize host/origin strings (strip protocol and trailing paths)
const sanitizeOrigin = (val: string) => val.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();

// Derive allowed origins for local dev / mobile / tunnels from env var
const devOrigins = process.env.ALLOWED_DEV_ORIGINS
	? process.env.ALLOWED_DEV_ORIGINS.split(',')
			.map(sanitizeOrigin)
			.filter(Boolean)
	: [];

// Extract hostname from storage URL if configured
const getStorageHostname = (): string | null => {
	try {
		const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
		if (storageUrl) {
			return new URL(storageUrl).hostname;
		}
	} catch {
		// Ignore invalid URL format
	}
	return null;
};

const storageHostname = getStorageHostname();

// Extra image hosts specified via environment variable (comma-separated)
const additionalImageHosts = process.env.ADDITIONAL_IMAGE_HOSTS
	? process.env.ADDITIONAL_IMAGE_HOSTS.split(',')
			.map(sanitizeOrigin)
			.filter(Boolean)
	: [];

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
	{
		protocol: 'https',
		hostname: 's3.us-east-1.amazonaws.com',
		pathname: '/**',
	},
	{
		protocol: 'https',
		hostname: '*.amazonaws.com',
		pathname: '/**',
	},
	{
		protocol: 'https',
		hostname: '*.pixelstack.cloud',
		pathname: '/**',
	},
	...(storageHostname &&
	storageHostname !== 's3.us-east-1.amazonaws.com' &&
	!storageHostname.endsWith('.amazonaws.com') &&
	!storageHostname.endsWith('.pixelstack.cloud')
		? [
				{
					protocol: (process.env.NEXT_PUBLIC_STORAGE_URL?.startsWith('http:') ? 'http' : 'https') as 'http' | 'https',
					hostname: storageHostname,
					pathname: '/**',
				},
		  ]
		: []),
	...additionalImageHosts.map((hostname) => ({
		protocol: 'https' as const,
		hostname,
		pathname: '/**',
	})),
];

const nextConfig: NextConfig = {
	reactStrictMode: true,
	...(devOrigins.length > 0 ? { allowedDevOrigins: devOrigins } : {}),
	images: {
		unoptimized: true,
		remotePatterns,
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
		const isDev = process.env.NODE_ENV !== 'production';

		// Content Security Policy
		const cspDirectives = [
			"default-src 'self'",
			// Scripts: self, inline, eval (needed by Next.js client chunks / compiler / dev), and Unlayer Email Editor
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://editor.unlayer.com",
			// Styles: self, inline (needed by Tailwind CSS, React-Toastify, ApexCharts, TipTap), and Unlayer
			"style-src 'self' 'unsafe-inline' https://editor.unlayer.com",
			// Images: self, data URIs, blob URLs, HTTPS sources (S3 bucket, avatars, Cloudflare tunnels, Unlayer)
			"img-src 'self' data: blob: https: https://*.amazonaws.com https://*.pixelstack.cloud https://editor.unlayer.com",
			// Fonts: self, data URIs, and Google Fonts
			"font-src 'self' data: https://fonts.gstatic.com",
			// Connections: self, data, blob, APIs, WebSockets (ws/wss for Socket.IO), S3, Unlayer
			"connect-src 'self' data: blob: https: wss: ws: https://*.pixelstack.cloud https://*.amazonaws.com https://editor.unlayer.com",
			// Frames: self and Unlayer Email Editor
			"frame-src 'self' https://editor.unlayer.com",
			// Clickjacking protection: forbid embedding this admin dashboard anywhere
			"frame-ancestors 'none'",
			// Media and objects
			"media-src 'self' data: blob: https:",
			"object-src 'none'",
			"base-uri 'self'",
			"form-action 'self'",
		];

		const cspHeaderValue = cspDirectives.join('; ');

		const securityHeaders = [
			// Clickjacking protection for legacy browsers
			{
				key: 'X-Frame-Options',
				value: 'DENY',
			},
			// Prevent MIME-sniffing
			{
				key: 'X-Content-Type-Options',
				value: 'nosniff',
			},
			// Referrer Privacy
			{
				key: 'Referrer-Policy',
				value: 'strict-origin-when-cross-origin',
			},
			// Hardware & Browser Feature Permissions
			{
				key: 'Permissions-Policy',
				value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
			},
			// XSS Protection for older browsers
			{
				key: 'X-XSS-Protection',
				value: '1; mode=block',
			},
			// Content Security Policy
			{
				key: 'Content-Security-Policy',
				value: cspHeaderValue,
			},
			// HSTS (Strict-Transport-Security only in production to prevent localhost dev issues)
			...(!isDev
				? [
						{
							key: 'Strict-Transport-Security',
							value: 'max-age=63072000; includeSubDomains; preload',
						},
				  ]
				: []),
		];

		return [
			{
				source: '/:path*',
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
