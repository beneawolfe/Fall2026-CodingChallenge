// Gray placeholder card shown while boards are loading.

import { Card, CardContent, Skeleton } from '@mui/material';

export default function BoardCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={160} animation="wave" />
      <CardContent>
        <Skeleton width="70%" height={32} animation="wave" />
        <Skeleton width="100%" animation="wave" />
        <Skeleton width="60%" animation="wave" />
        <Skeleton width="40%" height={28} animation="wave" sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}