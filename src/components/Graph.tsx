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

  if (nodes.length === 0) {
    return (
      <svg viewBox="0 0 700 200" className="graph-canvas">
        <text x="20" y="60" fill="#777">
          No commits yet
        </text>
      </svg>
    )
  }

  const positions = new Map<string, { x: number; y: number; commit: Commit }>()

  nodes.forEach((commit, index) => {
    positions.set(commit.id, {
      commit,
      x: commit.lane * 160 + 60,
      y: index * 70 + 40,
    })
  })

  const maxY = nodes.length * 70 + 60
  const laneValues = Object.values(lanes)
  const maxLane = laneValues.length > 0 ? Math.max(...laneValues) : 0
  const width = maxLane * 160 + 300

  const branchEntries = Object.entries(branches)

  return (
    <svg viewBox={`0 0 ${width} ${maxY}`} className="graph-canvas">
      {nodes.map((commit) => {
        const point = positions.get(commit.id)
        if (!point || !commit.parentId) {
          return null
        }
        const parentPoint = positions.get(commit.parentId)
        if (!parentPoint) {
          return null
        }

        const fromY = point.y + 22
        const toY = parentPoint.y - 22
        const curveMidY = (fromY + toY) / 2

        if (point.x === parentPoint.x) {
          return (
            <path
              key={`${commit.id}-edge`}
              d={`M ${point.x} ${fromY} V ${toY}`}
              stroke="#555"
              fill="none"
              strokeWidth="3"
            />
          )
        }

        return (
          <path
            key={`${commit.id}-edge`}
            d={`M ${point.x} ${fromY} Q ${point.x} ${curveMidY}, ${(point.x + parentPoint.x) / 2} ${curveMidY} T ${
              parentPoint.x
            } ${toY}`}
            stroke="#555"
            fill="none"
            strokeWidth="3"
          />
        )
      })}

      {nodes.map((commit) => {
        const point = positions.get(commit.id)
        if (!point) {
          return null
        }

        return (
          <g key={commit.id}>
            <circle cx={point.x} cy={point.y} r="18" fill="#3b82f6" />
            <text x={point.x} y={point.y + 6} textAnchor="middle" fill="#fff" fontSize="11">
              {commit.id}
            </text>
            <text x={point.x - 30} y={point.y - 30} fill="#444" fontSize="12">
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
            x={point.x + 34}
            y={point.y + 4}
            fill="#111"
            fontSize="12"
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
              <rect x={point.x + 26} y={point.y - 14} width="44" height="18" rx="9" fill="#16a34a" />
              <text x={point.x + 48} y={point.y - 2} fill="#fff" textAnchor="middle" fontSize="11">
                HEAD
              </text>
            </g>
          )
        })()
      ) : null}
    </svg>
  )
}
