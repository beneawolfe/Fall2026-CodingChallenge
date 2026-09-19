// TEMPORARY placeholder. The real registration form is built in Step 3.

import { Link as RouterLink } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';

export default function RegisterPage() {
  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <Typography sx={{ mb: 2 }}>The registration form is coming in Step 3.</Typography>
      <Button component={RouterLink} to="/login">
        Back to log in
      </Button>
    </Container>
  );
}