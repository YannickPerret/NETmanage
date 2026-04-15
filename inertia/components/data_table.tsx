import type { ReactNode } from 'react'

export type DataTableColumn<T> = {
  key: string
  header: ReactNode
  width?: number | string
  align?: 'left' | 'center' | 'right'
  render: (row: T) => ReactNode
}

export default function DataTable<T>({
  rows,
  columns,
  emptyLabel,
  getRowKey,
  getRowId,
  className,
}: {
  rows: T[]
  columns: DataTableColumn<T>[]
  emptyLabel: string
  getRowKey: (row: T) => string | number
  getRowId?: (row: T) => string | undefined
  className?: string
}) {
  if (rows.length === 0) {
    return <p className="muted" style={{ padding: '16px 4px' }}>{emptyLabel}</p>
  }

  return (
    <table className={`tickets-table ${className ?? ''}`.trim()}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              style={{
                width: column.width,
                textAlign: column.align ?? 'left',
              }}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)} id={getRowId?.(row)}>
            {columns.map((column) => (
              <td key={column.key} style={{ textAlign: column.align ?? 'left' }}>
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
