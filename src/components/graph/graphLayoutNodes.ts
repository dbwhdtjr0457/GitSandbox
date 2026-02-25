import { BASE_X, LANE_GAP, Y_GAP } from './graphConstants'
import type { Commit } from '../../git/types'
import type { EdgeRenderData, GraphNodePoint } from './graphTypes'
import { buildEdgePath } from './graphPath'

export function buildNodePoints(nodes: Commit[], laneIndexByValue: Map<number, number>) {
  const positions = new Map<string, GraphNodePoint>()

  nodes.forEach((commit, index) => {
    const laneIndex = laneIndexByValue.get(commit.lane ?? 0) ?? 0
    positions.set(commit.id, {
      commit,
      x: BASE_X + laneIndex * LANE_GAP,
      y: index * Y_GAP + 40,
    })
  })

  return positions
}

export function buildEdgesForGraph(
  nodes: Commit[],
  positions: Map<string, GraphNodePoint>,
  reachableCommits: Set<string>,
  latestCommitId: string | null,
) {
  const edges: EdgeRenderData[] = []

  nodes.forEach((commit, index) => {
    const point = positions.get(commit.id)
    if (!point) {
      return
    }

    const isReachable = reachableCommits.has(commit.id)
    const stroke = isReachable ? '#555' : '#9ca3af'
    const strokeDash = isReachable ? '100' : '6 4'
    const animated = latestCommitId !== null && commit.id === latestCommitId

    for (const parentId of commit.parents) {
      const parentPoint = positions.get(parentId)
      if (!parentPoint) {
        continue
      }
      edges.push({
        id: `${commit.id}->${parentId}`,
        key: `${commit.id}-edge-${parentId}`,
        d: buildEdgePath(point.y + 22, parentPoint.y - 22, point.x, parentPoint.x),
        stroke,
        strokeDash,
        index,
        animated,
      })
    }
  })

  return edges
}
