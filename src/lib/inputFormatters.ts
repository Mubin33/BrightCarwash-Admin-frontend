/**
 * Formats a raw digit string into US phone format: (XXX) XXX-XXXX
 * Always assumes +1 country code (not stored in the visible input).
 */
export function formatUSPhoneNumber(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 10);

    const len = digits.length;

    if (len === 0) return "";
    if (len < 4) return `(${digits}`;
    if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Strips formatting and returns raw 10-digit string (no +1, no symbols).
 */
export function getRawPhoneDigits(formatted: string): string {
    return formatted.replace(/\D/g, "").slice(0, 10);
}

/**
 * Returns the full format to send to backend: +1XXXXXXXXXX
 */
export function toBackendPhoneFormat(formatted: string): string {
    const digits = getRawPhoneDigits(formatted);
    return digits ? `+1${digits}` : "";
}

/**
 * For pre-filling the input from a backend value like "+1XXXXXXXXXX" or "XXXXXXXXXX".
 */
export function fromBackendPhoneFormat(backendValue: string): string {
    if (!backendValue) return "";
    const digits = backendValue.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
    return formatUSPhoneNumber(digits);
}

/**
 * Allows only letters, spaces, hyphens, and apostrophes (for names like O'Brien, Anne-Marie).
 */
export function sanitizeNameInput(value: string): string {
    return value.replace(/[^a-zA-Z\s'-]/g, "");
}