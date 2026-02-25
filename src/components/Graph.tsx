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

export function Graph({ commits, branches, head, lanes }: GraphProps) {
  const nodes = Object.values(commits).sort((a, b) => commitOrderKey(b.id) - commitOrderKey(a.id))
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

  if (nodes.length === 0) {
    const branchEntries = Object.entries(branches)
    const hasBranches = branchEntries.length > 0
    const maxLaneIndex = hasBranches
      ? Math.max(...branchEntries.map(([name]) => laneIndexByValue.get(lanes[name] ?? 0) ?? 0))
      : 0
    const width = maxLaneIndex * laneGap + sidePadding * 2 + 120
    const svgStyle = { width: `min(100%, ${width}px)`, margin: '0 auto' }
    return (
      <svg viewBox={`0 0 ${width} 180`} className="graph-canvas" style={svgStyle}>
        <text x="20" y="28" fill="#777" fontSize="14">
          No commits yet
        </text>
        {!hasBranches ? (
          <text x="20" y="56" fill="#777" fontSize="14">
            <tspan x="20" y="54">
              Initialize repo and commit
            </tspan>
            <tspan x="20" y="70">
              to start graph
            </tspan>
          </text>
        ) : (
          branchEntries.map(([name]) => {
            const lane = laneIndexByValue.get(lanes[name] ?? 0) ?? 0
            const x = baseX + lane * laneGap
            const isHead = head.type === 'symbolic' && head.branch === name
            return (
              <g key={`branch-empty-${name}`}>
                <line x1={x} y1="50" x2={x} y2="150" stroke="#94a3b8" strokeWidth="2.4" />
                <circle cx={x} cy="95" r={nodeR} fill="#fff" stroke="#475569" strokeWidth="2.4" />
                <text x={x + 20} y="98" fill="#1f2937" fontSize="14">
                  {name}
                </text>
                {isHead ? (
                  <g>
                    <rect x={x - 34} y="76" width="44" height="20" rx="8" fill="#16a34a" />
                    <text x={x - 12} y="92" fill="#fff" textAnchor="middle" fontSize="12">
                      HEAD
                    </text>
                  </g>
                ) : null}
              </g>
            )
          })
        )}
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
  const svgStyle = { width: `min(100%, ${width}px)`, margin: '0 auto' }

  const branchEntries = Object.entries(branches)

  return (
    <svg viewBox={`0 0 ${width} ${maxY}`} className="graph-canvas" style={svgStyle}>
      {nodes.map((commit) => {
        const point = positions.get(commit.id)
        if (!point) {
          return null
        }

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
                stroke="#555"
                fill="none"
                strokeWidth="2.2"
              />
            )
          }

          return (
            <path
              key={`${commit.id}-edge-${parentId}`}
              d={`M ${point.x} ${fromY} Q ${point.x} ${curveMidY}, ${(point.x + parentPoint.x) / 2} ${curveMidY} T ${parentPoint.x} ${toY}`}
              stroke="#555"
              fill="none"
              strokeWidth="2.2"
            />
          )
        })
      })}

      {nodes.map((commit) => {
        const point = positions.get(commit.id)
        if (!point) {
          return null
        }

        return (
          <g key={commit.id}>
            <circle cx={point.x} cy={point.y} r="18" fill="#3b82f6" />
            <text x={point.x} y={point.y + 6} textAnchor="middle" fill="#fff" fontSize="14">
              {commit.id}
            </text>
            <text x={point.x - 30} y={point.y - 28} fill="#444" fontSize="13">
              {commit.message}
            </text>
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
