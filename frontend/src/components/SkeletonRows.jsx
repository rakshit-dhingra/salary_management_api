export function SkeletonRows({ cols = 6, rows = 7 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j}>
          <div
            className="skeleton"
            style={{ height: 13, width: `${55 + ((i * j * 7) % 35)}%` }}
          />
        </td>
      ))}
    </tr>
  ))
}