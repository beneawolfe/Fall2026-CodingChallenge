// Client-side form validation. These rules mirror the backend's rules
// (server/src/controllers/auth.controller.ts) so users get instant feedback,
// but the server still validates everything itself.
// Each function returns an error message, or null when the value is valid.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Email is required';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address';
  return null;
}

export function validateUsername(value: string): string | null {
  const username = value.trim();
  if (!username) return 'Username is required';
  if (!USERNAME_PATTERN.test(username)) {
    return 'Use 3-30 letters, numbers, or underscores';
  }
  return null;
}

export function validateNewPassword(value: string): string | null {
  if (!value) return 'Password is required';
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return 'Please confirm your password';
  if (confirm !== password) return 'Passwords do not match';
  return null;
}