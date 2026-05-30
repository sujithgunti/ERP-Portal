'use client';

import { useCallback, useEffect, useState } from 'react';
import { prismaApi, ApiError, type HttpMethod } from '@/lib/api';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Client data-fetching hook over `prismaApi`. Fetches on mount (and when
 * method/path change), exposes `refetch` for after mutations.
 */
export function useApi<T>(method: HttpMethod, path: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await prismaApi<T>(method, path));
    } catch (e) {
      // 401 already redirects inside prismaApi; surface other errors.
      if (!(e instanceof ApiError && e.status === 401)) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      }
    } finally {
      setLoading(false);
    }
  }, [method, path]);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
}
