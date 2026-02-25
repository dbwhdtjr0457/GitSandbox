import type { HeadRef } from '../git/types'
import type { Commit } from '../git/types'

type GraphProps = {
  commits: Record<string, Commit>
  branches: Record<string, string | null>
  head: HeadRef
  lanes: Record<string, number>
}

function commitOrderKey(id: string): number {
  const numeric = Number(id.replace(/^c/, ''))
  return Number.isNaN(numeric) ? 0 : numeric
}

function collectReachableCommits(
  commits: Record<string, Commit>,
  branches: Record<string, string | null>,
  head: HeadRef,
): Set<string> {
  const reachable = new Set<string>()
  const stack: string[] = []

  Object.values(branches).forEach((commitId) => {
    if (commitId) {
      stack.push(commitId)
    }
  })

  if (head.commitId) {
    stack.push(head.commitId)
  }

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || reachable.has(current)) {
      continue
    }

    const commit = commits[current]
    if (!commit) {
      continue
    }

    reachable.add(current)
    for (const parentId of commit.parents) {
      if (parentId) {
        stack.push(parentId)
      }
    }
  }

  return reachable
}

export function Graph({ commits, branches, head, lanes }: GraphProps) {
  const nodes = Object.values(commits).sort((a, b) => commitOrderKey(b.id) - commitOrderKey(a.id))
  const reachableCommits = collectReachableCommits(commits, branches, head)
  const laneGap = 120
  const yGap = 66
  const sidePadding = 48
  const baseX = 40
  const nodeR = 16

  const laneSet = new Set<number>()
  nodes.forEach((commit) => {
    laneSet.add(commit.lane ?? 0)
  })
  Object.values(lanes).forEach((lane) => {
    laneSet.add(lane ?? 0)
  })

  const laneValues = Array.from(laneSet).sort((a, b) => a - b)
  const laneIndexByValue = new Map<number, number>()
  laneValues.forEach((lane, index) => {
    laneIndexByValue.set(lane, index)
  })
  const branchesByLane = laneValues.map((laneValue) => ({
    laneValue,
    names: Object.entries(lanes)
      .filter(([, lane]) => (lane ?? 0) === laneValue)
      .map(([name]) => name),
  }))

  if (nodes.length === 0) {
    const branchEntries = Object.entries(branches)
    const hasBranches = branchEntries.length > 0
    const maxLaneIndex = hasBranches
      ? Math.max(...branchEntries.map(([name]) => laneIndexByValue.get(lanes[name] ?? 0) ?? 0))
      : 0
    const width = maxLaneIndex * laneGap + sidePadding * 2 + 120
    return (
      <svg
        viewBox={`0 0 ${width} 180`}
        className="graph-canvas"
        preserveAspectRatio="xMidYMid meet"
        style={{ height: `max(100%, 180px)`, width: '100%', minWidth: `${width}px` }}
      >
        <rect x="0" y="0" width={width} height="28" fill="#f8fafc" />
        {branchesByLane.map(({ laneValue, names }) => {
          const index = laneIndexByValue.get(laneValue) ?? 0
          const x = baseX + index * laneGap
          if (names.length === 0) {
            return null
          }
          return (
            <g key={`lane-label-empty-${laneValue}`}>
              <line x1={x} y1="28" x2={x} y2="180" stroke="#cbd5e1" strokeWidth="1.8" />
              <text
                x={x + 12}
                y="170"
                fill="#334155"
                fontSize="12"
                textAnchor="start"
              >
                {names.join(', ')}
              </text>
            </g>
          )
        })}
        <text x="20" y="28" fill="#777" fontSize="14">
          No commits yet
        </text>
        {!hasBranches ? (
          <text x="20" y="76" fill="#777" fontSize="14">
            <tspan x="20" y="54">
              Initialize repo and commit
            </tspan>
            <tspan x="20" y="70">
              to start graph
            </tspan>
          </text>
        ) : null}
      </svg>
    )
  }

  const positions = new Map<string, { x: number; y: number; commit: Commit }>()

  nodes.forEach((commit, index) => {
    const lane = laneIndexByValue.get(commit.lane ?? 0) ?? 0
    positions.set(commit.id, {
      commit,
      x: baseX + lane * laneGap,
      y: index * yGap + 40,
    })
  })

  const maxY = nodes.length * yGap + 60
  const maxLane = laneValues.length > 0 ? laneValues.length - 1 : 0
  const width = maxLane * laneGap + sidePadding * 2 + 170
  const branchEntries = Object.entries(branches)

  return (
      <svg
        viewBox={`0 0 ${width} ${maxY}`}
        className="graph-canvas"
        preserveAspectRatio="xMinYMin meet"
        style={{ height: `max(100%, ${maxY}px)`, width: '100%', minWidth: `${width}px` }}
      >
      <rect x="0" y="0" width={width} height="28" fill="#f8fafc" />
        {branchesByLane.map(({ laneValue, names }) => {
          const index = laneIndexByValue.get(laneValue) ?? 0
          const x = baseX + index * laneGap
          if (names.length === 0) {
            return null
          }
        return (
          <g key={`lane-label-${laneValue}`}>
            <line x1={x} y1="28" x2={x} y2={maxY} stroke="#cbd5e1" strokeWidth="1.8" />
            <text
              x={x + 12}
              y={maxY - 8}
              fill="#334155"
              fontSize="12"
              textAnchor="start"
            >
              {names.join(', ')}
            </text>
          </g>
        )
      })}
      {nodes.map((commit) => {
    const point = positions.get(commit.id)
    if (!point) {
      return null
    }

        const isReachable = reachableCommits.has(commit.id)

        return commit.parents.map((parentId) => {
          const parentPoint = positions.get(parentId)
          if (!parentPoint) {
            return null
          }

          const fromY = point.y + 22
          const toY = parentPoint.y - 22
          const curveMidY = (fromY + toY) / 2

          if (point.x === parentPoint.x) {
            return (
              <path
                key={`${commit.id}-edge-${parentId}`}
                d={`M ${point.x} ${fromY} V ${toY}`}
                stroke={isReachable ? '#555' : '#9ca3af'}
                fill="none"
                strokeWidth="2.2"
                strokeDasharray={isReachable ? undefined : '6 4'}
              />
            )
          }

          return (
            <path
              key={`${commit.id}-edge-${parentId}`}
              d={`M ${point.x} ${fromY} Q ${point.x} ${curveMidY}, ${(point.x + parentPoint.x) / 2} ${curveMidY} T ${parentPoint.x} ${toY}`}
              stroke={isReachable ? '#555' : '#9ca3af'}
              fill="none"
              strokeWidth="2.2"
              strokeDasharray={isReachable ? undefined : '6 4'}
            />
          )
        })
      })}

      {nodes.map((commit) => {
        const point = positions.get(commit.id)
        if (!point) {
          return null
        }
        const isReachable = reachableCommits.has(commit.id)
        const nodeFill = isReachable ? '#3b82f6' : '#9ca3af'
        const nodeStroke = isReachable ? '#2563eb' : '#6b7280'
        const badgeText = isReachable ? null : 'dangling'

        return (
          <g key={commit.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r="18"
              fill={nodeFill}
              stroke={nodeStroke}
              strokeWidth="2.5"
              strokeDasharray={isReachable ? undefined : '6 4'}
            />
            <text x={point.x} y={point.y + 6} textAnchor="middle" fill="#fff" fontSize="14">
              {commit.id}
            </text>
            <text x={point.x - 30} y={point.y - 28} fill="#444" fontSize="13">
              {commit.message}
            </text>
            {badgeText ? (
              <g>
                <rect
                  x={point.x - 30}
                  y={point.y + 18}
                  width="60"
                  height="16"
                  rx="8"
                  fill="#4b5563"
                />
                <text
                  x={point.x}
              y={point.y + 30}
                  fill="#f9fafb"
                  textAnchor="middle"
                  fontSize="10"
                >
                  {badgeText}
                </text>
              </g>
            ) : null}
          </g>
        )
      })}

      {branchEntries.map(([name, commitId]) => {
        if (!commitId) {
          return null
        }
        const point = positions.get(commitId)
        if (!point) {
          return null
        }
        return (
            <text
              key={`branch-${name}`}
              x={point.x + 28}
              y={point.y + 5}
              fill="#111"
              fontSize="14"
            >
              {name}
            </text>
        )
      })}

      {head.commitId ? (
        (() => {
          const point = positions.get(head.commitId)
          if (!point) {
            return null
          }
          return (
            <g key="head">
              <rect x={point.x + 24} y={point.y - 22} width="50" height="20" rx="8" fill="#16a34a" />
              <text
                x={point.x + 49}
                y={point.y - 7}
                fill="#fff"
                textAnchor="middle"
                fontSize="12"
              >
                HEAD
              </text>
            </g>
          )
        })()
      ) : null}
    </svg>
  )
}
