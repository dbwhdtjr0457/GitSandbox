import type { CSSProperties } from 'react'
import type { GraphLayoutData, GraphNodePoint } from './graphTypes'

type CommonProps = {
  data: GraphLayoutData
}

function nodeCircle(point: GraphNodePoint, nodeIndex: number, isReachable: boolean) {
  const badgeText = isReachable ? null : 'dangling'
  const delayBase = `${nodeIndex * 60}ms`
  return (
    <g
      key={point.commit.id}
      className="graph-node graph-node-wrap"
      style={{ animationDelay: delayBase }}
    >
      <title>{`${point.commit.id}\n${point.commit.message}\nparents: ${point.commit.parents.join(', ') || 'none'}`}</title>
      <circle
        cx={point.x}
        cy={point.y}
        r="18"
        fill={isReachable ? '#3b82f6' : '#9ca3af'}
        stroke={isReachable ? '#2563eb' : '#6b7280'}
        strokeWidth="2.5"
        strokeDasharray={isReachable ? undefined : '6 4'}
        className="graph-node-circle"
        style={{ animationDelay: `${nodeIndex * 60 + 20}ms` }}
      />
      <text
        x={point.x}
        y={point.y + 6}
        textAnchor="middle"
        fill="#fff"
        fontSize="14"
        className="graph-node-id"
        style={{ animationDelay: `${nodeIndex * 60 + 30}ms` }}
      >
        {point.commit.id}
      </text>
      <text
        x={point.x - 30}
        y={point.y - 28}
        fill="#444"
        fontSize="13"
        className="graph-node-message"
        style={{ animationDelay: `${nodeIndex * 60 + 40}ms` }}
      >
        {point.commit.message}
      </text>
      {badgeText ? (
        <g className="graph-node-badge" style={{ animationDelay: `${nodeIndex * 60 + 50}ms` }}>
          <rect x={point.x - 30} y={point.y + 18} width="60" height="16" rx="8" fill="#4b5563" />
          <text x={point.x} y={point.y + 30} fill="#f9fafb" textAnchor="middle" fontSize="10" className="graph-node-badge-text">
            {badgeText}
          </text>
        </g>
      ) : null}
    </g>
  )
}

export function renderLaneLabels({ data }: CommonProps) {
  return data.branchesByLane.map(({ laneValue, names }) => {
    const index = data.laneIndexByValue.get(laneValue) ?? 0
    const x = data.baseX + index * data.laneGap
    const delay = index * 70
    if (names.length === 0) {
      return null
    }
    return (
      <g key={`lane-label-${laneValue}`}>
        <line
          x1={x}
          y1="28"
          x2={x}
          y2={data.maxY}
          stroke="#cbd5e1"
          strokeWidth="1.8"
          className="graph-lane-line"
          style={{ animationDelay: `${delay}ms` }}
        />
        <text
          x={x + 12}
          y={data.maxY - 8}
          fill="#334155"
          fontSize="12"
          textAnchor="start"
          className="graph-lane-text"
          style={{ animationDelay: `${delay + 100}ms` }}
        >
          {names.join(', ')}
        </text>
      </g>
    )
  })
}

export function renderNodes({ data }: CommonProps) {
  return data.nodes.map((commit, index) => {
    const point = data.positions.get(commit.id)
    if (!point) {
      return null
    }
    return nodeCircle(point, index, data.reachableCommits.has(commit.id))
  })
}

export function renderHeadBadge({ data }: CommonProps, headText: string, headCommitId: string | null) {
  if (!headCommitId) {
    return null
  }

  const point = data.positions.get(headCommitId)
  if (!point) {
    return null
  }

  const headX = point.x - 25
  const headY = point.y + 6

  return (
    <g
      key="head"
      className="graph-head-badge-move"
      style={
        {
          animationDelay: `${Math.min(1200, data.nodes.length * 60)}ms`,
          '--head-x': `${headX}px`,
          '--head-y': `${headY}px`,
        } as CSSProperties & { '--head-x': string; '--head-y': string }
      }
    >
      <rect
        x="0"
        y="0"
        width="50"
        height="20"
        rx="8"
        fill="#16a34a"
        className="graph-head-badge"
      />
      <text
        x="25"
        y="16"
        fill="#fff"
        textAnchor="middle"
        fontSize="12"
        className="graph-head-text"
      >
        {headText}
      </text>
    </g>
  )
}
