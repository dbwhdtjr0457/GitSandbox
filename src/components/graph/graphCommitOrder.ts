import type { Commit } from '../../git/types'

export function getCommitOrderKey(id: string): number {
  const numeric = Number(id.replace(/^c/, ''))
  return Number.isNaN(numeric) ? 0 : numeric
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
