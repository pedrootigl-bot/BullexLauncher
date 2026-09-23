import { useCallback, useEffect, useRef, useState } from 'react'
import { toErrorMessage } from '../api/errors'

type ResourceState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Carrega um recurso assíncrono (serviço → API ou mock).
 */
export function useResource<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = [],
): ResourceState<T> & { reload: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const reload = useCallback(() => setTick((n) => n + 1), [])
  const depsKey = JSON.stringify(deps)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    void loaderRef.current()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(toErrorMessage(err))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tick, depsKey])

  return { data, loading, error, reload }
}
