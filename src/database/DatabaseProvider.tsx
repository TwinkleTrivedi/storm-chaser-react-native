import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { getDatabase } from '@/database/database';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { StormsProvider } from '@/features/storms/StormsProvider';
import { toAppError } from '@/utils/errors';

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);

  const boot = useCallback(() => {
    setStatus('loading');
    setMessage(null);
    getDatabase()
      .then(() => setStatus('ready'))
      .catch((error: unknown) => {
        setMessage(toAppError(error).message);
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    boot();
  }, [boot]);

  if (status === 'loading') {
    return <LoadingSkeleton variant="weather" />;
  }

  if (status === 'error') {
    return (
      <EmptyState
        title="Storage unavailable"
        message={message ?? 'Storm reports could not be opened on this device.'}
        actionLabel="Try again"
        onAction={boot}
      />
    );
  }

  return <StormsProvider>{children}</StormsProvider>;
}
