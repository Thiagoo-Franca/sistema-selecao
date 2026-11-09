import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"

export function useQueryParamState<T>(param: string, initialState: T) {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get(param)

  const value = useMemo<T>(() => {
    if (raw === null) return initialState
    try {
      return JSON.parse(raw) as T
    } catch {
      return initialState
    }
  }, [raw, initialState])

  const setValue = useCallback(
    (next: T) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          if (next === null || next === "" || next === initialState) params.delete(param)
          else params.set(param, JSON.stringify(next))
          return params
        },
        { replace: true }
      )
    },
    [param, initialState, setSearchParams]
  )

  return [value, setValue] as const
}
