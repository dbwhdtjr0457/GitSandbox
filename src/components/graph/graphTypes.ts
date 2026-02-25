import type { Commit, HeadRef } from '../../git/types'

export type GraphProps = {
  commits: Record<string, Commit>
  branches: Record<string, string | null>
  head: HeadRef
  lanes: Record<string, number>
}

export type GraphNodePoint = {
  x: number
  y: number
  commit: Commit
}

export type EdgeRenderData = {
  id: string
  key: string
  d: string
  stroke: string
  strokeDash: string
  index: number
  animated: boolean
}

export type GraphLayoutData = {
  nodes: Commit[]
  positions: Map<string, GraphNodePoint>
  edges: EdgeRenderData[]
  isEmpty: boolean
  maxY: number
  width: number
  latestCommitId: string | null
  reachableCommits: Set<string>
  laneIndexByValue: Map<number, number>
  branchesByLane: { laneValue: number; names: string[] }[]
  branchEntries: [string, string | null][]
  sidePadding: number
  laneGap: number
  baseX: number
}
