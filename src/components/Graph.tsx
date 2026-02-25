import type { Commit, HeadRef } from '../git/types'

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

type EdgeRenderData = {
  id: string
  key: string
  d: string
  stroke: string
  strokeDash: string
  index: number
  animated: boolean
}

export function Graph({ commits, branches, head, lanes }: GraphProps) {
  const nodes = Object.values(commits).sort((a, b) => commitOrderKey(b.id) - commitOrderKey(a.id))
  const reachableCommits = collectReachableCommits(commits, branches, head)
  const laneGap = 120
  const yGap = 66
  const sidePadding = 48
  const baseX = 40
  const latestCommitId = nodes.length > 0 ? nodes[0].id : null

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

  const branchEntries = Object.entries(branches)
  const positions = new Map<string, { x: number; y: number; commit: Commit }>()
  const edges: EdgeRenderData[] = []
  const isEmpty = nodes.length === 0
  let maxY = 180
  let width = 0

  if (isEmpty) {
    const hasBranches = branchEntries.length > 0
    let maxLaneIndex = 0
    if (hasBranches) {
      const laneValuesForBranches = branchEntries.map(([name]) => {
        const lane = lanes[name]
        const mapped = laneIndexByValue.get(lane !== null && lane !== undefined ? lane : 0)
        return mapped !== undefined ? mapped : 0
      })
      maxLaneIndex = Math.max(...laneValuesForBranches)
    }

    width = maxLaneIndex * laneGap + sidePadding * 2 + 120
  } else {
    nodes.forEach((commit, index) => {
      const lane = laneIndexByValue.get(commit.lane ?? 0) ?? 0
      positions.set(commit.id, {
        commit,
        x: baseX + lane * laneGap,
        y: index * yGap + 40,
      })
    })

    maxY = nodes.length * yGap + 60
    const maxLane = laneValues.length > 0 ? laneValues.length - 1 : 0
    width = maxLane * laneGap + sidePadding * 2 + 170

    nodes.forEach((commit, index) => {
      const point = positions.get(commit.id)
      if (!point) {
        return
      }

      const isReachable = reachableCommits.has(commit.id)
      const stroke = isReachable ? '#555' : '#9ca3af'
      const strokeDash = isReachable ? '100' : '6 4'

      commit.parents.forEach((parentId) => {
        const parentPoint = positions.get(parentId)
        if (!parentPoint) {
          return
        }

        const fromY = point.y + 22
        const toY = parentPoint.y - 22
        const curveMidY = (fromY + toY) / 2
        const d =
          point.x === parentPoint.x
            ? `M ${point.x} ${fromY} V ${toY}`
            : `M ${point.x} ${fromY} Q ${point.x} ${curveMidY}, ${(point.x + parentPoint.x) / 2} ${curveMidY} T ${parentPoint.x} ${toY}`

        const id = `${commit.id}->${parentId}`
        edges.push({
          id,
          key: `${commit.id}-edge-${parentId}`,
          d,
          stroke,
          strokeDash,
          index,
          animated: latestCommitId !== null ? commit.id === latestCommitId : false,
        })
      })
    })
  }

  if (isEmpty) {
    const hasBranches = branchEntries.length > 0
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
              <text x={x + 12} y="170" fill="#334155" fontSize="12" textAnchor="start">
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
            <tspan x="20" y="54">Initialize repo and commit</tspan>
            <tspan x="20" y="70">to start graph</tspan>
          </text>
        ) : null}
      </svg>
    )
  }

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
            <text x={x + 12} y={maxY - 8} fill="#334155" fontSize="12" textAnchor="start">
              {names.join(', ')}
            </text>
          </g>
        )
      })}
      {edges.map((edge) => (
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

      {nodes.map((commit, index) => {
        const point = positions.get(commit.id)
        if (!point) {
          return null
        }
        const isReachable = reachableCommits.has(commit.id)
        const nodeFill = isReachable ? '#3b82f6' : '#9ca3af'
        const nodeStroke = isReachable ? '#2563eb' : '#6b7280'
        const badgeText = isReachable ? null : 'dangling'

        return (
          <g key={commit.id} className="graph-node" style={{ animationDelay: `${index * 60}ms` }}>
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
                <text x={point.x} y={point.y + 30} fill="#f9fafb" textAnchor="middle" fontSize="10">
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
          <text key={`branch-${name}`} x={point.x + 28} y={point.y + 5} fill="#111" fontSize="14">
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
              <text x={point.x + 49} y={point.y - 7} fill="#fff" textAnchor="middle" fontSize="12">
                HEAD
              </text>
            </g>
          )
        })()
      ) : null}
    </svg>
  )
}
