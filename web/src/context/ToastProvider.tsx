// Shows short messages ("Board created", error messages, etc.) in a snackbar
// at the bottom of the screen. Any component can trigger one via useToast().

import { useCallback, useMemo, useState } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { ToastContext } from './toastContext';
import type { ToastContextValue, ToastSeverity } from './toastContext';

interface ToastState {
  message: string;
  severity: ToastSeverity;
  key: number; // changes for every toast so a new one restarts the timer
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [open, setOpen] = useState(false);

  const showToast = useCallback((message: string, severity: ToastSeverity = 'info') => {
    setToast({ message, severity, key: Date.now() });
    setOpen(true);
  }, []);

  function handleClose(_event?: SyntheticEvent | Event, reason?: string) {
    if (reason === 'clickaway') return; // don't dismiss when the user clicks elsewhere
    setOpen(false);
  }

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.key}
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={toast?.severity ?? 'info'} variant="filled" sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}