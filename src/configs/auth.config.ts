export const AUTH_CONFIG = {
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
export function getPasswordValidationError(password: string): string | null {
	if (!password || password.length < PASSWORD_RULES.minLength) {
		return `Password must be at least ${PASSWORD_RULES.minLength} characters`;
	}
	if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
		return 'Password must contain at least one uppercase letter';
	}
	if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
		return 'Password must contain at least one lowercase letter';
	}
	if (PASSWORD_RULES.requireNumber && !/[0-9]/.test(password)) {
		return 'Password must contain at least one number';
	}
	if (
		PASSWORD_RULES.requireSpecial &&
		!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?~`]/.test(password)
	) {
		return 'Password must contain at least one special character';
	}
	return null;
}

export function validatePassword(password: string): boolean {
	return getPasswordValidationError(password) === null;
}
