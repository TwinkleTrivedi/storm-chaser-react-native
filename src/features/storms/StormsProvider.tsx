import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { listStorms } from '@/features/storms/storm.repository';
import { createStorm, removeStorm, retryStormSync } from '@/features/storms/storm.service';
import type { StormDraft, StormRecord } from '@/features/storms/storm.types';
import { toAppError } from '@/utils/errors';

type StormsContextValue = {
  storms: StormRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (draft: StormDraft) => Promise<StormRecord>;
  remove: (id: string) => Promise<void>;
  retrySync: (id: string) => Promise<StormRecord>;
  find: (id: string) => StormRecord | undefined;
};

const StormsContext = createContext<StormsContextValue | null>(null);

export function StormsProvider({ children }: { children: ReactNode }) {
  const [storms, setStorms] = useState<StormRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await listStorms();
      setStorms(next);
      setError(null);
    } catch (caught) {
      setError(toAppError(caught).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (draft: StormDraft) => {
    const record = await createStorm(draft);
    setStorms((current) => [record, ...current.filter((storm) => storm.id !== record.id)]);
    return record;
  }, []);

  const remove = useCallback(async (id: string) => {
    await removeStorm(id);
    setStorms((current) => current.filter((storm) => storm.id !== id));
  }, []);

  const retrySync = useCallback(async (id: string) => {
    const record = await retryStormSync(id);
    setStorms((current) => current.map((storm) => (storm.id === id ? record : storm)));
    return record;
  }, []);

  const find = useCallback((id: string) => storms.find((storm) => storm.id === id), [storms]);

  const value = useMemo<StormsContextValue>(
    () => ({ storms, loading, error, refresh, save, remove, retrySync, find }),
    [storms, loading, error, refresh, save, remove, retrySync, find],
  );

  return <StormsContext.Provider value={value}>{children}</StormsContext.Provider>;
}

export function useStorms(): StormsContextValue {
  const value = useContext(StormsContext);
  if (!value) {
    throw new Error('useStorms must be used within StormsProvider');
  }
  return value;
}
