export function buildEdgePath(
  fromY: number,
  toY: number,
  fromX: number,
  toX: number,
): string {
  const midY = (fromY + toY) / 2
  if (fromX === toX) {
    return `M ${fromX} ${fromY} V ${toY}`
  }
  return `M ${fromX} ${fromY} Q ${fromX} ${midY}, ${(fromX + toX) / 2} ${midY} T ${toX} ${toY}`
}
