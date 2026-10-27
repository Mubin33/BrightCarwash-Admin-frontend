import { describe, it, expect } from 'vitest';
import { PASSWORD_RULES, getPasswordValidationError, validatePassword } from './auth.config';

describe('Password Policy Validation (VAL-002)', () => {
  it('rejects passwords shorter than minLength (8 characters)', () => {
    expect(getPasswordValidationError('Ab1!')).toBe('Password must be at least 8 characters');
    expect(PASSWORD_RULES.minLength).toBe(8);
    expect(validatePassword('Ab1!')).toBe(false);
  });

  it('rejects passwords missing uppercase letter', () => {
    expect(getPasswordValidationError('password123!')).toBe('Password must contain at least one uppercase letter');
    expect(validatePassword('password123!')).toBe(false);
  });

  it('rejects passwords missing lowercase letter', () => {
    expect(getPasswordValidationError('PASSWORD123!')).toBe('Password must contain at least one lowercase letter');
    expect(validatePassword('PASSWORD123!')).toBe(false);
  });

  it('rejects passwords missing a number', () => {
    expect(getPasswordValidationError('Password!@#')).toBe('Password must contain at least one number');
    expect(validatePassword('Password!@#')).toBe(false);
  });

  it('rejects passwords missing a special character', () => {
    expect(getPasswordValidationError('Password123')).toBe('Password must contain at least one special character');
    expect(validatePassword('Password123')).toBe(false);
  });

  it('accepts compliant passwords that fulfill all PASSWORD_RULES', () => {
    expect(getPasswordValidationError('Admin@1234')).toBeNull();
    expect(validatePassword('Admin@1234')).toBe(true);
    expect(validatePassword('BrightSide#2026')).toBe(true);
  });
});
