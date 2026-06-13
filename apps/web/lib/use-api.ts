'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { prismaApi, ApiError, type HttpMethod } from '@/lib/api';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Client data-fetching hook over `prismaApi` with a module-level cache.
 *
 * Cache-first: the first call for a (method + path) fetches and caches; later
 * mounts of the same key render the cached data WITHOUT a new API call. Call
 * `refetch()` (e.g. after a mutation) to force a fresh fetch and update the
 * cache — any other view reading the same key picks it up on its next mount.
 */
const cache = new Map<string, unknown>();

export function useApi<T>(method: HttpMethod, path: string): UseApiResult<T> {
  const key = `${method} ${path}`;
  const cached = cache.has(key) ? (cache.get(key) as T) : null;

  const [data, setData] = useState<T | null>(cached);
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef(key);
  keyRef.current = key;

  const run = useCallback(
    async (force: boolean) => {
      // Serve from cache without hitting the API.
      if (!force && cache.has(key)) {
        setData(cache.get(key) as T);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await prismaApi<T>(method, path);
        cache.set(key, result);
        // Guard against a race if the key changed mid-flight.
        if (keyRef.current === key) setData(result);
      } catch (e) {
        if (!(e instanceof ApiError && e.status === 401)) {
          setError(e instanceof Error ? e.message : 'Failed to load');
        }
      } finally {
        if (keyRef.current === key) setLoading(false);
      }
    },
    [method, path, key],
  );

  useEffect(() => {
    run(false);
  }, [run]);

  return { data, loading, error, refetch: () => run(true) };
}
