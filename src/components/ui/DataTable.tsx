'use client';

import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string | ReactNode;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  className = '',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[#777980] font-inter text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#F1F1F1]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2.5 px-4 text-left text-[#777980] font-inter text-xs font-medium uppercase tracking-wider border-r border-[#E8E8E9] last:border-r-0 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const rowId = rowKey(row);

            return (
              <tr
                key={rowId}
                className="border-t border-[#E8E8E9] bg-white transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={`${rowId}-${col.key}`}
                    className={`py-2.5 px-4 border-r border-[#E8E8E9] last:border-r-0 ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}