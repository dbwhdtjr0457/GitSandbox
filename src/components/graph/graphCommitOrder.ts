import type { Commit } from '../../git/types'

function getCommitNumberFromId(id: string): number {
  const match = /^c(\d+)$/.exec(id)
  if (!match) {
    return -1
  }

  const numeric = Number(match[1])
  return Number.isNaN(numeric) ? -1 : numeric
}

export function getCommitOrderKey(commit: Commit): { timestamp: number; fallback: number } {
  const ts = Number(commit.timestamp)
  const timestamp = Number.isFinite(ts) ? ts : Number.NEGATIVE_INFINITY
  const parsed = getCommitNumberFromId(commit.id)
  const fallback = Number.isInteger(parsed) ? parsed : Number.NaN
  return {
    timestamp,
    fallback,
  }
}

export function getLaneMeta(lanes: Record<string, number>, nodes: Commit[]) {
  const laneValuesSet = new Set<number>()
  nodes.forEach((commit) => {
    laneValuesSet.add(commit.lane ?? 0)
  })
  Object.values(lanes).forEach((lane) => {
    laneValuesSet.add(lane ?? 0)
  })
  const laneValues = Array.from(laneValuesSet).sort((a, b) => a - b)
  const laneIndexByValue = new Map<number, number>()
  laneValues.forEach((laneValue, index) => {
    laneIndexByValue.set(laneValue, index)
  })

  const branchesByLane = laneValues.map((laneValue) => ({
    laneValue,
    names: Object.entries(lanes)
      .filter(([, lane]) => (lane ?? 0) === laneValue)
      .map(([name]) => name),
  }))

  return { laneValues, laneIndexByValue, branchesByLane }
}
