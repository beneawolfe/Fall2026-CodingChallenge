// Password input with a show/hide toggle. Used by both auth forms.

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error: string | null; // message to show, or null when valid
  helperText?: string; // hint shown when there's no error
  autoComplete: 'current-password' | 'new-password';
  disabled?: boolean;
}

export default function PasswordField({
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  autoComplete,
  disabled,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      label={label}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      onBlur={onBlur}
      error={error !== null}
      helperText={error ?? helperText ?? ' '}
      autoComplete={autoComplete}
      disabled={disabled}
      fullWidth
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible((v) => !v)}
                edge="end"
              >
                {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}