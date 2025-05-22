// components/TableSkeleton.tsx
type SkeletonProps = {
  rows: number
  columns: number
}

export default function TableSkeleton({ rows, columns }: SkeletonProps) {
  return (
    <div className="w-full animate-pulse">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="p-4">
            <tr>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <th key={colIndex} className="px-4 py-4 text-left text-sm font-medium bg-muted/40">
                  <div className="h-4 bg-accent rounded w-3/4"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b bg-muted/40">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="p-4">
                    <div className="p-4 h-4 bg-accent rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
