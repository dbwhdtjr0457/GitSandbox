import type { HeadRef } from '../../git/types'
import type { GraphLayoutData } from './graphTypes'
import { renderHeadBadge, renderLaneLabels, renderNodes } from './GraphCanvasNodes'

type GraphCanvasMainProps = {
  data: GraphLayoutData
  head: HeadRef
}

export function GraphCanvasMain({ data, head }: GraphCanvasMainProps) {
  const branchLabelsByCommit = new Map<string, string[]>()

  data.branchEntries.forEach(([name, commitId]) => {
    if (!commitId) {
      return
    }
    const list = branchLabelsByCommit.get(commitId)
    if (list) {
      list.push(name)
    } else {
      branchLabelsByCommit.set(commitId, [name])
    }
  })

  return (
    <svg
      viewBox={`0 0 ${data.width} ${data.maxY}`}
      className="graph-canvas"
      preserveAspectRatio="xMinYMin meet"
      style={{ height: `max(100%, ${data.maxY}px)`, width: '100%', minWidth: `${data.width}px` }}
    >
      <g className="graph-legend">
        <rect x="8" y="4" width="300" height="18" rx="9" fill="#ffffff" fillOpacity="0.92" stroke="#d1d5db" />
        <text x="16" y="17" fontSize="11" fill="#334155">
          노드: 커밋 • 위 텍스트: 메시지 • 오른쪽: 브랜치 • 초록: HEAD
        </text>
      </g>
      <rect x="0" y="0" width={data.width} height="28" fill="#f8fafc" />
      {renderLaneLabels({ data })}
      {data.edges.map((edge) => (
        <path
          key={edge.key}
          d={edge.d}
          className={edge.animated ? 'graph-edge graph-edge-enter graph-edge-animate' : 'graph-edge graph-edge-enter'}
          stroke={edge.stroke}
          fill="none"
          strokeWidth="2.2"
          pathLength={100}
          strokeDasharray={edge.strokeDash}
          style={{ animationDelay: `${edge.index * 80}ms` }}
        />
      ))}
      {renderNodes({ data })}
      {Array.from(branchLabelsByCommit.entries()).map(([commitId, names], index) => {
        const point = data.positions.get(commitId)
        if (!point) {
          return null
        }
        return names.map((name, nameIndex) => (
          <g
            key={`branch-${commitId}-${name}`}
            className="graph-branch-pill-wrap"
            style={{ animationDelay: `${index * 90 + nameIndex * 25}ms` }}
          >
            <line
              x1={point.x + 18}
              y1={point.y + 4 + nameIndex * 16}
              x2={point.x + 24}
              y2={point.y + 4 + nameIndex * 16}
              className="graph-branch-connector"
            />
            <rect
              x={point.x + 28}
              y={point.y - 7 + nameIndex * 16}
              width="120"
              height="16"
              rx="8"
              className="graph-branch-pill"
            />
            <text
              x={point.x + 36}
              y={point.y + 4 + nameIndex * 16}
              fill="#111"
              fontSize="11.5"
              className="graph-branch-label"
            >
              branch: {name}
            </text>
          </g>
        ))
      })}
      {renderHeadBadge({ data }, 'HEAD', head.commitId)}
    </svg>
  )
}
