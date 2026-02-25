import type { HeadRef } from '../../git/types'
import type { GraphLayoutData } from './graphTypes'
import { renderHeadBadge, renderLaneLabels, renderNodes } from './GraphCanvasNodes'

type GraphCanvasMainProps = {
  data: GraphLayoutData
  head: HeadRef
}

export function GraphCanvasMain({ data, head }: GraphCanvasMainProps) {
  return (
    <svg
      viewBox={`0 0 ${data.width} ${data.maxY}`}
      className="graph-canvas"
      preserveAspectRatio="xMinYMin meet"
      style={{ height: `max(100%, ${data.maxY}px)`, width: '100%', minWidth: `${data.width}px` }}
    >
      <rect x="0" y="0" width={data.width} height="28" fill="#f8fafc" />
      {renderLaneLabels({ data })}
      {data.edges.map((edge) => (
        <path
          key={edge.key}
          d={edge.d}
          className={edge.animated ? 'graph-edge graph-edge-animate' : 'graph-edge'}
          stroke={edge.stroke}
          fill="none"
          strokeWidth="2.2"
          pathLength={100}
          strokeDasharray={edge.strokeDash}
          style={{ animationDelay: `${edge.index * 80}ms` }}
        />
      ))}
      {renderNodes({ data })}
      {data.branchEntries.map(([name, commitId]) =>
        !commitId ? null : (
          <text
            key={`branch-${name}`}
            x={(data.positions.get(commitId)?.x ?? 0) + 28}
            y={(data.positions.get(commitId)?.y ?? 0) + 5}
            fill="#111"
            fontSize="14"
          >
            {name}
          </text>
        ),
      )}
      {renderHeadBadge({ data }, 'HEAD', head.commitId)}
    </svg>
  )
}
