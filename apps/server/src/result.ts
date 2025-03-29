export type AppResult<TData, TError> = readonly [never, TData] | readonly [TError, never]
export function ok<TData, TError>(data: TData): AppResult<TData, TError> {
  return [undefined as never, data] as const
}
export function err<TData, TError>(error: TError): AppResult<TData, TError> {
  return [error, undefined as never] as const
}
export function panic<TError extends { message: string }>(error: TError): void {
  console.error(error.message)
}

export async function fromPromise<TData, TError>(
  promise: Promise<TData>,
  errorHandler: (error: unknown) => TError
): Promise<AppResult<TData, TError>> {
  try {
    const data: Awaited<TData> = await promise
    return ok(data)
  } catch (error) {
    return err(errorHandler(error))
  }
}
export async function fromCallback<TData, TError>(
  callback: () => Promise<TData>,
  errorHandler: (error: unknown) => TError
): Promise<AppResult<TData, TError>> {
  try {
    const data: Awaited<TData> = await callback()
    return ok(data)
  } catch (error) {
    return err(errorHandler(error))
  }
}
