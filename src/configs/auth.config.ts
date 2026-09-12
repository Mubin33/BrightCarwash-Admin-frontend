export const AUTH_CONFIG = {
	MOCK_CREDENTIALS: {
		email: 'admin@email.com',
		password: 'Admin@123!',
	},
	MOCK_OTP: '123456',
	ACCESS_TOKEN_MAX_AGE: 7 * 24 * 60 * 60,
	REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60,
	ACCESS_TOKEN_COOKIE: 'accessToken',
	REFRESH_TOKEN_COOKIE: 'refreshToken',
} as const;

export const PASSWORD_RULES = {
	minLength: 8,
	requireUppercase: true,
	requireLowercase: true,
	requireNumber: true,
	requireSpecial: true,
} as const;
