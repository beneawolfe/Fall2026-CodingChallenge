// Login screen: validates on blur/submit, shows server errors in an alert,
// and disables the form while the request is in flight.
// Once login succeeds, the GuestOnly route guard redirects to the home page.

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Link, TextField, Typography } from '@mui/material';
import AuthLayout from '../components/AuthLayout';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '../utils/validation';

type Field = 'email' | 'password';

export default function LoginPage() {
  const { login } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState<Record<Field, boolean>>({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Errors are derived from the current values on every render (no effect needed)
  const errors: Record<Field, string | null> = {
    email: validateEmail(values.email),
    // Login only requires a non-empty password; the server checks correctness
    password: values.password ? null : 'Password is required',
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

    if (errors.email || errors.password) return;

    setSubmitting(true);
    try {
      await login(values.email.trim(), values.password);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your boards."
      footer={
        <Typography variant="body2" color="text.secondary">
          New here?{' '}
          <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 600 }}>
            Create an account
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

        <PasswordField
          label="Password"
          value={values.password}
          onChange={(value) => update('password', value)}
          onBlur={() => markTouched('password')}
          error={visibleError('password')}
          autoComplete="current-password"
          disabled={submitting}
        />

        <Button type="submit" variant="contained" size="large" disabled={submitting} sx={{ mt: 1 }}>
          {submitting ? <CircularProgress size={24} color="inherit" /> : 'Log in'}
        </Button>
      </Box>
    </AuthLayout>
  );
}