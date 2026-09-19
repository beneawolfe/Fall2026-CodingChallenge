// Centered loading indicator shown while the app verifies a stored login.

import { Box, CircularProgress } from '@mui/material';

export default function FullPageSpinner() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}