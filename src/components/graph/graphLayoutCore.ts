import { BASE_X, LANE_GAP, SIDE_PADDING, Y_GAP } from './graphConstants'
import type { Commit, HeadRef } from '../../git/types'
import { collectReachableCommits } from './graphUtils'
import type { GraphLayoutData } from './graphTypes'
import { buildEdgesForGraph, buildNodePoints } from './graphLayoutNodes'
import { buildEmptyGraphLayout } from './graphLayoutEmpty'
import { getCommitOrderKey, getLaneMeta } from './graphCommitOrder'

export const graphLayoutConfig = {
  laneGap: LANE_GAP,
  yGap: Y_GAP,
  sidePadding: SIDE_PADDING,
  baseX: BASE_X,
}

export function buildGraphData(
  commits: Record<string, Commit>,
  branches: Record<string, string | null>,
  lanes: Record<string, number>,
  head: HeadRef,
): GraphLayoutData {
  const nodes = Object.values(commits).sort((a, b) => {
    const aKey = getCommitOrderKey(a)
    const bKey = getCommitOrderKey(b)
    if (aKey.timestamp === bKey.timestamp) {
      const aHasNumeric = Number.isFinite(aKey.fallback)
      const bHasNumeric = Number.isFinite(bKey.fallback)
      if (aHasNumeric && bHasNumeric) {
        return bKey.fallback - aKey.fallback
      }
      if (aHasNumeric && !bHasNumeric) {
        return -1
      }
      if (!aHasNumeric && bHasNumeric) {
        return 1
      }

      return b.id.localeCompare(a.id)
    }

    return bKey.timestamp - aKey.timestamp
  })
  const branchEntries = Object.entries(branches)
  const latestCommitId = nodes.length > 0 ? nodes[0].id : null
  const reachableCommits = collectReachableCommits(commits, branches, head)
  const { laneIndexByValue, branchesByLane } = getLaneMeta(lanes, nodes)

  if (nodes.length === 0) {
    const hasBranches = branchEntries.length > 0
    if (!hasBranches) {
      return {
        nodes,
        positions: new Map(),
        edges: [],
        isEmpty: true,
        maxY: 180,
        width: 220,
        latestCommitId,
        reachableCommits,
        laneIndexByValue,
        branchesByLane,
        branchEntries,
        sidePadding: SIDE_PADDING,
        laneGap: LANE_GAP,
        baseX: BASE_X,
      }
    }

    const emptyLayout = buildEmptyGraphLayout(
      lanes,
      branchEntries,
      laneIndexByValue,
      reachableCommits,
    )

    return {
      ...emptyLayout,
      nodes,
      laneIndexByValue,
      branchesByLane,
      branchEntries,
      sidePadding: SIDE_PADDING,
      laneGap: LANE_GAP,
      baseX: BASE_X,
    }
  }

  const positions = buildNodePoints(nodes, laneIndexByValue)
  const edges = buildEdgesForGraph(nodes, positions, reachableCommits, latestCommitId)
  const maxLane = laneIndexByValue.size > 0 ? laneIndexByValue.size - 1 : 0

  return {
    nodes,
    positions,
    edges,
    isEmpty: false,
    maxY: nodes.length * Y_GAP + 60,
    width: maxLane * LANE_GAP + SIDE_PADDING * 2 + 170,
    latestCommitId,
    reachableCommits,
    laneIndexByValue,
    branchesByLane,
    branchEntries,
    sidePadding: SIDE_PADDING,
    laneGap: LANE_GAP,
    baseX: BASE_X,
  }
}
