// ============================================================
// Pagination, Filtering & Sorting Helper
// ============================================================
// Reusable utility for all list endpoints. Parses query params
// into Mongoose-compatible options and builds paginated responses.
// See: Doc 06 §5
// ============================================================

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  sort?: string;
  [key: string]: unknown;
}

export interface PaginationOptions {
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
  filter: Record<string, unknown>;
  page: number;
}

export interface PaginatedMeta {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

const RESERVED_KEYS = ['page', 'limit', 'sort'];
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

/**
 * Parse raw query params into structured pagination options.
 */
export function parsePaginationQuery(query: PaginationQuery): PaginationOptions {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(String(query.limit || DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  // Parse sort: "-createdAt,name" → { createdAt: -1, name: 1 }
  const sort: Record<string, 1 | -1> = {};
  if (query.sort && typeof query.sort === 'string') {
    query.sort.split(',').forEach((field) => {
      const trimmed = field.trim();
      if (trimmed.startsWith('-')) {
        sort[trimmed.slice(1)] = -1;
      } else {
        sort[trimmed] = 1;
      }
    });
  }
  if (Object.keys(sort).length === 0) {
    sort['createdAt'] = -1; // Default: newest first
  }

  // Parse filter: everything that's not page/limit/sort
  const filter: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query)) {
    if (RESERVED_KEYS.includes(key) || value === undefined || value === '') continue;
    filter[key] = value;
  }

  return { skip, limit, sort, filter, page };
}

/**
 * Build the pagination meta object for the response envelope.
 */
export function buildPaginatedMeta(total: number, page: number, limit: number): PaginatedMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
}
