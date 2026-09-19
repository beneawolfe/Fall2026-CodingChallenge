// Shown for any URL that doesn't match a route.

import { Link as RouterLink } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        Page not found
      </Typography>
      <Typography sx={{ mb: 3 }}>The page you're looking for doesn't exist.</Typography>
      <Button variant="contained" component={RouterLink} to="/">
        Go home
      </Button>
    </Container>
  );
}