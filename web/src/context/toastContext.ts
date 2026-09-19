// Defines the toast context. The provider component is in ToastProvider.tsx
// and the hook is in hooks/useToast.ts (kept separate for React fast-refresh).

import { createContext } from 'react';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

export interface ToastContextValue {
  showToast: (message: string, severity?: ToastSeverity) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);