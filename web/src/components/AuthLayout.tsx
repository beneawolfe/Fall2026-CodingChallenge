// Shared page frame for the login and register screens:
// full-height gradient background, brand mark, and a centered card.

import type { ReactNode } from 'react';
import { Box, Card, Typography } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode; // the form
  footer: ReactNode; // e.g. "Don't have an account? Register"
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #fde8ef 0%, #f7f5f2 45%, #e7ecfd 100%)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 3 }}>
          <PushPinIcon color="primary" fontSize="large" />
          <Typography variant="h5" component="span">
            Change
            <Box component="span" sx={{ color: 'primary.main' }}>
              ++
            </Box>
          </Typography>
        </Box>

        <Card sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
          {children}
        </Card>

        <Box sx={{ textAlign: 'center', mt: 2 }}>{footer}</Box>
      </Box>
    </Box>
  );
}