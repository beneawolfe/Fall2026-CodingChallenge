// Friendly placeholder for screens with nothing to show yet.
// Reused across the app (boards, search results, notifications, etc.).

import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode; // optional call-to-action button
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 1.5,
        py: { xs: 6, sm: 10 },
        px: 2,
        color: 'text.secondary',
        '& > svg': { fontSize: 64, color: 'primary.main', opacity: 0.8 },
      }}
    >
      {icon}
      <Typography variant="h6" color="text.primary">
        {title}
      </Typography>
      <Typography sx={{ maxWidth: 420 }}>{message}</Typography>
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
}