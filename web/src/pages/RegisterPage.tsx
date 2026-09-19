// Registration screen: email, username, password, and confirm password.
// Validation mirrors the backend rules. Server errors (for example an email
// that's already taken) appear in an alert. On success the user is logged in
// automatically and the GuestOnly guard redirects to the home page.

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Link, TextField, Typography } from '@mui/material';
import AuthLayout from '../components/AuthLayout';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../hooks/useAuth';
import {
  validateConfirmPassword,
  validateEmail,
  validateNewPassword,
  validateUsername,
} from '../utils/validation';

type Field = 'email' | 'username' | 'password' | 'confirm';

const EMPTY_TOUCHED: Record<Field, boolean> = {
  email: false,
  username: false,
  password: false,
  confirm: false,
};

export default function RegisterPage() {
  const { register } = useAuth();
  const [values, setValues] = useState({ email: '', username: '', password: '', confirm: '' });
  const [touched, setTouched] = useState<Record<Field, boolean>>(EMPTY_TOUCHED);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Errors are derived from the current values on every render (no effect needed)
  const errors: Record<Field, string | null> = {
    email: validateEmail(values.email),
    username: validateUsername(values.username),
    password: validateNewPassword(values.password),
    confirm: validateConfirmPassword(values.password, values.confirm),
  };

  // Only display an error once the user has touched the field or tried to submit
  const visibleError = (field: Field) => (touched[field] || submitted ? errors[field] : null);

  function update(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function markTouched(field: Field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setServerError(null);

    if (Object.values(errors).some((message) => message !== null)) return;

    setSubmitting(true);
    try {
      await register(values.email.trim(), values.username.trim(), values.password);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Save images to boards and collaborate with friends."
      footer={
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
            Log in
          </Link>
        </Typography>
      }
    >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'grid', gap: 0.5 }}>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          onBlur={() => markTouched('email')}
          error={visibleError('email') !== null}
          helperText={visibleError('email') ?? ' '}
          autoComplete="email"
          autoFocus
          disabled={submitting}
          fullWidth
        />

        <TextField
          label="Username"
          value={values.username}
          onChange={(e) => update('username', e.target.value)}
          onBlur={() => markTouched('username')}
          error={visibleError('username') !== null}
          helperText={visibleError('username') ?? '3-30 letters, numbers, or underscores'}
          autoComplete="username"
          disabled={submitting}
          fullWidth
        />

        <PasswordField
          label="Password"
          value={values.password}
          onChange={(value) => update('password', value)}
          onBlur={() => markTouched('password')}
          error={visibleError('password')}
          helperText="At least 8 characters"
          autoComplete="new-password"
          disabled={submitting}
        />

        <PasswordField
          label="Confirm password"
          value={values.confirm}
          onChange={(value) => update('confirm', value)}
          onBlur={() => markTouched('confirm')}
          error={visibleError('confirm')}
          autoComplete="new-password"
          disabled={submitting}
        />

        <Button type="submit" variant="contained" size="large" disabled={submitting} sx={{ mt: 1 }}>
          {submitting ? <CircularProgress size={24} color="inherit" /> : 'Create account'}
        </Button>
      </Box>
    </AuthLayout>
  );
}