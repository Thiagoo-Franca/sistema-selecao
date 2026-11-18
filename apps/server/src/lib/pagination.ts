import { z } from "zod";
import { asc, desc, type SQL, type Column } from "drizzle-orm";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional().transform((v) => (v === "" ? undefined : v)),
  sortBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): Paginated<never>["meta"] {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function createSortBySchema<T extends string>(allowedColumns: [T, ...T[]]) {
  return z.enum(allowedColumns).optional();
}

export function mapSortByToColumn(
  sortBy: string | undefined,
  columnMap: Record<string, Column>,
  defaultColumn: Column,
): Column {
  if (sortBy && sortBy in columnMap) {
    return columnMap[sortBy];
  }
  return defaultColumn;
}

export function applyOrderBy(
  column: Column,
  order: "asc" | "desc",
  tieBreaker: Column,
): SQL<unknown>[] {
  return order === "desc" ? [desc(column), asc(tieBreaker)] : [asc(column), asc(tieBreaker)];
}