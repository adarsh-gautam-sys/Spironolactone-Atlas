import { useEffect, useState } from 'react';
export interface JsonResource<T> {
  data: T | null;
  error: string | null;
  retry: () => void;
}
export function useJson<T>(name: string): JsonResource<T> {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    data: T | null;
    error: string | null;
  }>({ data: null, error: null });
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/${name}.json`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`Dataset returned HTTP ${response.status}`);
        const json: unknown = await response.json();
        if (!json || typeof json !== 'object' || !('schemaVersion' in json))
          throw new Error('Dataset format was not recognised');
        return json as T;
      })
      .then((data) => setResult({ data, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setResult({
            data: null,
            error:
              error instanceof Error
                ? error.message
                : 'Dataset could not be read',
          });
      });
    return () => controller.abort();
  }, [name, attempt]);
  return {
    ...result,
    retry: () => {
      setResult({ data: null, error: null });
      setAttempt((value) => value + 1);
    },
  };
}
