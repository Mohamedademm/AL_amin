import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Inbox } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { cn } from '../../lib/cn';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  sortValue?: (row: T) => string | number; // providing this makes the column sortable
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  pageSize?: number;
  search?: (row: T) => string; // text fed to the built-in search box
  searchPlaceholder?: string;
  toolbar?: ReactNode; // extra controls aligned with the search field
  emptyIcon?: ReactNode;
  emptyText?: string;
  externalQuery?: string;
  onExternalQueryChange?: (query: string) => void;
}

// Reusable data table: built-in search, column sorting, pagination,
// skeleton loading and empty state. Used across staff/admin lists.
export function DataTable<T>({
  data, columns, rowKey, loading = false, pageSize = 8,
  search, searchPlaceholder = 'Search…', toolbar, emptyIcon, emptyText = 'Nothing here yet.',
  externalQuery, onExternalQueryChange
}: DataTableProps<T>) {
  const [internalQuery, setInternalQuery] = useState('');
  const query = externalQuery !== undefined ? externalQuery : internalQuery;
  const setQuery = onExternalQueryChange || setInternalQuery;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !search) return data;
    return data.filter((r) => search(r).toLowerCase().includes(q));
  }, [data, query, search]);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const get = col.sortValue;
    return [...filtered].sort((a, b) => {
      const av = get(a), bv = get(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  useEffect(() => { setPage(1); }, [query, sortKey, sortDir, data.length]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (col: Column<T>) => {
    if (!col.sortValue) return;
    if (sortKey === col.key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(col.key); setSortDir('asc'); }
  };

  return (
    <div>
      {(search || toolbar) && (
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {search ? (
            <div className="relative w-full lg:w-72">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder} className="input-base pl-11" />
            </div>
          ) : <div />}
          {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-wider text-muted">
                {columns.map((col) => (
                  <th key={col.key} className={cn('px-5 py-3', col.align === 'right' && 'text-right')}>
                    {col.sortValue ? (
                      <button onClick={() => toggleSort(col)} className={cn('inline-flex items-center gap-1 hover:text-content', col.align === 'right' && 'flex-row-reverse')}>
                        {col.header}
                        {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                      </button>
                    ) : col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-line/60 last:border-0">
                      {columns.map((c) => <td key={c.key} className="px-5 py-3"><Skeleton className="h-4 w-full" /></td>)}
                    </tr>
                  ))
                : pageItems.map((row) => (
                    <tr key={rowKey(row)} className="border-b border-line/60 last:border-0 hover:bg-surface-2/50">
                      {columns.map((col) => (
                        <td key={col.key} className={cn('px-5 py-3', col.align === 'right' && 'text-right')}>{col.render(row)}</td>
                      ))}
                    </tr>
                  ))}
              {!loading && sorted.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-16 text-center text-muted">
                    <span className="mx-auto mb-2 block w-fit opacity-50">{emptyIcon ?? <Inbox size={32} />}</span>
                    {emptyText}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {sorted.length > pageSize && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
            <p className="text-muted">
              Showing <span className="text-content">{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)}</span> of {sorted.length}
            </p>
            <div className="flex items-center gap-2">
              <button disabled={safePage === 1} onClick={() => setPage((p) => p - 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:text-content disabled:opacity-40" aria-label="Previous"><ChevronLeft size={16} /></button>
              <span className="font-mono text-xs text-muted">{safePage} / {totalPages}</span>
              <button disabled={safePage === totalPages} onClick={() => setPage((p) => p + 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:text-content disabled:opacity-40" aria-label="Next"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
