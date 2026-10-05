import type { UseQueryResult } from '@tanstack/react-query';

/** Renders children once a query has data; shows loading and error states otherwise. */
export function Loader<T>({ query, children }: { query: UseQueryResult<T>; children: (data: T) => React.ReactNode }) {
  if (query.isPending) return <div className="card card-pad tiny" role="status">Loading…</div>;
  if (query.isError) return <div className="card card-pad text-[13px]" role="alert">This could not be loaded. {query.error.message}</div>;
  return <>{children(query.data)}</>;
}
