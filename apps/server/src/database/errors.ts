type DrizzleError = {
  code?: string;
  constraint?: string;
};

export type DatabaseError = {
  type: "database_error";
  error: unknown;
};

export const databaseError = <TData = never>(
  error: unknown,
): AppResult<TData, DatabaseError> => err({ type: "database_error", error });

export const logDatabaseError = (context: string, error: unknown): void => {
  const details = error as DrizzleError;
  console.error(context, {
    code: details.code ?? "unknown",
    constraint: details.constraint ?? "unknown",
  });
};
import { err, type AppResult } from "../result.js";
