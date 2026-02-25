import type { GraphLayoutData, GraphNodePoint } from './graphTypes'

type CommonProps = {
  data: GraphLayoutData
}

function nodeCircle(point: GraphNodePoint, nodeIndex: number, isReachable: boolean) {
  const badgeText = isReachable ? null : 'dangling'
  return (
    <g key={point.commit.id} className="graph-node" style={{ animationDelay: `${nodeIndex * 60}ms` }}>
      <circle
        cx={point.x}
        cy={point.y}
        r="18"
        fill={isReachable ? '#3b82f6' : '#9ca3af'}
        stroke={isReachable ? '#2563eb' : '#6b7280'}
        strokeWidth="2.5"
        strokeDasharray={isReachable ? undefined : '6 4'}
      />
      <text x={point.x} y={point.y + 6} textAnchor="middle" fill="#fff" fontSize="14">
        {point.commit.id}
      </text>
      <text x={point.x - 30} y={point.y - 28} fill="#444" fontSize="13">
        {point.commit.message}
      </text>
      {badgeText ? (
        <g>
          <rect x={point.x - 30} y={point.y + 18} width="60" height="16" rx="8" fill="#4b5563" />
          <text x={point.x} y={point.y + 30} fill="#f9fafb" textAnchor="middle" fontSize="10">
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
    if (names.length === 0) {
      return null
    }
    return (
      <g key={`lane-label-${laneValue}`}>
        <line x1={x} y1="28" x2={x} y2={data.maxY} stroke="#cbd5e1" strokeWidth="1.8" />
        <text x={x + 12} y={data.maxY - 8} fill="#334155" fontSize="12" textAnchor="start">
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

  return (
    <g key="head">
      <rect x={point.x + 24} y={point.y - 22} width="50" height="20" rx="8" fill="#16a34a" />
      <text x={point.x + 49} y={point.y - 7} fill="#fff" textAnchor="middle" fontSize="12">
        {headText}
      </text>
    </g>
  )
}
