import type { GraphLayoutData } from './graphTypes'

type GraphCanvasEmptyProps = {
  data: Pick<GraphLayoutData, 'branchEntries' | 'branchesByLane' | 'laneIndexByValue' | 'width' | 'baseX' | 'laneGap' | 'sidePadding'>
}

export function GraphCanvasEmpty({ data }: GraphCanvasEmptyProps) {
  const hasBranches = data.branchEntries.length > 0

  return (
    <svg
      viewBox={`0 0 ${data.width} 180`}
      className="graph-canvas"
      preserveAspectRatio="xMidYMid meet"
      style={{ height: `max(100%, 180px)`, width: '100%', minWidth: `${data.width}px` }}
    >
      <rect x="0" y="0" width={data.width} height="28" fill="#f8fafc" />
      {data.branchesByLane.map(({ laneValue, names }) => {
        const index = data.laneIndexByValue.get(laneValue) ?? 0
        const x = data.baseX + index * data.laneGap
        const delay = index * 70
        if (names.length === 0) {
          return null
        }
        return (
          <g key={`lane-label-empty-${laneValue}`} className="graph-empty-lane" style={{ animationDelay: `${delay}ms` }}>
            <line
              x1={x}
              y1="28"
              x2={x}
              y2="180"
              stroke="#cbd5e1"
              strokeWidth="1.8"
              className="graph-lane-line"
            />
            <text
              x={x + 12}
              y="170"
              fill="#334155"
              fontSize="12"
              textAnchor="start"
              className="graph-lane-text"
              style={{ animationDelay: `${delay + 80}ms` }}
            >
              {names.join(', ')}
            </text>
          </g>
        )
      })}
      <text x="20" y="28" fill="#777" fontSize="14" className="graph-empty-msg" style={{ animationDelay: '120ms' }}>
        No commits yet
      </text>
      {!hasBranches ? (
        <text x="20" y="76" fill="#777" fontSize="14" className="graph-empty-guide" style={{ animationDelay: '180ms' }}>
          <tspan x="20" y="54" className="graph-empty-guide-line">
            Initialize repo and commit
          </tspan>
          <tspan x="20" y="70" className="graph-empty-guide-line" style={{ animationDelay: '220ms' }}>
            to start graph
          </tspan>
        </text>
      ) : null}
    </svg>
  )
}
