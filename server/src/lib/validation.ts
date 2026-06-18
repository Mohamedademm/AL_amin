import { AppError } from '../middleware/errorHandler';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Reject malformed emails before they reach the database.
export function assertEmail(email: string) {
  if (!EMAIL_RE.test(email)) throw new AppError('A valid email address is required', 400);
}

// Enforce a minimum password strength (≥8 chars, at least one letter + one digit).
export function assertPasswordStrength(password: string) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError('Password must contain at least one letter and one number', 400);
  }
}
