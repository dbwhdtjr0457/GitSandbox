import { LANE_GAP, SIDE_PADDING } from './graphConstants'
import type { Commit } from '../../git/types'
import type { EdgeRenderData, GraphNodePoint } from './graphTypes'

export function buildEmptyGraphLayout(
  lanes: Record<string, number>,
  branchEntries: [string, string | null][],
  laneIndexByValue: Map<number, number>,
  reachableCommits: Set<string>,
) {
  const mappedLaneIndexes = branchEntries.map(([branchName]) => {
    const lane = lanes[branchName]
    return laneIndexByValue.get(lane ?? 0) ?? 0
  })
  const maxLaneIndex = mappedLaneIndexes.length > 0 ? Math.max(...mappedLaneIndexes) : 0
  const width = maxLaneIndex * LANE_GAP + SIDE_PADDING * 2 + 120

  return {
    nodes: [] as Commit[],
    positions: new Map<string, GraphNodePoint>(),
    edges: [] as EdgeRenderData[],
    isEmpty: true,
    maxY: 180,
    width,
    latestCommitId: null,
    reachableCommits,
  }
}
